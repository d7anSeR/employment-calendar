package com.calendarapi.controller;

import com.calendarapi.dto.EmployeeDto;
import com.calendarapi.model.Employee;
import com.calendarapi.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminEmployeeController {

    private final EmployeeService service;

    public AdminEmployeeController(EmployeeService service) {
        this.service = service;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<?> create(@Valid @RequestBody EmployeeDto request) {
        Employee employee = service.createEmployee(request);
        return new ApiResponse<>(true, "Пользователь создан", employee);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping
    public ApiResponse<Employee> update(
            @Valid @RequestBody EmployeeUpdateRequest request
    ) {
        Employee employee = service.updateEmployee(request);
        return new ApiResponse<>(true, "Пользователь обновлен", employee);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping
    public ApiResponse<?> delete(@Valid @RequestBody EmployeeUpdateRequest request) {
        service.deleteEmployee(request);
        return new ApiResponse<>(true, "Пользователь удален");
    }
}
