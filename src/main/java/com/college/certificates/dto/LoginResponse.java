package com.college.certificates.dto;

import com.college.certificates.model.Role;

/**
 * DTO returned after successful authentication.
 */
public class LoginResponse {

    private Long id;
    private String identifier; // studentId or adminId
    private String name;
    private String email;
    private Role role;
    private String department;
    private Integer semester;
    private String phoneNumber;
    private String message;

    public LoginResponse() {
    }

    public LoginResponse(Long id, String identifier, String name, String email, Role role,
                         String department, Integer semester, String phoneNumber, String message) {
        this.id = id;
        this.identifier = identifier;
        this.name = name;
        this.email = email;
        this.role = role;
        this.department = department;
        this.semester = semester;
        this.phoneNumber = phoneNumber;
        this.message = message;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
