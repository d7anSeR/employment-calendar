package com.calendarapi.controller;

import com.calendarapi.dto.AuthDto;
import com.calendarapi.dto.EmployeeDto;
import com.calendarapi.model.Employee;
import com.calendarapi.service.EmployeeService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @PostMapping
    public ApiResponse<AuthDto> authenticate(@RequestBody EmployeeDto request) {
        boolean result = service.authenticate(request.getEmail(), request.getPassword());
        if (!result) {
            return new ApiResponse<>(false, "Неверный email или пароль", null);
        }
        Employee employee = service.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = service.generateToken(request.getEmail(), employee.getRole());
        AuthDto response = new AuthDto(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getRole(),
                token
        );
        return new ApiResponse<>(true, "Аутентификация успешна", response);
    }


    @GetMapping
    public ApiResponse<List<Employee>> getAllEmployees(@AuthenticationPrincipal Jwt jwt) {
        Employee employee = service.findByEmail(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден"));
        List<Employee> employees = service.findAll();
        return new ApiResponse<>(true, "Список сотрудников получен", employees);
    }
}

