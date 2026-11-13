package com.calendarapi.mapping;

import com.calendarapi.dto.EmployeeDto;
import com.calendarapi.model.Employee;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {
    EmployeeDto toDto(Employee employee);
}
