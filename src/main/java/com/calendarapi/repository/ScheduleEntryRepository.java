package com.calendarapi.repository;


import com.calendarapi.model.ScheduleEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, Long> {

    // Получение задач по имени сотрудника
    List<ScheduleEntry> findByEmployeeId(Long employeeId);

    // Получение задач, которые начинаются в определённый день
    List<ScheduleEntry> findByStartDateBetween(LocalDateTime start, LocalDateTime end);

    Optional<ScheduleEntry> findByTaskId(Long taskId);

    // Можно также получить задачи по пользователю и дате сразу
    List<ScheduleEntry> findByEmployeeIdAndStartDateBetween(Long employeeId, LocalDateTime start, LocalDateTime end);
}
