package com.college.certificates.exception;

/**
 * Exception thrown when a requested resource (Student, Admin, Certificate, Request) cannot be found.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
