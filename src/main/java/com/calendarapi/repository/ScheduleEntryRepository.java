package com.calendarapi.repository;


import com.calendarapi.model.ScheduleEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, Long> {

    // Получение задач по имени сотрудника
    List<ScheduleEntry> findByEmployeeName(String employeeName);

    // Получение задач, которые начинаются в определённый день
    List<ScheduleEntry> findByStartDateBetween(LocalDateTime start, LocalDateTime end);

    // Можно также получить задачи по пользователю и дате сразу
    List<ScheduleEntry> findByEmployeeNameAndStartDateBetween(String employeeName, LocalDateTime start, LocalDateTime end);
}
