package com.college.certificates.service;

import com.college.certificates.dto.LoginRequest;
import com.college.certificates.dto.LoginResponse;

/**
 * Interface demonstrating Abstraction for User Authentication operations.
 */
public interface IAuthenticationService {
    LoginResponse authenticate(LoginRequest loginRequest);
}
