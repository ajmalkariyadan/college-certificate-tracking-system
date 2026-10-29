package com.college.certificates.model;

/**
 * Enum representing the lifecycle stages of a Certificate Request.
 * Allowed flow:
 * SUBMITTED -> UNDER_REVIEW -> APPROVED -> ISSUED
 * or
 * SUBMITTED -> UNDER_REVIEW -> REJECTED
 * or
 * SUBMITTED -> CANCELLED (by student before processing)
 */
public enum RequestStatus {
    SUBMITTED,
    UNDER_REVIEW,
    APPROVED,
    REJECTED,
    ISSUED,
    CANCELLED,
    NEEDS_RESUBMISSION,
    RESUBMITTED;

    /**
     * Demonstrates encapsulation and business logic inside domain models.
     * Validates whether a state transition is legal according to college policy.
     *
     * @param targetStatus The requested next status
     * @return true if the transition is allowed, false otherwise
     */
    public boolean canTransitionTo(RequestStatus targetStatus) {
        if (targetStatus == null) {
            return false;
        }

        switch (this) {
            case SUBMITTED:
                return targetStatus == UNDER_REVIEW || targetStatus == CANCELLED || targetStatus == NEEDS_RESUBMISSION;
            case UNDER_REVIEW:
                return targetStatus == APPROVED || targetStatus == REJECTED || targetStatus == NEEDS_RESUBMISSION;
            case NEEDS_RESUBMISSION:
                return targetStatus == RESUBMITTED || targetStatus == CANCELLED;
            case RESUBMITTED:
                return targetStatus == UNDER_REVIEW || targetStatus == APPROVED || targetStatus == REJECTED || targetStatus == NEEDS_RESUBMISSION;
            case APPROVED:
                return targetStatus == ISSUED;
            case REJECTED:
            case ISSUED:
            case CANCELLED:
            default:
                return false; // Terminal states cannot transition further
        }
    }
}
