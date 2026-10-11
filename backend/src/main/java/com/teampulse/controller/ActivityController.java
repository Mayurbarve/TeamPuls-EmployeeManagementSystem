package com.teampulse.controller;

import com.teampulse.api.ActivityRequest;
import com.teampulse.model.ActivityLog;
import com.teampulse.model.Employee;
import com.teampulse.repository.ActivityLogRepository;
import com.teampulse.repository.EmployeeRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
public class ActivityController {
    private final EmployeeRepository employees;
    private final ActivityLogRepository logs;

    public ActivityController(EmployeeRepository employees, ActivityLogRepository logs) {
        this.employees = employees;
        this.logs = logs;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "TeamPulse Java backend with employees & activity logs");
    }

    @PostMapping("/activity")
    public Map<String, String> receive(@Valid @RequestBody ActivityRequest request) {
        Employee employee = employees.findById(request.employee_id()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Employee " + request.employee_id() + " not registered in company DB"));
        logs.save(new ActivityLog(request.employee_id(), request.timestamp(), request.active_seconds(),
                request.idle_seconds(), request.suspicious(), request.active_app_exe(), request.active_app_title()));
        employee.setStatus("Active");
        employees.save(employee);
        return Map.of("message", "log stored");
    }

    @GetMapping("/overview")
    public List<Map<String, Object>> overview(@RequestParam(name = "date_str", required = false) String dateStr) {
        LocalDate date = parseDate(dateStr);
        OffsetDateTime now = OffsetDateTime.now();
        List<Map<String, Object>> response = new ArrayList<>();
        for (Employee employee : employees.findAllByOrderByEmployeeId()) {
            List<ActivityLog> dayLogs = logs.findAllByEmployeeIdAndDateOrderByTimestampAsc(employee.getEmployeeId(), date);
            int active = dayLogs.stream().mapToInt(ActivityLog::getActiveSeconds).sum();
            int idle = dayLogs.stream().mapToInt(ActivityLog::getIdleSeconds).sum();
            long suspicious = dayLogs.stream().filter(ActivityLog::isSuspicious).count();
            OffsetDateTime first = dayLogs.isEmpty() ? null : dayLogs.get(0).getTimestamp();
            OffsetDateTime last = dayLogs.isEmpty() ? null : dayLogs.get(dayLogs.size() - 1).getTimestamp();
            String status = last != null && Math.abs(now.toEpochSecond() - last.toEpochSecond()) <= 60 ? "Active" : "Inactive";
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("employee_id", employee.getEmployeeId()); row.put("name", employee.getName());
            row.put("designation", employee.getDesignation()); row.put("domain", employee.getDomain());
            row.put("department", employee.getDepartment()); row.put("location", employee.getLocation());
            row.put("work_mode", employee.getWorkMode()); row.put("status", status);
            row.put("login_time", first); row.put("logout_time", last);
            row.put("active_minutes", active / 60); row.put("idle_minutes", idle / 60);
            row.put("suspicious_flag_count", suspicious);
            response.add(row);
        }
        return response;
    }

    @GetMapping("/summary/{employeeId}")
    public Map<String, Object> summary(@PathVariable String employeeId,
                                       @RequestParam(name = "date_str", required = false) String dateStr) {
        Employee employee = employees.findById(employeeId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        LocalDate date = parseDate(dateStr);
        List<ActivityLog> dayLogs = logs.findAllByEmployeeIdAndDateOrderByTimestampAsc(employeeId, date);
        int active = dayLogs.stream().mapToInt(ActivityLog::getActiveSeconds).sum();
        int idle = dayLogs.stream().mapToInt(ActivityLog::getIdleSeconds).sum();
        long suspicious = dayLogs.stream().filter(ActivityLog::isSuspicious).count();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("employee_id", employee.getEmployeeId()); result.put("date", date.toString());
        result.put("name", employee.getName()); result.put("email", employee.getEmail());
        result.put("phone", employee.getPhone()); result.put("designation", employee.getDesignation());
        result.put("domain", employee.getDomain()); result.put("department", employee.getDepartment());
        result.put("location", employee.getLocation()); result.put("work_mode", employee.getWorkMode());
        result.put("employee_type", employee.getEmployeeType()); result.put("salary_band", employee.getSalaryBand());
        result.put("joining_date", employee.getJoiningDate()); result.put("manager_name", employee.getManagerName());
        result.put("manager_email", employee.getManagerEmail()); result.put("status", employee.getStatus());
        result.put("login_time", dayLogs.isEmpty() ? null : dayLogs.get(0).getTimestamp());
        result.put("logout_time", dayLogs.isEmpty() ? null : dayLogs.get(dayLogs.size() - 1).getTimestamp());
        result.put("active", duration(active)); result.put("idle", duration(idle));
        result.put("suspicious_flag_count", suspicious);
        return result;
    }

    @GetMapping("/activity/{employeeId}")
    public List<Map<String, Object>> activity(@PathVariable String employeeId,
                                              @RequestParam(name = "date_str", required = false) String dateStr) {
        if (!employees.existsById(employeeId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found");
        }
        LocalDate date = parseDate(dateStr);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ActivityLog log : logs.findAllByEmployeeIdAndDateOrderByTimestampAsc(employeeId, date)) {
            int active = log.getActiveSeconds(), idle = log.getIdleSeconds(), total = active + idle;
            String type = log.isSuspicious() ? "suspicious" : active >= idle ? "active" : "idle";
            String title = nonEmpty(log.getActiveAppTitle()) ? log.getActiveAppTitle()
                    : nonEmpty(log.getActiveAppExe()) ? log.getActiveAppExe() : "Activity interval";
            List<String> description = new ArrayList<>(List.of("Active: " + active + "s", "Idle: " + idle + "s"));
            if (nonEmpty(log.getActiveAppExe()) || nonEmpty(log.getActiveAppTitle())) {
                description.add("App: " + (nonEmpty(log.getActiveAppExe()) ? log.getActiveAppExe() : "-")
                        + " | " + (nonEmpty(log.getActiveAppTitle()) ? log.getActiveAppTitle() : "-"));
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("timestamp", log.getTimestamp()); item.put("type", type); item.put("title", title);
            item.put("description", String.join(" | ", description));
            item.put("duration", total > 0 ? total + "s" : null); item.put("details", "log_id=" + log.getId());
            result.add(item);
        }
        return result;
    }

    private static LocalDate parseDate(String date) {
        return date == null || date.isBlank() ? LocalDate.now() : LocalDate.parse(date);
    }
    private static Map<String, Integer> duration(int seconds) {
        return Map.of("hours", seconds / 3600, "minutes", (seconds % 3600) / 60, "seconds", seconds);
    }
    private static boolean nonEmpty(String value) { return value != null && !value.isBlank(); }
}
