package com.college.certificates.service.impl;

import com.college.certificates.dto.StudentProfileUpdateDto;
import com.college.certificates.exception.ResourceNotFoundException;
import com.college.certificates.model.Student;
import com.college.certificates.repository.StudentRepository;
import com.college.certificates.service.IStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Student Profile Management.
 */
@Service
public class StudentServiceImpl implements IStudentService {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public Student getStudentByIdentifier(String studentId) {
        return studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with Student ID: " + studentId));
    }

    @Override
    @Transactional
    public Student updateProfile(String studentId, StudentProfileUpdateDto profileDto) {
        Student student = getStudentByIdentifier(studentId);

        // Update fields with encapsulation
        student.setName(profileDto.getName().trim());
        student.setPhoneNumber(profileDto.getPhoneNumber().trim());
        student.setDepartment(profileDto.getDepartment().trim());
        student.setSemester(profileDto.getSemester());

        return studentRepository.save(student);
    }
}
