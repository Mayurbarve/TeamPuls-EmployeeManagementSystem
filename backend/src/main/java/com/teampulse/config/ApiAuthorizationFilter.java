package com.teampulse.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teampulse.service.TokenService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@Component
public class ApiAuthorizationFilter extends OncePerRequestFilter {
    private final TokenService tokens;
    private final ObjectMapper json;
    private final byte[] agentApiKey;

    public ApiAuthorizationFilter(TokenService tokens, ObjectMapper json,
                                  @Value("${teampulse.agent.api-key:}") String agentApiKey) {
        this.tokens = tokens;
        this.json = json;
        this.agentApiKey = agentApiKey.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = requestPath(request);
        return request.getMethod().equals("OPTIONS") || path.equals("/health")
                || path.equals("/auth/login") || path.equals("/auth/signup");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String path = requestPath(request);
        boolean agentRequest = (path.equals("/activity") && request.getMethod().equals("POST"))
                || (path.matches("/agent/employees/[^/]+/verify") && request.getMethod().equals("GET"));
        if (agentRequest) {
            byte[] supplied = request.getHeader("X-Agent-API-Key") == null ? new byte[0]
                    : request.getHeader("X-Agent-API-Key").getBytes(StandardCharsets.UTF_8);
            if (agentApiKey.length > 0 && MessageDigest.isEqual(agentApiKey, supplied)) {
                chain.doFilter(request, response);
                return;
            }
            reject(response, HttpServletResponse.SC_UNAUTHORIZED, "Valid agent API key required");
            return;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            reject(response, HttpServletResponse.SC_UNAUTHORIZED, "Bearer token required");
            return;
        }
        Claims claims;
        try {
            claims = tokens.parse(authorization.substring(7));
        } catch (RuntimeException e) {
            reject(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return;
        }
        String role = claims.get("role", String.class);
        if (path.equals("/auth/me")) {
            request.setAttribute("authenticatedRole", role);
        } else if (!"admin".equals(role)
                && !("manager".equals(role) && request.getMethod().equals("GET") && isDashboardRead(path))) {
            reject(response, HttpServletResponse.SC_FORBIDDEN, "Admin role required");
            return;
        }
        chain.doFilter(request, response);
    }

    private void reject(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        json.writeValue(response.getOutputStream(), Map.of("detail", message));
    }

    private static String requestPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        return uri.startsWith(contextPath) ? uri.substring(contextPath.length()) : uri;
    }

    private static boolean isDashboardRead(String path) {
        return path.equals("/overview") || path.equals("/employees")
                || path.matches("/employees/[^/]+")
                || path.matches("/summary/[^/]+") || path.matches("/activity/[^/]+");
    }
}
