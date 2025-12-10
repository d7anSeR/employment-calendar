package com.calendarapi.repository;

import com.calendarapi.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmail(String email);
    // Метод для поиска пользователя по email
    Optional<Employee> findByEmail(String email);
}

