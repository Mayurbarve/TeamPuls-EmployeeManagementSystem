package com.teampulse.api;

import jakarta.validation.constraints.NotBlank;

public record EmployeeRequest(
        @NotBlank String employee_id,
        @NotBlank String name,
        String email,
        String phone,
        @NotBlank String designation,
        @NotBlank String domain,
        @NotBlank String department,
        @NotBlank String location,
        @NotBlank String work_mode,
        String employee_type,
        String salary_band,
        @NotBlank String joining_date,
        @NotBlank String manager_name,
        String manager_email) {}
