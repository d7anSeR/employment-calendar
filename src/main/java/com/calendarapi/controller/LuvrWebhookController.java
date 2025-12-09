package com.calendarapi.controller;

import com.calendarapi.dto.ScheduleUpdateRequest;
import com.calendarapi.model.ApiResponse;
import com.calendarapi.model.ScheduleEntry;
import com.calendarapi.repository.ScheduleEntryRepository;
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

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

    @GetMapping("/user/{employeeId}")
    public ApiResponse<List<ScheduleEntry>> getByEmployee(@PathVariable Long employeeId) {
        List<ScheduleEntry> tasks = repository.findByEmployeeId(employeeId);
        return new ApiResponse<>(true, "Задачи сотрудника получены", tasks);
    }

    @GetMapping("/date/{date}")
    public ApiResponse<List<ScheduleEntry>> getByDate(@PathVariable String date) {
        LocalDateTime startOfDay = LocalDateTime.parse(date + "T00:00:00");
        LocalDateTime endOfDay = LocalDateTime.parse(date + "T23:59:59");

        List<ScheduleEntry> tasks = repository.findByStartDateBetween(startOfDay, endOfDay);
        return new ApiResponse<>(true, "Задачи за день получены", tasks);
    }

    @GetMapping("/user/{employeeId}/date/{date}")
    public ApiResponse<List<ScheduleEntry>> getByUserAndDate(@PathVariable Long employeeId,
                                                             @PathVariable String date) {
        LocalDateTime startOfDay = LocalDateTime.parse(date + "T00:00:00");
        LocalDateTime endOfDay = LocalDateTime.parse(date + "T23:59:59");

        List<ScheduleEntry> tasks = repository.findByEmployeeIdAndStartDateBetween(employeeId, startOfDay, endOfDay);
        return new ApiResponse<>(true, "Задачи сотрудника за день получены", tasks);
    }

    @PatchMapping("/schedule/task/{taskId}")
    public ApiResponse<?> updateTaskByTaskId(
            @PathVariable Long taskId,
            @RequestBody ScheduleUpdateRequest request
    ) {
        try {
            ScheduleEntry task = repository.findByTaskId(taskId)
                    .orElseThrow(() -> new RuntimeException("Задача с taskId=" + taskId + " не найдена"));


            if (!(Objects.equals(task.getViewTask(), "личная"))) {
                return new ApiResponse<>(false, "Задача не может быть обновлена: она не личная");
            }

            if (request.getTaskName() != null) task.setTaskName(request.getTaskName());
            if (request.getTaskDescription() != null) task.setTaskDescription(request.getTaskDescription());
            if (request.getStatus() != null) task.setStatus(request.getStatus());
            if (request.getPriority() != null) task.setPriority(request.getPriority());
            if (request.getCounterparty() != null) task.setCounterparty(request.getCounterparty());
            if (request.getEmployeeId() != null) task.setEmployeeId(request.getEmployeeId());
            if (request.getStartDate() != null) task.setStart(request.getStartDate());
            if (request.getEndDate() != null) task.setEnd(request.getEndDate());

            repository.save(task);

            return new ApiResponse<>(true, "Задача обновлена по taskId", task);
        } catch (Exception e) {
            return new ApiResponse<>(false, "Ошибка обновления: " + e.getMessage());
        }
    }

    @DeleteMapping("/schedule/task/{taskId}")
    public ApiResponse<?> deleteTaskByTaskId(
            @PathVariable Long taskId,
            @RequestParam Long employeeId
    ) {
        try {
            ScheduleEntry task = repository.findByTaskId(taskId)
                    .orElseThrow(() -> new RuntimeException("Задача с taskId=" + taskId + " не найдена"));

            if (!task.getEmployeeId().equals(employeeId)) {
                return new ApiResponse<>(false, "Удаление невозможно: задача не принадлежит указанному сотруднику");
            }

            if (!(Objects.equals(task.getViewTask(), "личная"))) {
                return new ApiResponse<>(false, "Задача не может быть удалена: она не личная");
            }
            repository.delete(task);
            return new ApiResponse<>(true, "Задача успешно удалена");
        } catch (Exception e) {
            return new ApiResponse<>(false, "Ошибка удаления: " + e.getMessage());
        }
    }

}
