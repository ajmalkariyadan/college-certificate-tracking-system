package com.college.certificates.model;

import jakarta.persistence.*;

/**
 * Admin entity demonstrating Inheritance (extends User) and Polymorphism.
 */
@Entity
@Table(name = "admins")
@PrimaryKeyJoinColumn(name = "id")
public class Admin extends User {

    @Column(name = "admin_id", nullable = false, unique = true, length = 50)
    private String adminId;

    @Column(nullable = false, length = 100)
    private String department;

    /**
     * Default constructor
     */
    public Admin() {
        super();
        setRole(Role.ADMIN);
    }

    /**
     * Parameterized constructor calling superclass constructor
     */
    public Admin(String name, String email, String password, String adminId, String department) {
        super(name, email, password, Role.ADMIN);
        this.adminId = adminId;
        this.department = department;
    }

    // Polymorphic method implementation
    @Override
    public String getRoleDescription() {
        return "Administrator in " + department + " (ID: " + adminId + ")";
    }

    @Override
    public String getIdentifier() {
        return this.adminId;
    }

    // Getters and Setters
    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    @Override
    public String toString() {
        return "Admin{" +
                "id=" + getId() +
                ", adminId='" + adminId + '\'' +
                ", name='" + getName() + '\'' +
                ", department='" + department + '\'' +
                '}';
    }
}
