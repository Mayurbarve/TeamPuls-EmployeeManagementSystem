package com.teampulse.repository;

import com.teampulse.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, String> {
    List<Employee> findAllByStatusOrderByEmployeeId(String status);
    List<Employee> findAllByOrderByEmployeeId();
}
