package com.calendarapi.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    private Long id;
    @Column(name = "name")
    @NotNull(message = "Поле имя сотрудника обязательно")
    private String name;
    @Column(name = "email")
    @NotNull(message = "Поле email сотрудника обязательно")
    private String email;
    @Column(name = "password")
    @NotBlank(message = "Поле пароль сотрудника обязательно")
    private String password;

    public Employee() {
    }

    public Employee(Long id, String name, String email, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }


    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
