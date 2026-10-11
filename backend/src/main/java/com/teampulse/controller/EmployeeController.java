package com.teampulse.controller;

import com.teampulse.api.EmployeeRequest;
import com.teampulse.model.Employee;
import com.teampulse.repository.ActivityLogRepository;
import com.teampulse.repository.EmployeeRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
public class EmployeeController {
    private final EmployeeRepository employees;
    private final ActivityLogRepository logs;

    public EmployeeController(EmployeeRepository employees, ActivityLogRepository logs) {
        this.employees = employees;
        this.logs = logs;
    }

    @GetMapping("/employees")
    public List<Map<String, Object>> list(@RequestParam(required = false) String status) {
        List<Employee> values = status == null ? employees.findAllByOrderByEmployeeId()
                : employees.findAllByStatusOrderByEmployeeId(status);
        return values.stream().map(EmployeeController::basic).toList();
    }

    @GetMapping("/employees/{employeeId}")
    public Map<String, Object> get(@PathVariable String employeeId) {
        return basic(find(employeeId));
    }

    @PostMapping({"/employees", "/employees/add"})
    public Map<String, String> add(@Valid @RequestBody EmployeeRequest request) {
        if (employees.existsById(request.employee_id())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee ID already exists");
        }
        Employee employee = new Employee();
        employee.setEmployeeId(request.employee_id());
        employee.setName(request.name()); employee.setEmail(request.email()); employee.setPhone(request.phone());
        employee.setDesignation(request.designation()); employee.setDomain(request.domain());
        employee.setDepartment(request.department()); employee.setLocation(request.location());
        employee.setWorkMode(request.work_mode()); employee.setEmployeeType(request.employee_type());
        employee.setSalaryBand(request.salary_band()); employee.setJoiningDate(request.joining_date());
        employee.setManagerName(request.manager_name()); employee.setManagerEmail(request.manager_email());
        employee.setStatus("Inactive");
        employees.save(employee);
        return Map.of("message", "Employee added");
    }

    @Transactional
    @DeleteMapping({"/employees/{employeeId}", "/employees/remove/{employeeId}"})
    public Map<String, String> delete(@PathVariable String employeeId) {
        find(employeeId);
        logs.deleteAllByEmployeeId(employeeId);
        employees.deleteById(employeeId);
        return Map.of("message", "Employee removed");
    }

    private Employee find(String id) {
        return employees.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
    }

    static Map<String, Object> basic(Employee e) {
        return Map.ofEntries(
                Map.entry("employee_id", e.getEmployeeId()), Map.entry("name", e.getName()),
                Map.entry("designation", value(e.getDesignation())), Map.entry("domain", value(e.getDomain())),
                Map.entry("department", value(e.getDepartment())), Map.entry("location", value(e.getLocation())),
                Map.entry("work_mode", value(e.getWorkMode())), Map.entry("status", value(e.getStatus())));
    }
    private static Object value(Object value) { return value == null ? "" : value; }
}
