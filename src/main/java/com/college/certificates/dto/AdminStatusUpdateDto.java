package com.college.certificates.dto;

/**
 * DTO carrying administrator remarks during status updates (review, approve, reject, issue).
 */
public class AdminStatusUpdateDto {

    private String remarks;

    public AdminStatusUpdateDto() {
    }

    public AdminStatusUpdateDto(String remarks) {
        this.remarks = remarks;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
