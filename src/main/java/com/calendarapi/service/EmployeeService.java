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

    // Метод для аутентификации
    public boolean authenticate(String email, String rawPassword) {
        return repository.findByEmail(email)
                .map(employee -> passwordEncoder.matches(rawPassword, employee.getPassword()))
                .orElse(false);
    }

    // Создание или обновление пользователя
    public Employee createOrUpdateEmployee(EmployeeRequest request) {
        Employee employee = repository.findByEmail(request.getEmail())
                .orElse(new Employee()); // создаём нового, если не найден

        employee.setId(request.getId()); // используем id из запроса
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return repository.save(employee);
    }

}
