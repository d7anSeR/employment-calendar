package com.calendarapi.repository;


import com.calendarapi.dto.ScheduleDto;
import com.calendarapi.model.ScheduleEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, Long> {

    List<ScheduleDto> findByEmployeeId(Long employeeId);

    List<ScheduleDto> findByStartDateBetween(LocalDateTime start, LocalDateTime end);

    List<ScheduleDto> findByEmployeeIdAndStartDateBetween(Long employeeId, LocalDateTime start, LocalDateTime end);
}
