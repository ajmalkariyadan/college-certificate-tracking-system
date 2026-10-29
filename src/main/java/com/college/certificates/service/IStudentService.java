package com.college.certificates.service;

import com.college.certificates.dto.StudentProfileUpdateDto;
import com.college.certificates.model.Student;

/**
 * Interface demonstrating Abstraction for Student Management operations.
 */
public interface IStudentService {
    Student getStudentByIdentifier(String studentId);
    Student updateProfile(String studentId, StudentProfileUpdateDto profileDto);
}
