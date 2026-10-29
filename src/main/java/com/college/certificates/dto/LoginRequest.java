package com.college.certificates.dto;

import com.college.certificates.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for incoming user authentication requests.
 */
public class LoginRequest {

    @NotBlank(message = "Email or ID is required")
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    private String password;

    @NotNull(message = "Role must be specified (STUDENT or ADMIN)")
    private Role role;

    public LoginRequest() {
    }

    public LoginRequest(String usernameOrEmail, String password, Role role) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
        this.role = role;
    }

    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
