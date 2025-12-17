package com.calendarapi;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan("com.calendarapi.model")
public class CalendarApiApplication {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.load(); // загружает .env
        System.setProperty("DB_URL", dotenv.get("DB_URL"));
        System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME"));
        System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
        System.setProperty("CERTIFICATE_KEY_PASSWORD", dotenv.get("CERTIFICATE_KEY_PASSWORD"));
        SpringApplication.run(CalendarApiApplication.class, args);
    }
}