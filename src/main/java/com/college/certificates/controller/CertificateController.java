package com.college.certificates.controller;

import com.college.certificates.dto.ApiResponse;
import com.college.certificates.model.Certificate;
import com.college.certificates.service.ICertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for retrieving available certificate types and requirements.
 */
@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final ICertificateService certificateService;

    @Autowired
    public CertificateController(ICertificateService certificateService) {
        this.certificateService = certificateService;
    }

    /**
     * Endpoint: GET /api/certificates
     * Fetches all available certificate offerings.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Certificate>>> getAllCertificates() {
        List<Certificate> certificates = certificateService.getAllCertificates();
        return ResponseEntity.ok(ApiResponse.success("Certificates retrieved successfully", certificates));
    }

    /**
     * Endpoint: GET /api/certificates/{id}
     * Fetches details of a specific certificate type.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Certificate>> getCertificateById(@PathVariable Long id) {
        Certificate certificate = certificateService.getCertificateById(id);
        return ResponseEntity.ok(ApiResponse.success("Certificate details retrieved successfully", certificate));
    }
}
