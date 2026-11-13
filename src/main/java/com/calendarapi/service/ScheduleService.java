package com.calendarapi.service;

import com.calendarapi.dto.ScheduleDto;
import com.calendarapi.model.Employee;
import com.calendarapi.model.ScheduleEntry;
import com.calendarapi.repository.EmployeeRepository;
import com.calendarapi.repository.ScheduleEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class ScheduleService {

    private static final Logger log = LoggerFactory.getLogger(ScheduleService.class);

    private final ScheduleEntryRepository scheduleRepository;
    private final EmployeeRepository employeeRepository;

    public ScheduleService(ScheduleEntryRepository scheduleRepository,
                           EmployeeRepository employeeRepository) {
        this.scheduleRepository = scheduleRepository;
        this.employeeRepository = employeeRepository;
    }

    public ApiResponse<?> receiveSchedule(ScheduleEntry schedule, String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Сотрудник с email " + email + " не найден"));
        schedule.setEmployeeId(employee.getId());

        if (scheduleRepository.existsById(schedule.getId())) {
            return new ApiResponse<>(false, "Задача с ID " + schedule.getId() + " уже существует");
        }

        scheduleRepository.save(schedule);
        log.info("TASK CREATE | task_id={} | by={} | email={} | employee_id={} ",
                schedule.getId(), employee.getRole(), employee.getEmail(), employee.getId());
        return new ApiResponse<>(true, "Данные успешно приняты");
    }

    public ApiResponse<List<ScheduleEntry>> getByEmployee(Long employeeId, String email) {
        Employee employee = currentEmployee(email);

        if (!employeeRepository.existsById(employeeId)) {
            return new ApiResponse<>(false, "Сотрудник с ID " + employeeId + " не найден");
        }

        List<ScheduleEntry> tasks = scheduleRepository.findByEmployeeId(employeeId);
        tasks.removeIf(task -> !isVisible(task, employee));
        return new ApiResponse<>(true, "Задачи сотрудника получены", tasks);
    }

    public ApiResponse<List<ScheduleEntry>> getByDate(String date) {
        List<ScheduleEntry> tasks = scheduleRepository.findByStartDateBetween(startOfDay(date), endOfDay(date));
        return new ApiResponse<>(true, "Задачи за день получены", tasks);
    }

    public ApiResponse<List<ScheduleEntry>> getByEmployeeAndDate(Long employeeId,
                                                                 String date,
                                                                 String email) {
        Employee employee = currentEmployee(email);

        if (!employeeRepository.existsById(employeeId)) {
            return new ApiResponse<>(false, "Сотрудник с ID " + employeeId + " не найден");
        }

        List<ScheduleEntry> tasks = scheduleRepository.findByEmployeeIdAndStartDateBetween(
                employeeId, startOfDay(date), endOfDay(date));
        tasks.removeIf(task -> !isVisible(task, employee));
        return new ApiResponse<>(true, "Задачи сотрудника за день получены", tasks);
    }

    public ApiResponse<?> updateTaskById(Long id, ScheduleDto request, String email) {
        ScheduleEntry task = findTask(id);
        Employee employee = currentEmployee(email);

        if (!isOwner(task, employee)) {
            return new ApiResponse<>(false, "Задача не принадлежит этому сотруднику");
        }
        if (!isPrivate(task)) {
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

        scheduleRepository.save(task);
        log.info("TASK UPDATE | task_id={} | by={} | email={} | employee_id={} ",
                id, employee.getRole(), employee.getEmail(), employee.getId());
        return new ApiResponse<>(true, "Задача обновлена по taskId", task);
    }

    public ApiResponse<?> deleteTaskById(Long id, String email) {
        ScheduleEntry task = findTask(id);
        Employee employee = currentEmployee(email);

        if (!isOwner(task, employee)) {
            return new ApiResponse<>(false, "Задача не принадлежит этому сотруднику");
        }
        if (!isPrivate(task)) {
            return new ApiResponse<>(false, "Задача не может быть удалена: она не личная");
        }

        scheduleRepository.delete(task);
        log.info("TASK DELETE | task_id={} | by={} | email={} | employee_id={} ",
                id, employee.getRole(), employee.getEmail(), employee.getId());
        return new ApiResponse<>(true, "Задача успешно удалена");
    }

    public ApiResponse<List<ScheduleEntry>> getTasks(String email) {
        Employee employee = currentEmployee(email);
        List<ScheduleEntry> tasks = scheduleRepository.findAll();
        tasks.removeIf(task -> !isVisible(task, employee));
        return new ApiResponse<>(true, "Все общедоступные и свои задачи получены", tasks);
    }

    private Employee currentEmployee(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден"));
    }

    private ScheduleEntry findTask(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Задача с id=" + id + " не найдена"));
    }

    private boolean isVisible(ScheduleEntry task, Employee employee) {
        return Objects.equals(task.getEmployeeId(), employee.getId())
                || "общая".equals(task.getViewTask());
    }

    private boolean isOwner(ScheduleEntry task, Employee employee) {
        return task.getEmployeeId().equals(employee.getId());
    }

    private boolean isPrivate(ScheduleEntry task) {
        return Objects.equals(task.getViewTask(), "личная");
    }

    private LocalDateTime startOfDay(String date) {
        return LocalDateTime.parse(date + "T00:00:00");
    }

    private LocalDateTime endOfDay(String date) {
        return LocalDateTime.parse(date + "T23:59:59");
    }
}
