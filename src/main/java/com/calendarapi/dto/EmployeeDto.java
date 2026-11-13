package com.calendarapi.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class EmployeeDto {
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

    public EmployeeDto() {
    }
}
