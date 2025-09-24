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

    @Column(name = "employee_id", nullable = false)
    private String employeeId;

    @Column(name = "task", nullable = false)
    private String task;

    @Column(name = "start_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    @Column(name = "status")
    private String status;

    @Column(name = "priority")
    private String priority;

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public void setStart(LocalDateTime start) {
        this.startDate = start;
    }

    public void setEnd(LocalDateTime end) {
        this.endDate = end;
    }

    public void setTask(String task) {
        this.task = task;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getPriority() {
        return priority;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public LocalDateTime getStart() {
        return startDate;
    }

    public LocalDateTime getEnd() {
        return endDate;
    }

    public String getTask() {
        return task;
    }

    public String getStatus() {
        return status;
    }
}
