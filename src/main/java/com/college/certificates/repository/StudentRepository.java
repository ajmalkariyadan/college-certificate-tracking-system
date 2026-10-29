package com.college.certificates.repository;

import com.college.certificates.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByEmail(String email);
    Optional<Student> findByStudentIdOrEmail(String studentId, String email);
    boolean existsByStudentId(String studentId);
    boolean existsByEmail(String email);
}
