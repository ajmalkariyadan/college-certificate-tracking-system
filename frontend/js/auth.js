/**
 * Authentication handling script for index.html
 */
document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect automatically
    const existingUser = getCurrentUser();
    if (existingUser) {
        if (existingUser.role === 'STUDENT') {
            window.location.href = 'student-dashboard.html';
        } else if (existingUser.role === 'ADMIN') {
            window.location.href = 'admin-dashboard.html';
        }
    }

    let activeRole = 'STUDENT';

    const tabStudent = document.getElementById('tab-student');
    const tabAdmin = document.getElementById('tab-admin');
    const roleInput = document.getElementById('role-input');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('login-form');
    const errorAlert = document.getElementById('login-error');

    // Tab toggle functionality
    function setRole(role) {
        activeRole = role;
        roleInput.value = role;

        if (role === 'STUDENT') {
            tabStudent.classList.add('active');
            tabAdmin.classList.remove('active');
            usernameInput.placeholder = 'Student ID (e.g. STU2024001) or Email';
        } else {
            tabAdmin.classList.add('active');
            tabStudent.classList.remove('active');
            usernameInput.placeholder = 'Admin ID (e.g. ADM101) or Email';
        }
        errorAlert.style.display = 'none';
    }

    if (tabStudent && tabAdmin) {
        tabStudent.addEventListener('click', () => setRole('STUDENT'));
        tabAdmin.addEventListener('click', () => setRole('ADMIN'));
    }

    // Demo Fillers for testing
    window.fillDemoStudent = function() {
        setRole('STUDENT');
        usernameInput.value = 'STU2024001';
        passwordInput.value = 'student123';
    };

    window.fillDemoAdmin = function() {
        setRole('ADMIN');
        usernameInput.value = 'admin@college.edu';
        passwordInput.value = 'admin123';
    };

    window.launchDemoDirectly = function(role) {
        setDemoMode(true);
        if (role === 'STUDENT') {
            fillDemoStudent();
        } else {
            fillDemoAdmin();
        }
        if (loginForm) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    };

    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorAlert.style.display = 'none';

            const usernameOrEmail = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!usernameOrEmail || !password) {
                showError('Please enter both your ID/Email and password.');
                return;
            }

            try {
                const btnSubmit = loginForm.querySelector('button[type="submit"]');
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Authenticating...';

                const response = await apiCall('/auth/login', 'POST', {
                    usernameOrEmail: usernameOrEmail,
                    password: password,
                    role: activeRole
                });

                if (response.success && response.data) {
                    saveUser(response.data);
                    showToast('Login successful! Redirecting...', 'success');

                    setTimeout(() => {
                        if (response.data.role === 'STUDENT') {
                            window.location.href = 'student-dashboard.html';
                        } else {
                            window.location.href = 'admin-dashboard.html';
                        }
                    }, 600);
                } else {
                    showError(response.message || 'Login failed');
                }
            } catch (err) {
                showError(err.message || 'Invalid credentials or server error.');
            } finally {
                const btnSubmit = loginForm.querySelector('button[type="submit"]');
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Login';
            }
        });
    }

    function showError(msg) {
        if (errorAlert) {
            errorAlert.textContent = msg;
            errorAlert.style.display = 'block';
        } else {
            alert(msg);
        }
    }
});
