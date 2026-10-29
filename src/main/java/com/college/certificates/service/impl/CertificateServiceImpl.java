package com.college.certificates.service.impl;

import com.college.certificates.exception.ResourceNotFoundException;
import com.college.certificates.model.Certificate;
import com.college.certificates.repository.CertificateRepository;
import com.college.certificates.service.ICertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service implementation for managing available College Certificate types.
 */
@Service
public class CertificateServiceImpl implements ICertificateService {

    private final CertificateRepository certificateRepository;

    @Autowired
    public CertificateServiceImpl(CertificateRepository certificateRepository) {
        this.certificateRepository = certificateRepository;
    }

    @Override
    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    @Override
    public Certificate getCertificateById(Long certificateId) {
        return certificateRepository.findById(certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate type not found with ID: " + certificateId));
    }
}
