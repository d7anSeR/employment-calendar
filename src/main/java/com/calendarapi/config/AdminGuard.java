package com.calendarapi.config;

import com.calendarapi.model.Employee;
import com.calendarapi.repository.EmployeeRepository;
import org.springframework.stereotype.Component;

@Component
public class AdminGuard {

    private final EmployeeRepository employeeRepository;

    public AdminGuard(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employee checkAdmin(String email) {
        Employee emp = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        if (!"ADMIN".equals(emp.getRole())) {
            throw new RuntimeException("Недостаточно прав: требуется роль ADMIN");
        }

        return emp;
    }
}

