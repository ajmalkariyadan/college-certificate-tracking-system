package com.college.certificates.controller;

import com.college.certificates.dto.ApiResponse;
import com.college.certificates.dto.CertificateRequestCreateDto;
import com.college.certificates.dto.CertificateRequestResponseDto;
import com.college.certificates.service.ICertificateRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller handling student certificate request submissions and status tracking.
 */
@RestController
@RequestMapping("/api/requests")
public class CertificateRequestController {

    private final ICertificateRequestService requestService;

    @Autowired
    public CertificateRequestController(ICertificateRequestService requestService) {
        this.requestService = requestService;
    }

    /**
     * Endpoint: POST /api/requests
     * Submits a new certificate request on behalf of a student.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CertificateRequestResponseDto>> submitRequest(
            @Valid @RequestBody CertificateRequestCreateDto createDto) {
        CertificateRequestResponseDto response = requestService.submitRequest(createDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Certificate request submitted successfully", response));
    }

    /**
     * Endpoint: GET /api/requests/student/{studentId}
     * Retrieves all certificate requests submitted by a specific student.
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<CertificateRequestResponseDto>>> getRequestsByStudent(
            @PathVariable String studentId) {
        List<CertificateRequestResponseDto> requests = requestService.getRequestsByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student requests retrieved successfully", requests));
    }

    /**
     * Endpoint: GET /api/requests/{requestId}
     * Retrieves complete details of a specific request.
     */
    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<CertificateRequestResponseDto>> getRequestById(
            @PathVariable Long requestId) {
        CertificateRequestResponseDto request = requestService.getRequestById(requestId);
        return ResponseEntity.ok(ApiResponse.success("Request details retrieved successfully", request));
    }

    /**
     * Endpoint: PUT /api/requests/{requestId}/cancel
     * Allows a student to cancel a request if it has not yet been processed (SUBMITTED status).
     */
    @PutMapping("/{requestId}/cancel")
    public ResponseEntity<ApiResponse<CertificateRequestResponseDto>> cancelRequest(
            @PathVariable Long requestId) {
        CertificateRequestResponseDto response = requestService.cancelRequest(requestId);
        return ResponseEntity.ok(ApiResponse.success("Certificate request cancelled successfully", response));
    }

    /**
     * Endpoint: PUT /api/requests/{requestId}/resubmit
     * Allows a student to update details/documents and resubmit a request in NEEDS_RESUBMISSION status.
     */
    @PutMapping("/{requestId}/resubmit")
    public ResponseEntity<ApiResponse<CertificateRequestResponseDto>> resubmitRequest(
            @PathVariable Long requestId,
            @RequestBody CertificateRequestCreateDto resubmitDto) {
        CertificateRequestResponseDto response = requestService.resubmitRequest(requestId, resubmitDto);
        return ResponseEntity.ok(ApiResponse.success("Certificate request resubmitted successfully", response));
    }
}
