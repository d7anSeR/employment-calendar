package com.calendarapi.controller;

import com.calendarapi.model.ApiResponse;
import com.calendarapi.model.ScheduleEntry;
import com.calendarapi.repository.ScheduleEntryRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhook")
public class LuvrWebhookController {

    private final ScheduleEntryRepository repository;

    public LuvrWebhookController(ScheduleEntryRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/schedule")
    public ApiResponse<String> receiveSchedule(@RequestBody ScheduleEntry schedule) {
        try {
            repository.save(schedule); // сохраняем в БД
            return new ApiResponse<>(true, "Данные успешно приняты");
        } catch (Exception e) {
            return new ApiResponse<>(false, "Ошибка при сохранении: " + e.getMessage());
        }
    }
}
