package com.calendarapi.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EmployeeRequest {
    @NotNull(message = "Поле id сотрудника обязательно")
    private Long id;
    @NotNull(message = "Поле имя сотрудника обязательно")
    private String name;
    @NotNull(message = "Поле email сотрудника обязательно")
    private String email;
    @NotBlank(message = "Поле пароль сотрудника обязательно")
    private String password;
    @NotBlank(message = "Поле роли сотрудника обязательно")
    private String role;

    public EmployeeRequest() {
    }

    public EmployeeRequest(Long id, String name, String email, String password, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
