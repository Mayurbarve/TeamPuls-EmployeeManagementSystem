package com.teampulse.controller;

import com.teampulse.api.LoginRequest;
import com.teampulse.api.SignupRequest;
import com.teampulse.service.AuthService;
import com.teampulse.service.TokenService;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService auth;
    private final TokenService tokens;

    public AuthController(AuthService auth, TokenService tokens) {
        this.auth = auth;
        this.tokens = tokens;
    }

    @PostMapping("/login")
    public Map<String, String> login(@Valid @RequestBody LoginRequest request) { return auth.login(request); }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> signup(@Valid @RequestBody SignupRequest request) { return auth.signup(request); }

    @GetMapping("/me")
    public Map<String, String> me(@RequestHeader("Authorization") String authorization) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Bearer token required");
            }
            Claims claims = tokens.parse(authorization.substring(7));
            return Map.of("username", claims.getSubject(), "role", claims.get("role", String.class));
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
    }
}
