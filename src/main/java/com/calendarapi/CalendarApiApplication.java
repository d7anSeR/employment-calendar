package com.calendarapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan("com.calendarapi.model")
public class CalendarApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(CalendarApiApplication.class, args);
    }
}