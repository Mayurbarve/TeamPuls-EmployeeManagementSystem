package com.teampulse.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank @Size(max = 80) String username,
        @NotBlank @Size(min = 12, max = 128) String password,
        @NotBlank @Pattern(regexp = "(?i)admin|manager") String role) {}
