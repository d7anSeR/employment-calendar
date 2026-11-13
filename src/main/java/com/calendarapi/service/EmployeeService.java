package com.calendarapi.service;

import com.calendarapi.dto.EmployeeDto;
import com.calendarapi.mapping.EmployeeMapper;
import com.calendarapi.model.Employee;
import com.calendarapi.repository.EmployeeRepository;
import com.calendarapi.security.SecurityUtils;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    private final EmployeeMapper mapper;
    String actor = SecurityUtils.currentUser();

    public EmployeeService(EmployeeRepository repository,
                           PasswordEncoder passwordEncoder,
                           JwtEncoder jwtEncoder, EmployeeMapper mapper) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.mapper = mapper;
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
        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

    }

    public boolean authenticate(String email, String rawPassword) {
        return repository.findByEmail(email)
                .map(employee -> {
                    boolean match = passwordEncoder.matches(rawPassword, employee.getPassword());
                    return match;
                })
                .orElseGet(() -> { return false;});
    }

    public EmployeeDto findByEmail(String email) {
        return repository.findByEmail(email)
                .map(mapper::toDto)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден"));
    }

    public List<EmployeeDto> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional
    public Employee createEmployee(Employee request) {
        if (existEmployee(request)) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }

        Employee employee = new Employee();

        employee.setId(request.getId());
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setRole(request.getRole());
        repository.save(employee);
        return request;
    }

    @Transactional
    public Employee updateEmployee(Employee request) {
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

        return repository.save(employee);
    }
    private boolean existEmployee(Employee employee){
        return repository.findByEmail(employee.getEmail()).isPresent();
    }

    public void deleteEmployee(Employee employee) {
        if (!existEmployee(employee))
            new RuntimeException("Пользователь с таким id не найден");
        repository.save(employee);
    }
}
