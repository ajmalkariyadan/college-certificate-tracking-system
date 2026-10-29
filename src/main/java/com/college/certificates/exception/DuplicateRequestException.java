package com.college.certificates.exception;

/**
 * Exception thrown when a student attempts to submit a duplicate pending certificate request.
 */
public class DuplicateRequestException extends RuntimeException {
    public DuplicateRequestException(String message) {
        super(message);
    }
}
