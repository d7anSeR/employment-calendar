package com.calendarapi.dto;

import java.time.LocalDateTime;

public class ScheduleUpdateRequest {

    private String taskName;
    private String taskDescription;
    private Integer status;
    private Integer priority;
    private String counterparty;
    private Long employeeId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public String getTaskName() {
        return taskName;
    }

    public String getTaskDescription() {
        return taskDescription;
    }

    public Integer getStatus() {
        return status;
    }

    public Integer getPriority() {
        return priority;
    }

    public String getCounterparty() {
        return counterparty;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public void setTaskDescription(String taskDescription) {
        this.taskDescription = taskDescription;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public void setCounterparty(String counterparty) {
        this.counterparty = counterparty;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
}
