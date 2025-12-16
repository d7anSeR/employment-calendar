package com.calendarapi.service;

import com.calendarapi.dto.EmployeeRequest;
import com.calendarapi.dto.EmployeeUpdateRequest;
import com.calendarapi.model.Employee;
import com.calendarapi.repository.EmployeeRepository;
import com.calendarapi.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;



@Service
public class EmployeeService {

    private final EmployeeRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private static final Logger log =
            LoggerFactory.getLogger(EmployeeService.class);
    String actor = SecurityUtils.currentUser();

    public EmployeeService(EmployeeRepository repository,
                           PasswordEncoder passwordEncoder,
                           JwtEncoder jwtEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }

    public String generateToken(String email, String role) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("calendar-api")
                .issuedAt(now)
                .claim("roles", List.of(role))
                .expiresAt(now.plusSeconds(43200))
                .subject(email)
                .build();
        log.info("JWT ISSUED | email={} | role={}", email, role);
        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

    }

    public boolean authenticate(String email, String rawPassword) {
        return repository.findByEmail(email)
                .map(employee -> {
                    boolean match = passwordEncoder.matches(rawPassword, employee.getPassword());
                    if (match) {
                        log.info("SUCCESS LOGIN | email={}", email);
                    } else {
                        log.warn("FAILED LOGIN | email={}", email);
                    }
                    return match;
                })
                .orElseGet(() -> {
                    log.warn("FAILED LOGIN | email={} | reason=NOT_FOUND", email);
                    return false;
                });
    }

    @Transactional
    public Employee createEmployee(EmployeeRequest request) {
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }
        if (repository.findById(request.getId()).isPresent()) {
            throw new RuntimeException("Пользователь с таким id уже существует");
        }

        Employee employee = new Employee();

        employee.setId(request.getId());
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setRole(request.getRole());
        log.info("EMPLOYEE CREATED | by=ADMIN | email={} | targetEmail={} | targetId={}",
                actor, request.getEmail(), request.getId());
        return repository.save(employee);
    }

    @Transactional
    public Employee updateEmployee(EmployeeUpdateRequest request) {
        Employee employee = repository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Пользователь с таким id не найден"));
        if (request.getName() != null && !request.getName().isEmpty()) {
            employee.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            employee.setEmail(request.getEmail());
        }
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            employee.setRole(request.getRole());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        log.info("EMPLOYEE UPDATE | by=ADMIN | email={} | targetEmail={} | targetId={}",
                actor, request.getEmail(), request.getId());

        return repository.save(employee);
    }

    public void deleteEmployee(EmployeeUpdateRequest request) {
        Employee employee = repository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Пользователь с таким id не найден"));
        repository.delete(employee);
        log.info("EMPLOYEE DELETE | by=ADMIN | email={} | targetEmail={} | targetId={}",
                actor, request.getEmail(), request.getId());
    }
}
