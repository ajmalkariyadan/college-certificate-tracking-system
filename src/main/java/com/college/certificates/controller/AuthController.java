package com.college.certificates.controller;

import com.college.certificates.dto.ApiResponse;
import com.college.certificates.dto.LoginRequest;
import com.college.certificates.dto.LoginResponse;
import com.college.certificates.service.IAuthenticationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller handling user authentication (Student and Admin login).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final IAuthenticationService authService;

    @Autowired
    public AuthController(IAuthenticationService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint: POST /api/auth/login
     * Authenticates a student or admin user.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.authenticate(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
