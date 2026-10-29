package com.college.certificates.exception;

/**
 * Exception thrown when attempting an illegal lifecycle transition on a CertificateRequest.
 */
public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
