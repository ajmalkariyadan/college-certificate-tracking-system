package com.college.certificates.model;

import jakarta.persistence.*;

/**
 * Student entity demonstrating Inheritance (extends User) and Polymorphism.
 */
@Entity
@Table(name = "students")
@PrimaryKeyJoinColumn(name = "id")
public class Student extends User {

    @Column(name = "student_id", nullable = false, unique = true, length = 50)
    private String studentId;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false)
    private Integer semester;

    /**
     * Default constructor
     */
    public Student() {
        super();
        setRole(Role.STUDENT);
    }

    /**
     * Parameterized constructor calling superclass constructor
     */
    public Student(String name, String email, String password, String studentId, 
                   String phoneNumber, String department, Integer semester) {
        super(name, email, password, Role.STUDENT);
        this.studentId = studentId;
        this.phoneNumber = phoneNumber;
        this.department = department;
        this.semester = semester;
    }

    // Polymorphic method implementation
    @Override
    public String getRoleDescription() {
        return "Student in Department: " + department + ", Semester: " + semester;
    }

    @Override
    public String getIdentifier() {
        return this.studentId;
    }

    // Getters and Setters
    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
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

    @Override
    public String toString() {
        return "Student{" +
                "id=" + getId() +
                ", studentId='" + studentId + '\'' +
                ", name='" + getName() + '\'' +
                ", department='" + department + '\'' +
                ", semester=" + semester +
                '}';
    }
}
