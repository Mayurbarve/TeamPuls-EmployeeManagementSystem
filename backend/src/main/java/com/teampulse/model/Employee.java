package com.teampulse.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @Column(name = "employee_id", nullable = false, length = 80)
    private String employeeId;
    @Column(nullable = false) private String name;
    private String email;
    private String phone;
    private String designation;
    private String domain;
    private String department;
    private String location;
    @Column(name = "work_mode") private String workMode;
    @Column(name = "employee_type") private String employeeType;
    @Column(name = "salary_band") private String salaryBand;
    @Column(name = "joining_date") private String joiningDate;
    @Column(name = "manager_name") private String managerName;
    @Column(name = "manager_email") private String managerEmail;
    private String status = "Inactive";

    public Employee() {}

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }
    public String getEmployeeType() { return employeeType; }
    public void setEmployeeType(String employeeType) { this.employeeType = employeeType; }
    public String getSalaryBand() { return salaryBand; }
    public void setSalaryBand(String salaryBand) { this.salaryBand = salaryBand; }
    public String getJoiningDate() { return joiningDate; }
    public void setJoiningDate(String joiningDate) { this.joiningDate = joiningDate; }
    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }
    public String getManagerEmail() { return managerEmail; }
    public void setManagerEmail(String managerEmail) { this.managerEmail = managerEmail; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
