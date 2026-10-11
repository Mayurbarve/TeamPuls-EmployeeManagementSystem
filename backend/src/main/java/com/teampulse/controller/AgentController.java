package com.teampulse.controller;

import com.teampulse.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
public class AgentController {
    private final EmployeeRepository employees;

    public AgentController(EmployeeRepository employees) {
        this.employees = employees;
    }

    @GetMapping("/agent/employees/{employeeId}/verify")
    public Map<String, Boolean> verifyEmployee(@PathVariable String employeeId) {
        if (!employees.existsById(employeeId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found");
        }
        return Map.of("valid", true);
    }
}
