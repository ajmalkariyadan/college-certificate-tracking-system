package com.college.certificates.controller;

import com.college.certificates.dto.AdminStatusUpdateDto;
import com.college.certificates.dto.ApiResponse;
import com.college.certificates.dto.CertificateRequestResponseDto;
import com.college.certificates.model.RequestStatus;
import com.college.certificates.service.ICertificateRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller handling administrator actions: reviewing, approving, rejecting, and issuing certificates.
 */
@RestController
@RequestMapping("/api/admin/requests")
public class AdminRequestController {

    private final ICertificateRequestService requestService;

    @Autowired
    public AdminRequestController(ICertificateRequestService requestService) {
        this.requestService = requestService;
    }

    /**
     * Endpoint: GET /api/admin/requests
     * Retrieves all certificate requests, optionally filtered by status query parameter.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CertificateRequestResponseDto>>> getAllRequests(
            @RequestParam(required = false) RequestStatus status) {
        List<CertificateRequestResponseDto> requests;
        if (status != null) {
            requests = requestService.getAllRequests(status);
        } else {
            requests = requestService.getAllRequests();
        }
        return ResponseEntity.ok(ApiResponse.success("Requests retrieved successfully", requests));
    }

    /**
     * Endpoint: PUT /api/admin/requests/{requestId}/review
     * Updates request status to UNDER_REVIEW.
     */
    @PutMapping("/{requestId}/review")
    public ResponseEntity<ApiResponse<CertificateRequestResponseDto>> markUnderReview(
            @PathVariable Long requestId,
            @RequestBody(required = false) AdminStatusUpdateDto updateDto) {
        CertificateRequestResponseDto response = requestService.markUnderReview(requestId, updateDto);
        return ResponseEntity.ok(ApiResponse.success("Request marked as UNDER_REVIEW", response));
    }

    /**
     * Endpoint: PUT /api/admin/requests/{requestId}/approve
     * Approves an under-review request.
     */
    @PutMapping("/{requestId}/approve")
    public ResponseEntity<ApiResponse<CertificateRequestResponseDto>> approveRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) AdminStatusUpdateDto updateDto) {
        CertificateRequestResponseDto response = requestService.approveRequest(requestId, updateDto);
        return ResponseEntity.ok(ApiResponse.success("Request APPROVED successfully", response));
    }

    /**
     * Endpoint: PUT /api/admin/requests/{requestId}/reject
     * Rejects an under-review request with mandatory reason/remarks.
     */
    @PutMapping("/{requestId}/reject")
    public ResponseEntity<ApiResponse<CertificateRequestResponseDto>> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody AdminStatusUpdateDto updateDto) {
        CertificateRequestResponseDto response = requestService.rejectRequest(requestId, updateDto);
        return ResponseEntity.ok(ApiResponse.success("Request REJECTED", response));
    }

    /**
     * Endpoint: PUT /api/admin/requests/{requestId}/request-changes
     * Requests resubmission or corrections from student.
     */
    @PutMapping("/{requestId}/request-changes")
    public ResponseEntity<ApiResponse<CertificateRequestResponseDto>> requestChanges(
            @PathVariable Long requestId,
            @RequestBody AdminStatusUpdateDto updateDto) {
        CertificateRequestResponseDto response = requestService.requestResubmission(requestId, updateDto);
        return ResponseEntity.ok(ApiResponse.success("Resubmission requested from student", response));
    }

    /**
     * Endpoint: PUT /api/admin/requests/{requestId}/issue
     * Marks an approved request as ISSUED and records the issued date.
     */
    @PutMapping("/{requestId}/issue")
    public ResponseEntity<ApiResponse<CertificateRequestResponseDto>> issueCertificate(
            @PathVariable Long requestId,
            @RequestBody(required = false) AdminStatusUpdateDto updateDto) {
        CertificateRequestResponseDto response = requestService.issueCertificate(requestId, updateDto);
        return ResponseEntity.ok(ApiResponse.success("Certificate marked as ISSUED", response));
    }
}
