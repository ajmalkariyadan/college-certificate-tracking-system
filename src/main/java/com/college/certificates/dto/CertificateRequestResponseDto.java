package com.college.certificates.dto;

import com.college.certificates.model.CertificateRequest;
import com.college.certificates.model.RequestStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO returned to clients representing complete information about a Certificate Request.
 */
public class CertificateRequestResponseDto {

    private Long requestId;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String department;
    private Integer semester;
    private String phoneNumber;

    private Long certificateId;
    private String certificateName;
    private String certificateDescription;
    private Double certificateFee;

    private LocalDate requestDate;
    private String purpose;
    private String documentType;
    private String documentFileName;
    private String documentFileType;
    private String documentData;
    private String certificateNumber;
    private RequestStatus status;
    private String adminRemarks;
    private LocalDate issuedDate;
    private boolean cancellable;
    private boolean resubmittable;
    private LocalDateTime createdAt;

    public CertificateRequestResponseDto() {
    }

    /**
     * Convenient constructor mapping domain entity directly to DTO.
     */
    public static CertificateRequestResponseDto fromEntity(CertificateRequest request) {
        CertificateRequestResponseDto dto = new CertificateRequestResponseDto();
        dto.setRequestId(request.getId());
        dto.setRequestDate(request.getRequestDate());
        dto.setPurpose(request.getPurpose());
        dto.setDocumentType(request.getDocumentType());
        dto.setDocumentFileName(request.getDocumentFileName());
        dto.setDocumentFileType(request.getDocumentFileType());
        dto.setDocumentData(request.getDocumentData());
        dto.setCertificateNumber(request.getCertificateNumber());
        dto.setStatus(request.getStatus());
        dto.setAdminRemarks(request.getAdminRemarks());
        dto.setIssuedDate(request.getIssuedDate());
        dto.setCancellable(request.isCancellable());
        dto.setResubmittable(request.isResubmittable());
        dto.setCreatedAt(request.getCreatedAt());

        if (request.getStudent() != null) {
            dto.setStudentId(request.getStudent().getStudentId());
            dto.setStudentName(request.getStudent().getName());
            dto.setStudentEmail(request.getStudent().getEmail());
            dto.setDepartment(request.getStudent().getDepartment());
            dto.setSemester(request.getStudent().getSemester());
            dto.setPhoneNumber(request.getStudent().getPhoneNumber());
        }

        if (request.getCertificate() != null) {
            dto.setCertificateId(request.getCertificate().getId());
            dto.setCertificateName(request.getCertificate().getCertificateName());
            dto.setCertificateDescription(request.getCertificate().getDescription());
            dto.setCertificateFee(request.getCertificate().getFee());
        }

        return dto;
    }

    // Getters and Setters
    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Long getCertificateId() {
        return certificateId;
    }

    public void setCertificateId(Long certificateId) {
        this.certificateId = certificateId;
    }

    public String getCertificateName() {
        return certificateName;
    }

    public void setCertificateName(String certificateName) {
        this.certificateName = certificateName;
    }

    public String getCertificateDescription() {
        return certificateDescription;
    }

    public void setCertificateDescription(String certificateDescription) {
        this.certificateDescription = certificateDescription;
    }

    public Double getCertificateFee() {
        return certificateFee;
    }

    public void setCertificateFee(Double certificateFee) {
        this.certificateFee = certificateFee;
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

    public boolean isCancellable() {
        return cancellable;
    }

    public void setCancellable(boolean cancellable) {
        this.cancellable = cancellable;
    }

    public boolean isResubmittable() {
        return resubmittable;
    }

    public void setResubmittable(boolean resubmittable) {
        this.resubmittable = resubmittable;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
