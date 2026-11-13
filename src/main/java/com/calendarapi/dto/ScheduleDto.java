package com.calendarapi.dto;

import com.calendarapi.model.PriorityShedule;
import com.calendarapi.model.StatusShedule;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ScheduleDto {

    private Long id;
    private String taskName;
    private String taskDescription;
    private StatusShedule status;
    private PriorityShedule priority;
    private String counterparty;
    private Long employeeId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

}
