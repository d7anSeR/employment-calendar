package com.calendarapi.controller;

import com.calendarapi.dto.ScheduleUpdateRequest;
import com.calendarapi.model.ApiResponse;
import com.calendarapi.model.Employee;
import com.calendarapi.model.ScheduleEntry;
import com.calendarapi.repository.EmployeeRepository;
import com.calendarapi.repository.ScheduleEntryRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/webhook")
public class LuvrWebhookController {

    private final ScheduleEntryRepository repository;
    private final EmployeeRepository employeeRepository;

    public LuvrWebhookController(ScheduleEntryRepository repository,
                                 EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/schedule")
    public ApiResponse<?> receiveSchedule(@Valid @RequestBody ScheduleEntry schedule, BindingResult bindingResult,
                                          HttpServletRequest httpRequest) {
        // Проверяем ошибки валидации
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return new ApiResponse<>(false, "Ошибка валидации", errors);
        }

        try {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Basic ")) {
                return new ApiResponse<>(false, "Ошибка авторизации: отсутствует Basic Auth");
            }
            String base64 = authHeader.substring("Basic ".length());
            String decoded = new String(Base64.getDecoder().decode(base64), StandardCharsets.UTF_8);
            String email = decoded.split(":", 2)[0];

            Employee employee = employeeRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Сотрудник с email " + email + " не найден"));
            schedule.setEmployeeId(employee.getId());
            if (repository.existsById(schedule.getId())) {
                return new ApiResponse<>(false, "Задача с ID " + schedule.getId() + " уже существует");
            }
            repository.save(schedule); // сохраняем в БД
            return new ApiResponse<>(true, "Данные успешно приняты");
        } catch (Exception e) {
            return new ApiResponse<>(false, "Ошибка при сохранении: " + e.getMessage());
        }
    }

    @GetMapping("/employee/{employeeId}")
    public ApiResponse<List<ScheduleEntry>> getByEmployee(@PathVariable Long employeeId,
                                                          HttpServletRequest httpRequest) {

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Basic ")) {
            return new ApiResponse<>(false, "Ошибка авторизации: отсутствует Basic Auth");
        }

        String base64 = authHeader.substring("Basic ".length());
        String decoded = new String(Base64.getDecoder().decode(base64), StandardCharsets.UTF_8);
        String email = decoded.split(":", 2)[0];

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Сотрудник с email " + email + " не найден"));

        if (!employeeRepository.existsById(employeeId)) {
            return new ApiResponse<>(false, "Сотрудник с ID " + employeeId + " не найден");
        }

        List<ScheduleEntry> tasks = repository.findByEmployeeId(employeeId);

        tasks.removeIf(task ->
                !Objects.equals(task.getEmployeeId(), employee.getId())
                        && !"общая".equals(task.getViewTask())
        );

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
                                                                 HttpServletRequest httpRequest) {

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Basic ")) {
            return new ApiResponse<>(false, "Ошибка авторизации: отсутствует Basic Auth");
        }

        String base64 = authHeader.substring("Basic ".length());
        String decoded = new String(Base64.getDecoder().decode(base64), StandardCharsets.UTF_8);
        String email = decoded.split(":", 2)[0];

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Сотрудник с email " + email + " не найден"));

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
            HttpServletRequest httpRequest
    ) {
        try {
            ScheduleEntry task = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Задача с id=" + id + " не найдена"));
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Basic ")) {
                return new ApiResponse<>(false, "Ошибка авторизации: отсутствует Basic Auth");
            }
            String base64 = authHeader.substring("Basic ".length());
            String decoded = new String(Base64.getDecoder().decode(base64), StandardCharsets.UTF_8);
            String email = decoded.split(":", 2)[0];

            Employee employee = employeeRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Сотрудник с email " + email + " не найден"));

            if (!task.getEmployeeId().equals(employee.getId())) {
                return new ApiResponse<>(false, "Задача не принадлежит этому сотруднику");
            }
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

    @DeleteMapping("/schedule/task/{id}")
    public ApiResponse<?> deleteTaskById(
            @PathVariable Long id,
            HttpServletRequest httpRequest
    ) {
        try {
            ScheduleEntry task = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Задача с id=" + id + " не найдена"));
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Basic ")) {
                return new ApiResponse<>(false, "Ошибка авторизации: отсутствует Basic Auth");
            }
            String base64 = authHeader.substring("Basic ".length());
            String decoded = new String(Base64.getDecoder().decode(base64), StandardCharsets.UTF_8);
            String email = decoded.split(":", 2)[0];

            Employee employee = employeeRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Сотрудник с email " + email + " не найден"));

            if (!task.getEmployeeId().equals(employee.getId())) {
                return new ApiResponse<>(false, "Задача не принадлежит этому сотруднику");
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

    @GetMapping("/schedule/tasks")
    public ApiResponse<List<ScheduleEntry>> getTasks(
            HttpServletRequest httpRequest
    ) {
        try {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Basic ")) {
                return new ApiResponse<>(false, "Ошибка авторизации: отсутствует Basic Auth");
            }
            String base64 = authHeader.substring("Basic ".length());
            String decoded = new String(Base64.getDecoder().decode(base64), StandardCharsets.UTF_8);
            String email = decoded.split(":", 2)[0];

            Employee employee = employeeRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Сотрудник с email " + email + " не найден"));

            List<ScheduleEntry> scheduleEntries = repository.findAll();
            for(ScheduleEntry scheduleEntry : scheduleEntries){
                if(!Objects.equals(employee.getId(), scheduleEntry.getEmployeeId())){
                    if(!Objects.equals(scheduleEntry.getViewTask(), "общая")){
                        scheduleEntries.remove(scheduleEntry);
                    }
                }
            }
            return new ApiResponse<>(true, "Все общедоступные и свои задачи получены", scheduleEntries);
        } catch (Exception e) {
            return new ApiResponse<>(false, "Ошибка получения задач: " + e.getMessage());
        }
    }

}
