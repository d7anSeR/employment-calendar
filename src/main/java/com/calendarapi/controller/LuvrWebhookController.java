package com.calendarapi.controller;

import com.calendarapi.dto.ScheduleDto;
import com.calendarapi.model.ScheduleEntry;
import com.calendarapi.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
public class LuvrWebhookController {

    private final ScheduleService service;

    public LuvrWebhookController(ScheduleService service) {
        this.service = service;
    }

    @PostMapping
    public ApiResponse<?> receiveSchedule(@Valid @RequestBody ScheduleEntry schedule,
                                          BindingResult bindingResult,
                                          @AuthenticationPrincipal Jwt jwt) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return new ApiResponse<>(false, "Ошибка валидации", errors);
        }

        return service.receiveSchedule(schedule, jwt.getSubject());
    }

    @GetMapping("/employee/{employeeId}")
    public ApiResponse<List<ScheduleEntry>> getByEmployee(@PathVariable Long employeeId,
                                                          @AuthenticationPrincipal Jwt jwt) {
        return service.getByEmployee(employeeId, jwt.getSubject());
    }

    @GetMapping("/date/{date}")
    public ApiResponse<List<ScheduleEntry>> getByDate(@PathVariable String date) {
        return service.getByDate(date);
    }

    @GetMapping("/employee/{employeeId}/date/{date}")
    public ApiResponse<List<ScheduleEntry>> getByEmployeeAndDate(@PathVariable Long employeeId,
                                                                 @PathVariable String date,
                                                                 @AuthenticationPrincipal Jwt jwt) {
        return service.getByEmployeeAndDate(employeeId, date, jwt.getSubject());
    }

    @PatchMapping("/task/{id}")
    public ApiResponse<?> updateTaskById(@PathVariable Long id,
                                         @RequestBody ScheduleDto request,
                                         @AuthenticationPrincipal Jwt jwt) {
        return service.updateTaskById(id, request, jwt.getSubject());
    }

    @DeleteMapping("/task/{id}")
    public ApiResponse<?> deleteTaskById(@PathVariable Long id,
                                         @AuthenticationPrincipal Jwt jwt) {
        return service.deleteTaskById(id, jwt.getSubject());
    }

    @GetMapping("/tasks")
    public ApiResponse<List<ScheduleEntry>> getTasks(@AuthenticationPrincipal Jwt jwt) {
        return service.getTasks(jwt.getSubject());
    }
}
