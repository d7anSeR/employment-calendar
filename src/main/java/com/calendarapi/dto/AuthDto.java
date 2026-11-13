package com.calendarapi.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthDto {


    private Long id;
    private String name;
    private String email;
    private String role;
    private String token;
}
