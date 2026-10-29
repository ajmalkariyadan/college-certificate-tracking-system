package com.college.certificates.service.impl;

import com.college.certificates.dto.LoginRequest;
import com.college.certificates.dto.LoginResponse;
import com.college.certificates.exception.UnauthorizedException;
import com.college.certificates.model.Admin;
import com.college.certificates.model.Role;
import com.college.certificates.model.Student;
import com.college.certificates.repository.AdminRepository;
import com.college.certificates.repository.StudentRepository;
import com.college.certificates.service.IAuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Implementation of IAuthenticationService handling student and admin authentication.
 */
@Service
public class AuthenticationServiceImpl implements IAuthenticationService {

    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;

    @Autowired
    public AuthenticationServiceImpl(StudentRepository studentRepository, AdminRepository adminRepository) {
        this.studentRepository = studentRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    public LoginResponse authenticate(LoginRequest loginRequest) {
        String inputIdOrEmail = loginRequest.getUsernameOrEmail().trim();
        String password = loginRequest.getPassword();
        Role requestedRole = loginRequest.getRole();

        if (requestedRole == Role.STUDENT) {
            // Find student by studentId or email
            Optional<Student> studentOpt = studentRepository.findByStudentIdOrEmail(inputIdOrEmail, inputIdOrEmail);
            if (studentOpt.isEmpty() || !studentOpt.get().getPassword().equals(password)) {
                throw new UnauthorizedException("Invalid student ID/Email or password");
            }

            Student student = studentOpt.get();
            return new LoginResponse(
                    student.getId(),
                    student.getStudentId(),
                    student.getName(),
                    student.getEmail(),
                    student.getRole(),
                    student.getDepartment(),
                    student.getSemester(),
                    student.getPhoneNumber(),
                    "Student login successful"
            );
        } else if (requestedRole == Role.ADMIN) {
            // Find admin by adminId or email
            Optional<Admin> adminOpt = adminRepository.findByAdminIdOrEmail(inputIdOrEmail, inputIdOrEmail);
            if (adminOpt.isEmpty() || !adminOpt.get().getPassword().equals(password)) {
                throw new UnauthorizedException("Invalid admin ID/Email or password");
            }

            Admin admin = adminOpt.get();
            return new LoginResponse(
                    admin.getId(),
                    admin.getAdminId(),
                    admin.getName(),
                    admin.getEmail(),
                    admin.getRole(),
                    admin.getDepartment(),
                    null,
                    null,
                    "Admin login successful"
            );
        } else {
            throw new UnauthorizedException("Unrecognized role specified");
        }
    }
}
