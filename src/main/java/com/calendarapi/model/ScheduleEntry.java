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

    @Column(name = "employee_name", nullable = false)
    private String employeeName;

    @Column(name = "task_name", nullable = false)
    private String taskName;

    @Column(name = "task_description")
    private String taskDescription;

    @Column(name = "counterparty", nullable = false)
    private String counterparty;

    @Column(name = "date_accept", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateAccept;

    @Column(name = "start_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    @Column(name = "status")
    private String status;

    @Column(name = "priority")
    private String priority;

    public void setEmployeeId(String employeeName) {
        this.employeeName = employeeName;
    }

    public void setDateAccept(LocalDateTime dateAccept) {
        this.dateAccept = dateAccept;
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

    public void setTaskDescription(String taskDescription) {
        this.taskDescription = taskDescription;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCounterparty(String counterparty) {
        this.counterparty = counterparty;
    }

    public String getPriority() {
        return priority;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public LocalDateTime getDateAccept() {
        return dateAccept;
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

    public String getStatus() {
        return status;
    }
}
