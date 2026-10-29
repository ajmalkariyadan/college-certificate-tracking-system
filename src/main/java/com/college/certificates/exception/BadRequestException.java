package com.college.certificates.exception;

/**
 * Exception thrown for malformed requests or domain validation violations.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
