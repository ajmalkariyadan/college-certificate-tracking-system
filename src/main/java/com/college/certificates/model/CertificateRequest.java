package com.college.certificates.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * CertificateRequest entity representing an application filed by a Student.
 * Encapsulates the complete lifecycle, tracking dates, purpose, and admin remarks.
 */
@Entity
@Table(name = "certificate_requests")
public class CertificateRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_user_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certificate_id", nullable = false)
    private Certificate certificate;

    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String purpose;

    @Column(name = "document_type", length = 100)
    private String documentType;

    @Column(name = "document_file_name")
    private String documentFileName;

    @Column(name = "document_file_type", length = 100)
    private String documentFileType;

    @Lob
    @Column(name = "document_data", columnDefinition = "LONGTEXT")
    private String documentData;

    @Column(name = "certificate_number", length = 60, unique = true)
    private String certificateNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RequestStatus status;

    @Column(name = "admin_remarks", columnDefinition = "TEXT")
    private String adminRemarks;

    @Column(name = "issued_date")
    private LocalDate issuedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CertificateRequest() {
        this.requestDate = LocalDate.now();
        this.status = RequestStatus.SUBMITTED;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public CertificateRequest(Student student, Certificate certificate, String purpose) {
        this();
        this.student = student;
        this.certificate = certificate;
        this.purpose = purpose;
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Business method: Checks if the student can cancel this request.
     * Students can cancel only before administrators begin reviewing or processing it.
     */
    public boolean isCancellable() {
        return this.status == RequestStatus.SUBMITTED;
    }

    /**
     * Business method: Checks if the request is awaiting correction or resubmission from the student.
     */
    public boolean isResubmittable() {
        return this.status == RequestStatus.NEEDS_RESUBMISSION;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Certificate getCertificate() {
        return certificate;
    }

    public void setCertificate(Certificate certificate) {
        this.certificate = certificate;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public void setAdminRemarks(String adminRemarks) {
        this.adminRemarks = adminRemarks;
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

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }

    public LocalDate getIssuedDate() {
        return issuedDate;
    }

    public void setIssuedDate(LocalDate issuedDate) {
        this.issuedDate = issuedDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "CertificateRequest{" +
                "id=" + id +
                ", studentId=" + (student != null ? student.getStudentId() : null) +
                ", certificate=" + (certificate != null ? certificate.getCertificateName() : null) +
                ", status=" + status +
                ", requestDate=" + requestDate +
                '}';
    }
}
