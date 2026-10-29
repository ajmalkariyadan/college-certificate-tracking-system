package com.college.certificates.service.impl;

import com.college.certificates.dto.AdminStatusUpdateDto;
import com.college.certificates.dto.CertificateRequestCreateDto;
import com.college.certificates.dto.CertificateRequestResponseDto;
import com.college.certificates.exception.BadRequestException;
import com.college.certificates.exception.DuplicateRequestException;
import com.college.certificates.exception.InvalidStatusTransitionException;
import com.college.certificates.exception.ResourceNotFoundException;
import com.college.certificates.model.Certificate;
import com.college.certificates.model.CertificateRequest;
import com.college.certificates.model.RequestStatus;
import com.college.certificates.model.Student;
import com.college.certificates.repository.CertificateRepository;
import com.college.certificates.repository.CertificateRequestRepository;
import com.college.certificates.repository.StudentRepository;
import com.college.certificates.service.ICertificateRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service implementation for managing the certificate request lifecycle and transitions.
 */
@Service
public class CertificateRequestServiceImpl implements ICertificateRequestService {

    private final CertificateRequestRepository requestRepository;
    private final StudentRepository studentRepository;
    private final CertificateRepository certificateRepository;

    @Autowired
    public CertificateRequestServiceImpl(
            CertificateRequestRepository requestRepository,
            StudentRepository studentRepository,
            CertificateRepository certificateRepository) {
        this.requestRepository = requestRepository;
        this.studentRepository = studentRepository;
        this.certificateRepository = certificateRepository;
    }

    @Override
    @Transactional
    public CertificateRequestResponseDto submitRequest(CertificateRequestCreateDto createDto) {
        // Validate Student existence
        Student student = studentRepository.findByStudentId(createDto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + createDto.getStudentId()));

        // Validate Certificate type existence
        Certificate certificate = certificateRepository.findById(createDto.getCertificateId())
                .orElseThrow(() -> new ResourceNotFoundException("Certificate type not found with ID: " + createDto.getCertificateId()));

        // Check for duplicate active requests (SUBMITTED or UNDER_REVIEW)
        List<RequestStatus> activeStatuses = Arrays.asList(RequestStatus.SUBMITTED, RequestStatus.UNDER_REVIEW);
        boolean hasDuplicate = requestRepository.existsByStudentStudentIdAndCertificateIdAndStatusIn(
                student.getStudentId(), certificate.getId(), activeStatuses);

        if (hasDuplicate) {
            throw new DuplicateRequestException("You already have an active request for '" 
                    + certificate.getCertificateName() 
                    + "'. Please wait until it is processed or cancel it before re-applying.");
        }

        // Create and persist new request
        CertificateRequest request = new CertificateRequest(student, certificate, createDto.getPurpose().trim());
        request.setDocumentType(createDto.getDocumentType());
        request.setDocumentFileName(createDto.getDocumentFileName());
        request.setDocumentFileType(createDto.getDocumentFileType());
        request.setDocumentData(createDto.getDocumentData());
        CertificateRequest savedRequest = requestRepository.save(request);

        return CertificateRequestResponseDto.fromEntity(savedRequest);
    }

    @Override
    public List<CertificateRequestResponseDto> getRequestsByStudent(String studentId) {
        // Verify student exists
        if (!studentRepository.existsByStudentId(studentId)) {
            throw new ResourceNotFoundException("Student not found with ID: " + studentId);
        }

        return requestRepository.findByStudentStudentIdOrderByRequestDateDesc(studentId)
                .stream()
                .map(CertificateRequestResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public CertificateRequestResponseDto getRequestById(Long requestId) {
        CertificateRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate request not found with ID: " + requestId));
        return CertificateRequestResponseDto.fromEntity(request);
    }

    @Override
    @Transactional
    public CertificateRequestResponseDto cancelRequest(Long requestId) {
        CertificateRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate request not found with ID: " + requestId));

        if (!request.isCancellable()) {
            throw new InvalidStatusTransitionException(
                    "Cannot cancel request #" + requestId + " because its current status is '" + request.getStatus() + "'.");
        }

        request.setStatus(RequestStatus.CANCELLED);
        request.setAdminRemarks("Cancelled by student.");
        CertificateRequest updated = requestRepository.save(request);

        return CertificateRequestResponseDto.fromEntity(updated);
    }

    // Method Overloading: Implementation 1 (no filter)
    @Override
    public List<CertificateRequestResponseDto> getAllRequests() {
        return getAllRequests(null);
    }

    // Method Overloading: Implementation 2 (with optional status filter)
    @Override
    public List<CertificateRequestResponseDto> getAllRequests(RequestStatus status) {
        List<CertificateRequest> requests;
        if (status != null) {
            requests = requestRepository.findByStatusOrderByRequestDateDesc(status);
        } else {
            requests = requestRepository.findAllByOrderByRequestDateDesc();
        }

        return requests.stream()
                .map(CertificateRequestResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CertificateRequestResponseDto markUnderReview(Long requestId, AdminStatusUpdateDto updateDto) {
        CertificateRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.SUBMITTED && request.getStatus() != RequestStatus.RESUBMITTED) {
            throw new InvalidStatusTransitionException(
                    "Request #" + requestId + " cannot be moved to UNDER_REVIEW from '" + request.getStatus() + "'");
        }

        request.setStatus(RequestStatus.UNDER_REVIEW);
        if (updateDto != null && updateDto.getRemarks() != null && !updateDto.getRemarks().isBlank()) {
            request.setAdminRemarks(updateDto.getRemarks().trim());
        } else {
            request.setAdminRemarks("Application documents are currently under verification.");
        }

        CertificateRequest updated = requestRepository.save(request);
        return CertificateRequestResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public CertificateRequestResponseDto requestResubmission(Long requestId, AdminStatusUpdateDto updateDto) {
        CertificateRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.SUBMITTED &&
            request.getStatus() != RequestStatus.UNDER_REVIEW &&
            request.getStatus() != RequestStatus.RESUBMITTED) {
            throw new InvalidStatusTransitionException(
                    "Cannot request changes on a request in " + request.getStatus() + " status.");
        }

        if (updateDto == null || updateDto.getRemarks() == null || updateDto.getRemarks().trim().isEmpty()) {
            throw new BadRequestException("Please specify what changes or documents are required from the student.");
        }

        request.setStatus(RequestStatus.NEEDS_RESUBMISSION);
        request.setAdminRemarks("Action Required: " + updateDto.getRemarks().trim());

        CertificateRequest updated = requestRepository.save(request);
        return CertificateRequestResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public CertificateRequestResponseDto resubmitRequest(Long requestId, CertificateRequestCreateDto resubmitDto) {
        CertificateRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.NEEDS_RESUBMISSION) {
            throw new InvalidStatusTransitionException(
                    "Request #" + requestId + " is not currently awaiting resubmission. Current status: " + request.getStatus());
        }

        if (resubmitDto != null) {
            if (resubmitDto.getPurpose() != null && !resubmitDto.getPurpose().trim().isEmpty()) {
                request.setPurpose(resubmitDto.getPurpose().trim());
            }

            if (resubmitDto.getDocumentData() != null && !resubmitDto.getDocumentData().trim().isEmpty()) {
                request.setDocumentData(resubmitDto.getDocumentData());
                request.setDocumentFileName(resubmitDto.getDocumentFileName());
                request.setDocumentFileType(resubmitDto.getDocumentFileType());
                request.setDocumentType(resubmitDto.getDocumentType());
            }
        }

        request.setStatus(RequestStatus.RESUBMITTED);
        String currentRemarks = request.getAdminRemarks() != null ? request.getAdminRemarks() : "";
        request.setAdminRemarks("Updated by student with corrected details/documents. (Previous note: " + currentRemarks + ")");

        CertificateRequest updated = requestRepository.save(request);
        return CertificateRequestResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public CertificateRequestResponseDto approveRequest(Long requestId, AdminStatusUpdateDto updateDto) {
        CertificateRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.UNDER_REVIEW && request.getStatus() != RequestStatus.RESUBMITTED) {
            throw new InvalidStatusTransitionException(
                    "Request #" + requestId + " must be in UNDER_REVIEW or RESUBMITTED status before approval. Current status: " + request.getStatus());
        }

        request.setStatus(RequestStatus.APPROVED);
        if (updateDto != null && updateDto.getRemarks() != null && !updateDto.getRemarks().isBlank()) {
            request.setAdminRemarks(updateDto.getRemarks().trim());
        } else {
            request.setAdminRemarks("Approved by Academic Office. Ready for issuance.");
        }

        CertificateRequest updated = requestRepository.save(request);
        return CertificateRequestResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public CertificateRequestResponseDto rejectRequest(Long requestId, AdminStatusUpdateDto updateDto) {
        CertificateRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.UNDER_REVIEW && request.getStatus() != RequestStatus.RESUBMITTED && request.getStatus() != RequestStatus.SUBMITTED) {
            throw new InvalidStatusTransitionException(
                    "Request #" + requestId + " cannot be rejected in current status: " + request.getStatus());
        }

        if (updateDto == null || updateDto.getRemarks() == null || updateDto.getRemarks().trim().isEmpty()) {
            throw new BadRequestException("Rejection reason/remarks are mandatory when rejecting a certificate request.");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setAdminRemarks(updateDto.getRemarks().trim());

        CertificateRequest updated = requestRepository.save(request);
        return CertificateRequestResponseDto.fromEntity(updated);
    }

    @Override
    @Transactional
    public CertificateRequestResponseDto issueCertificate(Long requestId, AdminStatusUpdateDto updateDto) {
        CertificateRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate request not found with ID: " + requestId));

        if (request.getStatus() != RequestStatus.APPROVED) {
            throw new InvalidStatusTransitionException(
                    "Request #" + requestId + " must be in APPROVED status before it can be ISSUED. Current status: " + request.getStatus());
        }

        request.setStatus(RequestStatus.ISSUED);
        request.setIssuedDate(LocalDate.now());

        if (request.getCertificateNumber() == null || request.getCertificateNumber().isBlank()) {
            String certNo = "CERT-" + LocalDate.now().getYear() + "-"
                    + String.format("%04d", request.getId()) + "-"
                    + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
            request.setCertificateNumber(certNo);
        }

        if (updateDto != null && updateDto.getRemarks() != null && !updateDto.getRemarks().isBlank()) {
            request.setAdminRemarks(updateDto.getRemarks().trim());
        } else {
            request.setAdminRemarks("Certificate issued successfully. Student may collect or download certificate.");
        }

        CertificateRequest updated = requestRepository.save(request);
        return CertificateRequestResponseDto.fromEntity(updated);
    }
}
