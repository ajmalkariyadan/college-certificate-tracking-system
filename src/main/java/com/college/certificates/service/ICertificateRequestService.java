package com.college.certificates.service;

import com.college.certificates.dto.AdminStatusUpdateDto;
import com.college.certificates.dto.CertificateRequestCreateDto;
import com.college.certificates.dto.CertificateRequestResponseDto;
import com.college.certificates.model.RequestStatus;

import java.util.List;

/**
 * Interface defining lifecycle operations for Certificate Requests.
 */
public interface ICertificateRequestService {

    // Student Operations
    CertificateRequestResponseDto submitRequest(CertificateRequestCreateDto createDto);
    List<CertificateRequestResponseDto> getRequestsByStudent(String studentId);
    CertificateRequestResponseDto getRequestById(Long requestId);
    CertificateRequestResponseDto cancelRequest(Long requestId);
    CertificateRequestResponseDto resubmitRequest(Long requestId, CertificateRequestCreateDto resubmitDto);

    // Admin Operations (Demonstrating Method Overloading for request queries)
    List<CertificateRequestResponseDto> getAllRequests();
    List<CertificateRequestResponseDto> getAllRequests(RequestStatus status);

    // Lifecycle Status Transitions
    CertificateRequestResponseDto markUnderReview(Long requestId, AdminStatusUpdateDto updateDto);
    CertificateRequestResponseDto requestResubmission(Long requestId, AdminStatusUpdateDto updateDto);
    CertificateRequestResponseDto approveRequest(Long requestId, AdminStatusUpdateDto updateDto);
    CertificateRequestResponseDto rejectRequest(Long requestId, AdminStatusUpdateDto updateDto);
    CertificateRequestResponseDto issueCertificate(Long requestId, AdminStatusUpdateDto updateDto);
}
