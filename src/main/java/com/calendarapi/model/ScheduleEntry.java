package com.calendarapi.model;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_entry")
public class ScheduleEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id")
    @NotNull(message = "Поле для идентификации сотрудника обязательно")
    private Long employeeId;

    @Column(name = "task_name")
    private String taskName;

    @Column(name = "task_description")
    private String taskDescription;

    @Column(name = "counterparty")
    private String counterparty;

    @Column(name = "start_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @Column(name = "task_id", nullable = false)
    @NotNull(message = "Поле номера заявки обязательно")
    private Long taskId;

    @Column(name = "end_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    @Column(name = "status")
    private int status = 1;

    @Column(name = "priority")
    private int priority = 1;

    @Column(name = "view_task", nullable = false)
    private String viewTask = "общая";

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public void setStart(LocalDateTime start) {
        this.startDate = start;
    }

    public void setEnd(LocalDateTime end) {
        this.endDate = end;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public void setTaskDescription(String taskDescription) {
        this.taskDescription = taskDescription;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public void setCounterparty(String counterparty) {
        this.counterparty = counterparty;
    }

    public void setViewTask(String viewTask) {
        this.viewTask = viewTask;
    }

    public int getPriority() {
        return priority;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public LocalDateTime getStart() {
        return startDate;
    }

    public LocalDateTime getEnd() {
        return endDate;
    }

    public String getTaskName() {
        return taskName;
    }

    public String getTaskDescription() {
        return taskDescription;
    }

    public String getCounterparty() {
        return counterparty;
    }

    public int getStatus() {
        return status;
    }

    public Long getTaskId() {
        return taskId;
    }

    public String getViewTask() {
        return viewTask;
    }
}
