package com.calendarapi.controller;

import com.calendarapi.model.ApiResponse;
import com.calendarapi.model.ScheduleEntry;
import com.calendarapi.repository.ScheduleEntryRepository;
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
public class LuvrWebhookController {

    private final ScheduleEntryRepository repository;

    public LuvrWebhookController(ScheduleEntryRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/schedule")
    public ApiResponse<?> receiveSchedule(@Valid @RequestBody ScheduleEntry schedule, BindingResult bindingResult) {
        // Проверяем ошибки валидации
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return new ApiResponse<>(false, "Ошибка валидации", errors);
        }

        try {
            repository.save(schedule); // сохраняем в БД
            return new ApiResponse<>(true, "Данные успешно приняты");
        } catch (Exception e) {
            return new ApiResponse<>(false, "Ошибка при сохранении: " + e.getMessage());
        }
    }
}
