package com.college.certificates.repository;

import com.college.certificates.model.CertificateRequest;
import com.college.certificates.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificateRequestRepository extends JpaRepository<CertificateRequest, Long> {

    // Retrieve all requests submitted by a specific student ID
    List<CertificateRequest> findByStudentStudentIdOrderByRequestDateDesc(String studentId);

    // Retrieve requests by specific lifecycle status
    List<CertificateRequest> findByStatusOrderByRequestDateDesc(RequestStatus status);

    // Retrieve all requests in reverse chronological order
    List<CertificateRequest> findAllByOrderByRequestDateDesc();

    // Check if the student already has an active request for the same certificate
    boolean existsByStudentStudentIdAndCertificateIdAndStatusIn(
            String studentId,
            Long certificateId,
            List<RequestStatus> statuses
    );
}
