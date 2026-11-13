package com.calendarapi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    @NotNull(message = "Поле name сотрудника обязательно")
    private String name;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Поле email сотрудника обязательно")
    private String email;

    @Column(nullable = false)
    @NotBlank(message = "Поле пароль сотрудника обязательно")
    private String password;

    @Column(nullable = false)
    @NotBlank(message = "Поле роли сотрудника обязательно")
    private String role;

    @OneToMany(mappedBy = "employee")
    private List<ScheduleEntry> scheduleEntryList = new ArrayList<>();

    public Employee() {
    }
}
