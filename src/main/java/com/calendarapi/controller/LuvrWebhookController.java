package com.calendarapi.controller;

import com.calendarapi.dto.ScheduleUpdateRequest;
import com.calendarapi.model.ApiResponse;
import com.calendarapi.model.Employee;
import com.calendarapi.model.ScheduleEntry;
import com.calendarapi.repository.EmployeeRepository;
import com.calendarapi.repository.ScheduleEntryRepository;
import com.calendarapi.security.SecurityUtils;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/webhook")
public class LuvrWebhookController {

    private final ScheduleEntryRepository repository;
    private final EmployeeRepository employeeRepository;
    private static final Logger log =
            LoggerFactory.getLogger(LuvrWebhookController.class);

    public LuvrWebhookController(ScheduleEntryRepository repository,
                                 EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/schedule")
    public ApiResponse<?> receiveSchedule(@Valid @RequestBody ScheduleEntry schedule, BindingResult bindingResult,
                                          @AuthenticationPrincipal Jwt jwt) {
        // Проверяем ошибки валидации
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return new ApiResponse<>(false, "Ошибка валидации", errors);
        }

        String email = jwt.getSubject();
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Сотрудник с email " + email + " не найден"));

        schedule.setEmployeeId(employee.getId());

        if (repository.existsById(schedule.getId())) {
            return new ApiResponse<>(false, "Задача с ID " + schedule.getId() + " уже существует");
        }
        repository.save(schedule); // сохраняем в БД
        log.info(
                "TASK CREATE | task_id={} | by={} | email={} | employee_id={} ",
                schedule.getId(),
                employee.getRole(),
                employee.getEmail(),
                employee.getId()
        );
        return new ApiResponse<>(true, "Данные успешно приняты");
    }

    @GetMapping("/employee/{employeeId}")
    public ApiResponse<List<ScheduleEntry>> getByEmployee(@PathVariable Long employeeId,
                                                          @AuthenticationPrincipal Jwt jwt) {

        Employee employee = employeeRepository.findByEmail(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден"));

        if (!employeeRepository.existsById(employeeId)) {
            return new ApiResponse<>(false, "Сотрудник с ID " + employeeId + " не найден");
        }

        List<ScheduleEntry> tasks = repository.findByEmployeeId(employeeId);
        tasks.removeIf(task -> !Objects.equals(task.getEmployeeId(), employee.getId())
                && !"общая".equals(task.getViewTask()));

        return new ApiResponse<>(true, "Задачи сотрудника получены", tasks);
    }


    @GetMapping("/date/{date}")
    public ApiResponse<List<ScheduleEntry>> getByDate(@PathVariable String date) {
        LocalDateTime startOfDay = LocalDateTime.parse(date + "T00:00:00");
        LocalDateTime endOfDay = LocalDateTime.parse(date + "T23:59:59");

        List<ScheduleEntry> tasks = repository.findByStartDateBetween(startOfDay, endOfDay);
        return new ApiResponse<>(true, "Задачи за день получены", tasks);
    }

    @GetMapping("/employee/{employeeId}/date/{date}")
    public ApiResponse<List<ScheduleEntry>> getByEmployeeAndDate(@PathVariable Long employeeId,
                                                                 @PathVariable String date,
                                                                 @AuthenticationPrincipal Jwt jwt) {

        Employee employee = employeeRepository.findByEmail(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден"));

        if (!employeeRepository.existsById(employeeId)) {
            return new ApiResponse<>(false, "Сотрудник с ID " + employeeId + " не найден");
        }

        LocalDateTime startOfDay = LocalDateTime.parse(date + "T00:00:00");
        LocalDateTime endOfDay = LocalDateTime.parse(date + "T23:59:59");

        List<ScheduleEntry> tasks =
                repository.findByEmployeeIdAndStartDateBetween(employeeId, startOfDay, endOfDay);

        tasks.removeIf(task ->
                !Objects.equals(task.getEmployeeId(), employee.getId())
                        && !"общая".equals(task.getViewTask())
        );

        return new ApiResponse<>(true, "Задачи сотрудника за день получены", tasks);
    }


    @PatchMapping("/schedule/task/{id}")
    public ApiResponse<?> updateTaskById(
            @PathVariable Long id,
            @RequestBody ScheduleUpdateRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        ScheduleEntry task = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Задача с id=" + id + " не найдена"));

        Employee employee = employeeRepository.findByEmail(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден"));

        if (!task.getEmployeeId().equals(employee.getId())) {
            return new ApiResponse<>(false, "Задача не принадлежит этому сотруднику");
        }
        if (!Objects.equals(task.getViewTask(), "личная")) {
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

        log.info(
                "TASK UPDATE | task_id={} | by={} | email={} | employee_id={} ",
                id,
                employee.getRole(),
                employee.getEmail(),
                employee.getId()
        );
        return new ApiResponse<>(true, "Задача обновлена по taskId", task);
    }

    @DeleteMapping("/schedule/task/{id}")
    public ApiResponse<?> deleteTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        ScheduleEntry task = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Задача с id=" + id + " не найдена"));

        Employee employee = employeeRepository.findByEmail(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден"));

        if (!task.getEmployeeId().equals(employee.getId())) {
            return new ApiResponse<>(false, "Задача не принадлежит этому сотруднику");
        }
        if (!Objects.equals(task.getViewTask(), "личная")) {
            return new ApiResponse<>(false, "Задача не может быть удалена: она не личная");
        }
        repository.delete(task);
        log.info(
                "TASK DELETE | task_id={} | by={} | email={} | employee_id={} ",
                id,
                employee.getRole(),
                employee.getEmail(),
                employee.getId()
        );
        return new ApiResponse<>(true, "Задача успешно удалена");
    }

    @GetMapping("/schedule/tasks")
    public ApiResponse<List<ScheduleEntry>> getTasks(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Employee employee = employeeRepository.findByEmail(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден"));

        List<ScheduleEntry> scheduleEntries = repository.findAll();
        scheduleEntries.removeIf(task -> !Objects.equals(employee.getId(), task.getEmployeeId())
                && !"общая".equals(task.getViewTask()));

        return new ApiResponse<>(true, "Все общедоступные и свои задачи получены", scheduleEntries);
    }

}
