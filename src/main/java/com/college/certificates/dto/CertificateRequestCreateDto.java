package com.college.certificates.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO received when a student submits a new certificate request.
 */
public class CertificateRequestCreateDto {

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotNull(message = "Certificate type selection is required")
    private Long certificateId;

    @NotBlank(message = "Purpose is required")
    @Size(min = 10, max = 1000, message = "Purpose must be between 10 and 1000 characters")
    private String purpose;

    private String documentType;
    private String documentFileName;
    private String documentFileType;
    private String documentData;

    public CertificateRequestCreateDto() {
    }

    public CertificateRequestCreateDto(String studentId, Long certificateId, String purpose) {
        this.studentId = studentId;
        this.certificateId = certificateId;
        this.purpose = purpose;
    }

    public CertificateRequestCreateDto(String studentId, Long certificateId, String purpose,
                                       String documentType, String documentFileName,
                                       String documentFileType, String documentData) {
        this.studentId = studentId;
        this.certificateId = certificateId;
        this.purpose = purpose;
        this.documentType = documentType;
        this.documentFileName = documentFileName;
        this.documentFileType = documentFileType;
        this.documentData = documentData;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public Long getCertificateId() {
        return certificateId;
    }

    public void setCertificateId(Long certificateId) {
        this.certificateId = certificateId;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getDocumentFileName() {
        return documentFileName;
    }

    public void setDocumentFileName(String documentFileName) {
        this.documentFileName = documentFileName;
    }

    public String getDocumentFileType() {
        return documentFileType;
    }

    public void setDocumentFileType(String documentFileType) {
        this.documentFileType = documentFileType;
    }

    public String getDocumentData() {
        return documentData;
    }

    public void setDocumentData(String documentData) {
        this.documentData = documentData;
    }
}
