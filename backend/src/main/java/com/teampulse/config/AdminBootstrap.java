package com.teampulse.config;

import com.teampulse.model.UserAccount;
import com.teampulse.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final UserAccountRepository users;
    private final String username;
    private final String password;

    public AdminBootstrap(UserAccountRepository users,
                          @Value("${teampulse.admin.username:}") String username,
                          @Value("${teampulse.admin.password:}") String password) {
        this.users = users;
        this.username = username;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (username.isBlank() && password.isBlank()) return;
        if (username.isBlank() || password.length() < 12) {
            throw new IllegalStateException("Set both BOOTSTRAP_ADMIN_USERNAME and a 12+ character BOOTSTRAP_ADMIN_PASSWORD");
        }
        UserAccount account = users.findByUsername(username).orElse(null);
        if (account == null) {
            users.save(new UserAccount(username, new BCryptPasswordEncoder().encode(password), "admin"));
        } else if (!account.getRole().equals("admin")) {
            account.setRole("admin");
            users.save(account);
        }
    }
}
