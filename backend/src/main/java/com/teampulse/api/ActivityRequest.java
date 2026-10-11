package com.teampulse.api;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record ActivityRequest(
        @NotBlank String employee_id,
        @NotNull OffsetDateTime timestamp,
        @Min(0) int active_seconds,
        @Min(0) int idle_seconds,
        boolean suspicious,
        String active_app_exe,
        String active_app_title) {}
