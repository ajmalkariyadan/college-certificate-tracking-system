package com.college.certificates.controller;

import com.college.certificates.dto.ApiResponse;
import com.college.certificates.dto.StudentProfileUpdateDto;
import com.college.certificates.model.Student;
import com.college.certificates.service.IStudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Student profile management.
 */
@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final IStudentService studentService;

    @Autowired
    public StudentController(IStudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * Endpoint: GET /api/students/{studentId}
     * Retrieves student profile details by Student ID.
     */
    @GetMapping("/{studentId}")
    public ResponseEntity<ApiResponse<Student>> getStudentProfile(@PathVariable String studentId) {
        Student student = studentService.getStudentByIdentifier(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student profile retrieved successfully", student));
    }

    /**
     * Endpoint: PUT /api/students/{studentId}
     * Updates student profile information.
     */
    @PutMapping("/{studentId}")
    public ResponseEntity<ApiResponse<Student>> updateProfile(
            @PathVariable String studentId,
            @Valid @RequestBody StudentProfileUpdateDto profileDto) {
        Student updatedStudent = studentService.updateProfile(studentId, profileDto);
        return ResponseEntity.ok(ApiResponse.success("Student profile updated successfully", updatedStudent));
    }
}
