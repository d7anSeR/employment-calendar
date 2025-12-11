package com.calendarapi.controller;

import com.calendarapi.config.AdminGuard;
import com.calendarapi.config.AuthUtil;
import com.calendarapi.dto.EmployeeRequest;
import com.calendarapi.model.ApiResponse;
import com.calendarapi.model.Employee;
import com.calendarapi.service.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/webhook/employee")
public class AdminEmployeeController {

    private final EmployeeService service;
    private final AuthUtil authUtil;
    private final AdminGuard adminGuard;

    public AdminEmployeeController(EmployeeService service,
                                   AuthUtil authUtil,
                                   AdminGuard adminGuard) {
        this.service = service;
        this.authUtil = authUtil;
        this.adminGuard = adminGuard;
    }

    @PostMapping("/create")
    public ApiResponse<?> create(@Valid @RequestBody EmployeeRequest request,
                                 BindingResult bindingResult,
                                 HttpServletRequest req) {
        if (bindingResult.hasErrors()) {
            StringBuilder errors = new StringBuilder();
            bindingResult.getFieldErrors().forEach(err ->
                    errors.append(err.getDefaultMessage()).append("; "));
            return new ApiResponse<>(false, "Ошибка добавления: " + errors.toString());
        }

        try {
            String email = authUtil.extractEmail(req);
            adminGuard.checkAdmin(email);
            Employee employee = service.createEmployee(request);
            return new ApiResponse<>(true, "Пользователь создан", employee);
        } catch (Exception e) {
            return new ApiResponse<>(false, "Ошибка добавления: " + e.getMessage());
        }
    }

    @PatchMapping("/update")
    public ApiResponse<?> update(@Valid @RequestBody EmployeeRequest request,
                                 BindingResult bindingResult,
                                 HttpServletRequest req) {
        try {
            String email = authUtil.extractEmail(req);
            adminGuard.checkAdmin(email);
            Employee employee = service.updateEmployee(request);
            return new ApiResponse<>(true, "Пользователь обновлен", employee);
        } catch (Exception e) {
            return new ApiResponse<>(false, "Ошибка обновления: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public ApiResponse<?> delete(@Valid @RequestBody EmployeeRequest request,
                                 BindingResult bindingResult,
                                 HttpServletRequest req) {

        try {
            String email = authUtil.extractEmail(req);
            adminGuard.checkAdmin(email);
            service.deleteEmployee(request);
            return new ApiResponse<>(true, "Пользователь удален");
        } catch (Exception e) {
            return new ApiResponse<>(false, "Ошибка удаления: " + e.getMessage());
        }
    }
}
