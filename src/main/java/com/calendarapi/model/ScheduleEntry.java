package com.calendarapi.model;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_entry") // имя таблицы
public class ScheduleEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "task_name")
    private String taskName;

    @Column(name = "task_description")
    private String taskDescription;

    @Column(name = "counterparty")
    private String counterparty;

    @Column(name = "start_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @Column(name = "number_task", nullable = false)
    private long numberTask;

    @Column(name = "end_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    @Column(name = "status")
    private int status;

    @Column(name = "priority")
    private int priority;

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
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

    public void setNumberTask(long numberTask) {
        this.numberTask = numberTask;
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

    public int getPriority() {
        return priority;
    }

    public String getEmployeeName() {
        return employeeName;
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

    public long getNumberTask() {
        return numberTask;
    }
}
