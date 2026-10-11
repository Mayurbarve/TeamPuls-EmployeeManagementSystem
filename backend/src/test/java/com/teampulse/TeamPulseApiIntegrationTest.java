package com.teampulse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teampulse.repository.ActivityLogRepository;
import com.teampulse.repository.EmployeeRepository;
import com.teampulse.repository.UserAccountRepository;
import com.teampulse.model.UserAccount;
import com.teampulse.service.TokenService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "teampulse.agent.api-key=test-agent-api-key",
        "teampulse.admin.username=test-admin",
        "teampulse.admin.password=test-bootstrap-password"
})
class TeamPulseApiIntegrationTest {
    private static final String EMPLOYEE_ID = "TP-TEST-001";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private EmployeeRepository employees;
    @Autowired private ActivityLogRepository activityLogs;
    @Autowired private UserAccountRepository users;
    @Autowired private TokenService tokens;
    private String adminToken;

    @BeforeEach
    void clearDatabase() {
        activityLogs.deleteAll();
        employees.deleteAll();
        users.deleteAll();
        users.save(new UserAccount("test-admin", new BCryptPasswordEncoder().encode("test-password"), "admin"));
        adminToken = tokens.create("test-admin", "admin");
    }

    @Test
    void healthEndpointReturnsServiceStatus() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.service").value("TeamPulse Java backend with employees & activity logs"));
    }

    @Test
    void employeeCanBeCreatedListedAndReadAndDuplicateIdsAreRejected() throws Exception {
        mockMvc.perform(post("/employees").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(employeeJson()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Employee added"));

        mockMvc.perform(get("/employees").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].employee_id").value(EMPLOYEE_ID))
                .andExpect(jsonPath("$[0].status").value("Inactive"));

        mockMvc.perform(get("/employees/{employeeId}", EMPLOYEE_ID).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Employee"));

        mockMvc.perform(post("/employees").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(employeeJson()))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/employees/{employeeId}", "missing").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void agentCanVerifyOnlyEmployeeExistenceWithItsApiKey() throws Exception {
        createEmployee();

        mockMvc.perform(get("/agent/employees/{employeeId}/verify", EMPLOYEE_ID))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/agent/employees/{employeeId}/verify", EMPLOYEE_ID)
                        .header("X-Agent-API-Key", "wrong-key"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/agent/employees/{employeeId}/verify", EMPLOYEE_ID)
                        .header("X-Agent-API-Key", "test-agent-api-key"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.name").doesNotExist());

        mockMvc.perform(get("/agent/employees/{employeeId}/verify", "missing")
                        .header("X-Agent-API-Key", "test-agent-api-key"))
                .andExpect(status().isNotFound());
    }

    @Test
    void activityIsStoredAndIncludedInDashboardViews() throws Exception {
        createEmployee();
        String timestamp = OffsetDateTime.now().withNano(0).toString();
        String date = timestamp.substring(0, 10);
        String event = """
                {
                  "employee_id": "%s",
                  "timestamp": "%s",
                  "active_seconds": 125,
                  "idle_seconds": 65,
                  "suspicious": true,
                  "active_app_exe": "editor.exe",
                  "active_app_title": "Test document"
                }
                """.formatted(EMPLOYEE_ID, timestamp);

        mockMvc.perform(post("/activity")
                        .header("X-Agent-API-Key", "test-agent-api-key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(event))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("log stored"));

        mockMvc.perform(get("/overview").param("date_str", date))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/overview").header("Authorization", "Bearer " + adminToken).param("date_str", date))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].employee_id").value(EMPLOYEE_ID))
                .andExpect(jsonPath("$[0].status").value("Active"))
                .andExpect(jsonPath("$[0].active_minutes").value(2))
                .andExpect(jsonPath("$[0].idle_minutes").value(1))
                .andExpect(jsonPath("$[0].suspicious_flag_count").value(1));

        mockMvc.perform(get("/summary/{employeeId}", EMPLOYEE_ID).header("Authorization", "Bearer " + adminToken).param("date_str", date))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Employee"))
                .andExpect(jsonPath("$.active.minutes").value(2))
                .andExpect(jsonPath("$.suspicious_flag_count").value(1));

        mockMvc.perform(get("/activity/{employeeId}", EMPLOYEE_ID).header("Authorization", "Bearer " + adminToken).param("date_str", date))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("suspicious"))
                .andExpect(jsonPath("$[0].title").value("Test document"));
    }

    @Test
    void activityForUnregisteredEmployeeIsRejected() throws Exception {
        String event = """
                {
                  "employee_id": "UNKNOWN",
                  "timestamp": "%s",
                  "active_seconds": 1,
                  "idle_seconds": 0,
                  "suspicious": false
                }
                """.formatted(OffsetDateTime.now().withNano(0));

        mockMvc.perform(post("/activity")
                        .header("X-Agent-API-Key", "test-agent-api-key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(event))
                .andExpect(status().isNotFound());
    }

    @Test
    void adminLoginAndTokenIdentityFlowWorks() throws Exception {
        String token = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"test-admin","password":"test-password"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("admin"))
                .andExpect(jsonPath("$.access_token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        token = objectMapper.readTree(token).get("access_token").asText();
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""" 
                                {"username":"test-admin","password":"test-password"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("admin"))
                .andExpect(jsonPath("$.access_token").isNotEmpty());

        mockMvc.perform(get("/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("test-admin"))
                .andExpect(jsonPath("$.role").value("admin"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""" 
                                {"username":"test-admin","password":"incorrect"}
                                """))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/employees"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/employees").header("Authorization", "Bearer " + tokens.create("manager", "manager")))
                .andExpect(status().isOk());
        mockMvc.perform(post("/employees").header("Authorization", "Bearer " + tokens.create("manager", "manager"))
                        .contentType(MediaType.APPLICATION_JSON).content(employeeJson()))
                .andExpect(status().isForbidden());
    }

    @Test
    void signupCreatesHashedManagerAccountAndEnforcesReadOnlyDashboardAccess() throws Exception {
        mockMvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"team-manager\",\"password\":\"strong-manager-password\",\"role\":\"manager\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("manager"));

        mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"team-manager\",\"password\":\"strong-manager-password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("manager"))
                .andExpect(jsonPath("$.access_token").isNotEmpty());

        String managerToken = tokens.create("team-manager", "manager");
        mockMvc.perform(get("/overview").header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/activity/unknown").header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"team-manager\",\"password\":\"strong-manager-password\",\"role\":\"manager\"}"))
                .andExpect(status().isConflict());
        mockMvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"short-pass\",\"password\":\"short\",\"role\":\"admin\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deletingEmployeeAlsoRemovesItsActivityHistory() throws Exception {
        createEmployee();
        String timestamp = OffsetDateTime.now().withNano(0).toString();
        String event = """
                {
                  "employee_id": "%s",
                  "timestamp": "%s",
                  "active_seconds": 30,
                  "idle_seconds": 0,
                  "suspicious": false
                }
                """.formatted(EMPLOYEE_ID, timestamp);
        mockMvc.perform(post("/activity").header("X-Agent-API-Key", "test-agent-api-key").contentType(MediaType.APPLICATION_JSON).content(event))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/employees/{employeeId}", EMPLOYEE_ID).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Employee removed"));

        mockMvc.perform(get("/employees/{employeeId}", EMPLOYEE_ID).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/activity/{employeeId}", EMPLOYEE_ID).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    private void createEmployee() throws Exception {
        mockMvc.perform(post("/employees").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(employeeJson()))
                .andExpect(status().isOk());
    }

    private String employeeJson() {
        return """
                {
                  "employee_id": "%s",
                  "name": "Test Employee",
                  "email": "test.employee@example.test",
                  "phone": "5550100",
                  "designation": "Engineer",
                  "domain": "Software",
                  "department": "Engineering",
                  "location": "Remote",
                  "work_mode": "Remote",
                  "employee_type": "Full-time",
                  "salary_band": "Test",
                  "joining_date": "2026-01-01",
                  "manager_name": "Test Manager",
                  "manager_email": "manager@example.test"
                }
                """.formatted(EMPLOYEE_ID);
    }
}
