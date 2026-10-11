package com.teampulse.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "activity_logs", indexes = {
        @Index(name = "idx_activity_employee_date", columnList = "employee_id, activity_date")
})
public class ActivityLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "employee_id", nullable = false, length = 80)
    private String employeeId;
    @Column(name = "activity_date", nullable = false)
    private LocalDate date;
    @Column(nullable = false)
    private OffsetDateTime timestamp;
    @Column(name = "active_seconds", nullable = false)
    private int activeSeconds;
    @Column(name = "idle_seconds", nullable = false)
    private int idleSeconds;
    @Column(nullable = false)
    private boolean suspicious;
    private String activeAppExe;
    private String activeAppTitle;

    protected ActivityLog() {}
    public ActivityLog(String employeeId, OffsetDateTime timestamp, int activeSeconds, int idleSeconds,
                       boolean suspicious, String activeAppExe, String activeAppTitle) {
        this.employeeId = employeeId;
        this.timestamp = timestamp;
        this.date = timestamp.toLocalDate();
        this.activeSeconds = activeSeconds;
        this.idleSeconds = idleSeconds;
        this.suspicious = suspicious;
        this.activeAppExe = activeAppExe;
        this.activeAppTitle = activeAppTitle;
    }
    public Long getId() { return id; }
    public String getEmployeeId() { return employeeId; }
    public LocalDate getDate() { return date; }
    public OffsetDateTime getTimestamp() { return timestamp; }
    public int getActiveSeconds() { return activeSeconds; }
    public int getIdleSeconds() { return idleSeconds; }
    public boolean isSuspicious() { return suspicious; }
    public String getActiveAppExe() { return activeAppExe; }
    public String getActiveAppTitle() { return activeAppTitle; }
}
