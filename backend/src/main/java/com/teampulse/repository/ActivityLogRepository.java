package com.teampulse.repository;

import com.teampulse.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findAllByEmployeeIdAndDateOrderByTimestampAsc(String employeeId, LocalDate date);
    List<ActivityLog> findAllByDate(LocalDate date);
    void deleteAllByEmployeeId(String employeeId);
}
