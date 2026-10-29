package com.college.certificates.model;

import jakarta.persistence.*;

/**
 * Certificate entity representing the types of certificates offered by the college.
 */
@Entity
@Table(name = "certificates")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "certificate_name", nullable = false, unique = true, length = 100)
    private String certificateName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "processing_days", nullable = false)
    private Integer processingDays = 3;

    @Column(nullable = false)
    private Double fee = 0.0;

    public Certificate() {
    }

    public Certificate(String certificateName, String description, Integer processingDays, Double fee) {
        this.certificateName = certificateName;
        this.description = description;
        this.processingDays = processingDays;
        this.fee = fee;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCertificateName() {
        return certificateName;
    }

    public void setCertificateName(String certificateName) {
        this.certificateName = certificateName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getProcessingDays() {
        return processingDays;
    }

    public void setProcessingDays(Integer processingDays) {
        this.processingDays = processingDays;
    }

    public Double getFee() {
        return fee;
    }

    public void setFee(Double fee) {
        this.fee = fee;
    }

    @Override
    public String toString() {
        return "Certificate{" +
                "id=" + id +
                ", certificateName='" + certificateName + '\'' +
                ", processingDays=" + processingDays +
                ", fee=" + fee +
                '}';
    }
}
