package com.calendarapi.service;

import com.calendarapi.dto.EmployeeRequest;
import com.calendarapi.model.Employee;
import com.calendarapi.repository.EmployeeRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class EmployeeService {

    private final EmployeeRepository repository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean authenticate(String email, String rawPassword) {
        return repository.findByEmail(email)
                .map(employee -> passwordEncoder.matches(rawPassword, employee.getPassword()))
                .orElse(false);
    }

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

        return repository.save(employee);
    }

    public Employee updateEmployee(EmployeeRequest request) {
        Employee employee = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Пользователь с таким email не найден"));
        if (request.getName() != null && !request.getName().isEmpty()) {
            employee.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            employee.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return repository.save(employee);
    }

    public void deleteEmployee(EmployeeRequest request) {
        Employee employee = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Пользователь с таким email не найден"));
        repository.delete(employee);
    }
}
