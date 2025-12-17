package com.calendarapi.controller;

import com.calendarapi.dto.AuthResponse;
import com.calendarapi.dto.EmployeeRequest;
import com.calendarapi.model.ApiResponse;
import com.calendarapi.model.Employee;
import com.calendarapi.repository.EmployeeRepository;
import com.calendarapi.service.EmployeeService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/webhook")
public class EmployeeController {

    private final EmployeeRepository EmployeeRepository;
    private final EmployeeService service;

    public EmployeeController(EmployeeRepository EmployeeRepository,
                              EmployeeService service) {
        this.EmployeeRepository = EmployeeRepository;
        this.service = service;
    }

    @PostMapping("/employee/auth")
    public ApiResponse<AuthResponse> authenticate(@RequestBody EmployeeRequest request) {
        boolean result = service.authenticate(request.getEmail(), request.getPassword());
        if (!result) {
            return new ApiResponse<>(false, "Неверный email или пароль", null);
        }
        Employee employee = EmployeeRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = service.generateToken(request.getEmail(), employee.getRole());
        AuthResponse response = new AuthResponse(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getRole(),
                token
        );
        return new ApiResponse<>(true, "Аутентификация успешна", response);
    }


    @GetMapping("/employees")
    public ApiResponse<List<Employee>> getAllEmployees(@AuthenticationPrincipal Jwt jwt) {
        Employee employee = EmployeeRepository.findByEmail(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден"));
        List<Employee> employees = EmployeeRepository.findAll();
        return new ApiResponse<>(true, "Список сотрудников получен", employees);
    }
}

