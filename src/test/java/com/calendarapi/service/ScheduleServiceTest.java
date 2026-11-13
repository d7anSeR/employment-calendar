package com.calendarapi.service;

import com.calendarapi.dto.ScheduleDto;
import com.calendarapi.model.Employee;
import com.calendarapi.model.ScheduleEntry;
import com.calendarapi.repository.EmployeeRepository;
import com.calendarapi.repository.ScheduleEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ScheduleServiceTest {

    private ScheduleEntryRepository scheduleRepository;
    private EmployeeRepository employeeRepository;
    private ScheduleService service;

    @BeforeEach
    void setUp() {
        scheduleRepository = mock(ScheduleEntryRepository.class);
        employeeRepository = mock(EmployeeRepository.class);
        service = new ScheduleService(scheduleRepository, employeeRepository);
    }

    @Test
    void receiveScheduleBindsAuthenticatedEmployeeAndSaves() {
        Employee employee = employee(10L);
        ScheduleEntry schedule = task(100L, null, "общая");
        when(employeeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(employee));

        ApiResponse<?> response = service.receiveSchedule(schedule, "user@example.com");

        assertTrue(response.isSuccess());
        assertEquals("Данные успешно приняты", response.getMessage());
        assertEquals(10L, schedule.getEmployeeId());
        verify(scheduleRepository).save(schedule);
    }

    @Test
    void receiveScheduleRejectsDuplicateIdAfterBindingEmployee() {
        ScheduleEntry schedule = task(100L, null, "общая");
        when(employeeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(employee(10L)));
        when(scheduleRepository.existsById(100L)).thenReturn(true);

        ApiResponse<?> response = service.receiveSchedule(schedule, "user@example.com");

        assertFalse(response.isSuccess());
        assertEquals("Задача с ID 100 уже существует", response.getMessage());
        assertEquals(10L, schedule.getEmployeeId());
        verify(scheduleRepository, never()).save(any());
    }

    @Test
    void getTasksReturnsOwnAndPublicTasksOnly() {
        ScheduleEntry ownPrivate = task(1L, 10L, "личная");
        ScheduleEntry otherPublic = task(2L, 20L, "общая");
        ScheduleEntry otherPrivate = task(3L, 20L, "личная");
        when(employeeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(employee(10L)));
        when(scheduleRepository.findAll()).thenReturn(new ArrayList<>(
                List.of(ownPrivate, otherPublic, otherPrivate)
        ));

        ApiResponse<List<ScheduleEntry>> response = service.getTasks("user@example.com");

        assertTrue(response.isSuccess());
        assertEquals(List.of(ownPrivate, otherPublic), response.getData());
    }

    @Test
    void getByDateUsesTheExistingInclusiveDayBounds() {
        List<ScheduleEntry> tasks = List.of(task(1L, 10L, "общая"));
        LocalDateTime start = LocalDateTime.parse("2025-09-28T00:00:00");
        LocalDateTime end = LocalDateTime.parse("2025-09-28T23:59:59");
        when(scheduleRepository.findByStartDateBetween(start, end)).thenReturn(tasks);

        ApiResponse<List<ScheduleEntry>> response = service.getByDate("2025-09-28");

        assertEquals(tasks, response.getData());
        verify(scheduleRepository).findByStartDateBetween(start, end);
    }

    @Test
    void getByEmployeeAndDateReturnsOnlyVisibleTasks() {
        ScheduleEntry publicTask = task(1L, 20L, "общая");
        ScheduleEntry privateTask = task(2L, 20L, "личная");
        LocalDateTime start = LocalDateTime.parse("2025-09-28T00:00:00");
        LocalDateTime end = LocalDateTime.parse("2025-09-28T23:59:59");
        when(employeeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(employee(10L)));
        when(employeeRepository.existsById(20L)).thenReturn(true);
        when(scheduleRepository.findByEmployeeIdAndStartDateBetween(20L, start, end))
                .thenReturn(new ArrayList<>(List.of(publicTask, privateTask)));

        ApiResponse<List<ScheduleEntry>> response = service.getByEmployeeAndDate(
                20L, "2025-09-28", "user@example.com");

        assertEquals(List.of(publicTask), response.getData());
    }

    @Test
    void updateTaskAppliesOnlyProvidedFields() {
        ScheduleEntry task = task(1L, 10L, "личная");
        task.setTaskName("Старое название");
        task.setPriority(2);
        ScheduleDto request = new ScheduleDto();
        request.setStatus(3);
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(task));
        when(employeeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(employee(10L)));

        ApiResponse<?> response = service.updateTaskById(1L, request, "user@example.com");

        assertTrue(response.isSuccess());
        assertEquals(3, task.getStatus());
        assertEquals(2, task.getPriority());
        assertEquals("Старое название", task.getTaskName());
        verify(scheduleRepository).save(task);
    }

    @Test
    void updateTaskRejectsAnotherEmployeesTask() {
        ScheduleEntry task = task(1L, 20L, "личная");
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(task));
        when(employeeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(employee(10L)));

        ApiResponse<?> response = service.updateTaskById(1L, new ScheduleDto(), "user@example.com");

        assertFalse(response.isSuccess());
        assertEquals("Задача не принадлежит этому сотруднику", response.getMessage());
        verify(scheduleRepository, never()).save(any());
    }

    @Test
    void deleteTaskRejectsNonPrivateTask() {
        ScheduleEntry task = task(1L, 10L, "общая");
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(task));
        when(employeeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(employee(10L)));

        ApiResponse<?> response = service.deleteTaskById(1L, "user@example.com");

        assertFalse(response.isSuccess());
        assertEquals("Задача не может быть удалена: она не личная", response.getMessage());
        verify(scheduleRepository, never()).delete(any());
    }

    @Test
    void deleteTaskDeletesOwnedPrivateTask() {
        ScheduleEntry task = task(1L, 10L, "личная");
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(task));
        when(employeeRepository.findByEmail("user@example.com")).thenReturn(Optional.of(employee(10L)));

        ApiResponse<?> response = service.deleteTaskById(1L, "user@example.com");

        assertTrue(response.isSuccess());
        assertEquals("Задача успешно удалена", response.getMessage());
        verify(scheduleRepository).delete(task);
    }

    private static Employee employee(Long id) {
        return new Employee(id, "User", "user@example.com", "hash", "USER");
    }

    private static ScheduleEntry task(Long id, Long employeeId, String viewTask) {
        ScheduleEntry task = new ScheduleEntry();
        task.setId(id);
        task.setEmployeeId(employeeId);
        task.setViewTask(viewTask);
        return task;
    }
}
