package com.college.certificates.repository;

import com.college.certificates.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByAdminId(String adminId);
    Optional<Admin> findByEmail(String email);
    Optional<Admin> findByAdminIdOrEmail(String adminId, String email);
    boolean existsByAdminId(String adminId);
    boolean existsByEmail(String email);
}
