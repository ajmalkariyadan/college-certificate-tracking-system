package com.college.certificates.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO used by students to update their profile information.
 */
public class StudentProfileUpdateDto {

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @NotBlank(message = "Phone number cannot be empty")
    private String phoneNumber;

    @NotBlank(message = "Department cannot be empty")
    private String department;

    @NotNull(message = "Semester is required")
    @Min(value = 1, message = "Semester must be at least 1")
    @Max(value = 12, message = "Semester cannot exceed 12")
    private Integer semester;

    public StudentProfileUpdateDto() {
    }

    public StudentProfileUpdateDto(String name, String phoneNumber, String department, Integer semester) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.department = department;
        this.semester = semester;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
}
