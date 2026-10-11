package com.teampulse.service;

import com.teampulse.api.LoginRequest;
import com.teampulse.api.SignupRequest;
import com.teampulse.model.UserAccount;
import com.teampulse.repository.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@Service
public class AuthService {
    private final UserAccountRepository users;
    private final TokenService tokens;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserAccountRepository users, TokenService tokens) {
        this.users = users;
        this.tokens = tokens;
    }

    public Map<String, String> login(LoginRequest request) {
        UserAccount account = users.findByUsername(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!encoder.matches(request.password(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String role = account.getRole();
        return Map.of("access_token", tokens.create(account.getUsername(), role), "role", role);
    }

    @Transactional
    public Map<String, String> signup(SignupRequest request) {
        String username = request.username().trim();
        if (users.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }
        String role = request.role().toLowerCase(java.util.Locale.ROOT);
        users.save(new UserAccount(username, encoder.encode(request.password()), role));
        return Map.of("message", "Account created", "username", username, "role", role);
    }
}
