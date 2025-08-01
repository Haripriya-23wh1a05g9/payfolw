package com.example.payflow_backend.repository;

import com.example.payflow_backend.model.Employee;
import com.example.payflow_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmail(String email);
    Optional<Employee> findByEmail(String email);
    List<Employee> findByManager(User manager);
    List<Employee> findByManagerUserIdAndIsActiveTrue(Long managerId);
}
