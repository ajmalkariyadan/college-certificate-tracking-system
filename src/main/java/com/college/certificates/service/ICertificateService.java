package com.college.certificates.service;

import com.college.certificates.model.Certificate;
import java.util.List;

/**
 * Interface demonstrating Abstraction for Certificate Catalogue operations.
 */
public interface ICertificateService {
    List<Certificate> getAllCertificates();
    Certificate getCertificateById(Long certificateId);
}
