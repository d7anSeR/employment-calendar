package com.calendarapi.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@AllArgsConstructor
@Entity
@Table(name = "schedule_entry")
public class ScheduleEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_name", nullable = false)
    @NotBlank
    private String taskName;

    @Column(name = "task_description", nullable = false)
    @NotBlank
    private String taskDescription;

    @Column(name = "counterparty", nullable = false)
    @NotBlank
    private String counterparty;

    @Column(name = "start_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    @Column(name = "status")
    private StatusShedule status;

    @Column(name = "priority")
    private PriorityShedule priority;

    @Column(name = "view_task", nullable = false)
    private boolean viewTask;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;
}
