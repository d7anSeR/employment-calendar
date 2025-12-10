package com.calendarapi.controller;

import com.calendarapi.dto.EmployeeRequest;
import com.calendarapi.model.ApiResponse;
import com.calendarapi.model.Employee;
import com.calendarapi.repository.EmployeeRepository;
import com.calendarapi.service.EmployeeService;
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
    public ApiResponse<Boolean> authenticate(@RequestBody EmployeeRequest request) {
        boolean result = service.authenticate(request.getEmail(), request.getPassword());
        if (result) {
            return new ApiResponse<>(true, "Аутентификация успешна", true);
        } else {
            return new ApiResponse<>(false, "Неверный email или пароль", false);
        }
    }

    @PostMapping("/employee")
    public ApiResponse<Employee> addEmployee(@RequestBody EmployeeRequest request) {
        try {
            Employee employee = service.createEmployee(request);
            return new ApiResponse<>(true, "Пользователь создан", employee);
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @PutMapping("/employee")
    public ApiResponse<Employee> updateEmployee(@RequestBody EmployeeRequest request) {
        try {
            Employee employee = service.updateEmployee(request);
            return new ApiResponse<>(true, "Пользователь обновлен", employee);
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage());
        }
    }

    @GetMapping("/employees")
    public ApiResponse<List<Employee>> getAllEmployees() {
        List<Employee> employees = EmployeeRepository.findAll();
        return new ApiResponse<>(true, "Список пользователей получен", employees);
    }

    @DeleteMapping("/employee")
    public ApiResponse<List<Employee>> deleteEmployee(@RequestBody EmployeeRequest request) {
        try {
            service.deleteEmployee(request);
            return new ApiResponse<>(true, "Пользователь удален");
        } catch (Exception e) {
            return new ApiResponse<>(false, e.getMessage());
        }
    }
}

