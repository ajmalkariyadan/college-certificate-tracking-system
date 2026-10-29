package com.college.certificates.exception;

/**
 * Exception thrown when authentication fails or unauthorized action is attempted.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
