package com.calendarapi.repository;

import com.calendarapi.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsById(Long id);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findById(Long id);
}

