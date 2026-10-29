/**
 * Central API Client, Mock Fallback, and Session Utilities
 */
const API_BASE_URL = 'http://localhost:8080/api';
const USER_KEY = 'college_cert_user';
const MOCK_DATA_KEY = 'college_cert_mock_db';
const DEMO_MODE_KEY = 'college_cert_demo_mode';

/**
 * Persists logged-in user in localStorage
 */
function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Retrieves the currently logged-in user from localStorage
 */
function getCurrentUser() {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

/**
 * Clears session and logs out user
 */
function logout() {
    localStorage.removeItem(USER_KEY);
    window.location.href = 'index.html';
}

/**
 * Auth guard: Checks if the user is logged in with the required role
 */
function checkAuth(requiredRole) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    if (requiredRole && user.role !== requiredRole) {
        alert(`Access denied. This page requires ${requiredRole} privileges.`);
        window.location.href = user.role === 'STUDENT' ? 'student-dashboard.html' : 'admin-dashboard.html';
        return null;
    }

    renderConnectionBadge();
    return user;
}

function isDemoMode() {
    return localStorage.getItem(DEMO_MODE_KEY) === 'true';
}

function setDemoMode(enabled) {
    localStorage.setItem(DEMO_MODE_KEY, enabled ? 'true' : 'false');
    renderConnectionBadge();
}

/**
 * Shows an indicator badge in navbar showing connection status
 */
function renderConnectionBadge() {
    let badge = document.getElementById('connection-status-badge');
    if (!badge) {
        const nav = document.querySelector('.navbar');
        if (!nav) return;
        badge = document.createElement('div');
        badge.id = 'connection-status-badge';
        badge.style.fontSize = '0.75rem';
        badge.style.padding = '3px 8px';
        badge.style.borderRadius = '12px';
        badge.style.marginLeft = '10px';
        badge.style.display = 'inline-flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '4px';

        const brand = nav.querySelector('.brand');
        if (brand) {
            brand.parentElement.insertBefore(badge, brand.nextSibling);
        }
    }

    if (isDemoMode()) {
        badge.style.backgroundColor = '#fef3c7';
        badge.style.color = '#92400e';
        badge.innerHTML = `<span>⚡ Demo Mode (Offline)</span> <a href="#" onclick="switchLiveMode(event)" style="margin-left:4px; color:#1e40af; text-decoration:underline;">Connect to Backend</a>`;
    } else {
        badge.style.backgroundColor = '#dcfce7';
        badge.style.color = '#166534';
        badge.innerHTML = `<span>🟢 Backend Live</span>`;
    }
}

window.switchLiveMode = function(e) {
    if (e) e.preventDefault();
    setDemoMode(false);
    showToast('Switched to live backend mode. Reloading...', 'info');
    setTimeout(() => location.reload(), 600);
};

/* ==============================================================================
   Mock / Standalone Data Store (Used if Spring Boot backend is not running)
   ============================================================================== */
function initMockDatabase() {
    if (!localStorage.getItem(MOCK_DATA_KEY)) {
        const initialData = {
            students: [
                { id: 3, studentId: 'STU2024001', name: 'John Doe', email: 'john.doe@college.edu', password: 'student123', phoneNumber: '+1 555-019-2834', department: 'Computer Science and Engineering', semester: 5, role: 'STUDENT' },
                { id: 4, studentId: 'STU2024002', name: 'Alice Smith', email: 'alice.smith@college.edu', password: 'student123', phoneNumber: '+1 555-014-9981', department: 'Information Technology', semester: 6, role: 'STUDENT' },
                { id: 5, studentId: 'STU2024003', name: 'Robert Johnson', email: 'robert.j@college.edu', password: 'student123', phoneNumber: '+1 555-012-7723', department: 'Mechanical Engineering', semester: 8, role: 'STUDENT' }
            ],
            admins: [
                { id: 1, adminId: 'ADM101', name: 'Dr. Sarah Jenkins', email: 'admin@college.edu', password: 'admin123', department: 'Academic & Registrar Section', role: 'ADMIN' },
                { id: 2, adminId: 'ADM102', name: 'Prof. Alan Turing', email: 'alan.admin@college.edu', password: 'admin123', department: 'Examination Controller Office', role: 'ADMIN' }
            ],
            certificates: [
                { id: 1, certificateName: 'Bonafide Certificate', description: 'Certifies that the student is a genuine bona fide student currently enrolled in the college.', processingDays: 2, fee: 0.0 },
                { id: 2, certificateName: 'Course Certificate', description: 'Confirms current enrollment, courses registered, and completion status.', processingDays: 3, fee: 0.0 },
                { id: 3, certificateName: 'Conduct Certificate', description: 'Attests to good disciplinary record and moral conduct during academic tenure.', processingDays: 2, fee: 0.0 },
                { id: 4, certificateName: 'Transfer Certificate', description: 'Official certificate permitting transfer to another academic institution upon completion.', processingDays: 5, fee: 0.0 },
                { id: 5, certificateName: 'Migration Certificate', description: 'Enables transition to other universities/boards in accordance with university guidelines.', processingDays: 7, fee: 0.0 }
            ],
            requests: [
                {
                    requestId: 1, studentId: 'STU2024001', studentName: 'John Doe', studentEmail: 'john.doe@college.edu',
                    department: 'Computer Science and Engineering', semester: 5, phoneNumber: '+1 555-019-2834',
                    certificateId: 1, certificateName: 'Bonafide Certificate', certificateDescription: 'Certifies bona fide student enrollment.', certificateFee: 0.0,
                    requestDate: new Date().toISOString().split('T')[0], purpose: 'Required for opening student bank account for scholarship credits.',
                    documentType: 'Student ID / Identity Proof', documentFileName: 'student_id_proof.pdf', documentFileType: 'application/pdf',
                    certificateNumber: null, status: 'SUBMITTED', adminRemarks: null, issuedDate: null, cancellable: true
                },
                {
                    requestId: 2, studentId: 'STU2024001', studentName: 'John Doe', studentEmail: 'john.doe@college.edu',
                    department: 'Computer Science and Engineering', semester: 5, phoneNumber: '+1 555-019-2834',
                    certificateId: 2, certificateName: 'Course Certificate', certificateDescription: 'Confirms current enrollment status.', certificateFee: 0.0,
                    requestDate: '2026-10-05', purpose: 'Application for Summer Internship at Research Institute.',
                    documentType: 'Marksheet / Grade Card', documentFileName: 'semester_marksheet.pdf', documentFileType: 'application/pdf',
                    certificateNumber: null, status: 'NEEDS_RESUBMISSION',
                    adminRemarks: 'Action Required: Scanned marksheet is blurry. Please upload a clear scanned PDF of your Semester 4/5 Grade Card with verified subjects.',
                    issuedDate: null, cancellable: false, resubmittable: true
                },
                {
                    requestId: 3, studentId: 'STU2024002', studentName: 'Alice Smith', studentEmail: 'alice.smith@college.edu',
                    department: 'Information Technology', semester: 6, phoneNumber: '+1 555-014-9981',
                    certificateId: 3, certificateName: 'Conduct Certificate', certificateDescription: 'Attests to good disciplinary record.', certificateFee: 0.0,
                    requestDate: '2026-10-03', purpose: 'Required for Passport and Visa Verification interview.',
                    documentType: 'Other Official Proof', documentFileName: 'id_verification_copy.png', documentFileType: 'image/png',
                    certificateNumber: null, status: 'APPROVED', adminRemarks: 'Disciplinary check clear. Approved for issuance.', issuedDate: null, cancellable: false
                },
                {
                    requestId: 4, studentId: 'STU2024002', studentName: 'Alice Smith', studentEmail: 'alice.smith@college.edu',
                    department: 'Information Technology', semester: 6, phoneNumber: '+1 555-014-9981',
                    certificateId: 1, certificateName: 'Bonafide Certificate', certificateDescription: 'Certifies bona fide student enrollment.', certificateFee: 0.0,
                    requestDate: '2026-09-30', purpose: 'Bus pass concession application at Regional Transport Office.',
                    documentType: 'Enrollment / Admission Slip', documentFileName: 'bus_concession_admission_slip.pdf', documentFileType: 'application/pdf',
                    certificateNumber: 'CERT-2026-0004-9812A',
                    status: 'ISSUED', adminRemarks: 'Digitally issued. Original physical copy ready at Counter 4.', issuedDate: '2026-10-04', cancellable: false
                },
                {
                    requestId: 5, studentId: 'STU2024003', studentName: 'Robert Johnson', studentEmail: 'robert.j@college.edu',
                    department: 'Mechanical Engineering', semester: 8, phoneNumber: '+1 555-012-7723',
                    certificateId: 4, certificateName: 'Transfer Certificate', certificateDescription: 'Official certificate for transfer.', certificateFee: 0.0,
                    requestDate: '2026-10-04', purpose: 'Transfer to national university for PG program.',
                    documentType: 'Clearance Form (Hostel/Library)', documentFileName: 'no_dues_clearance.pdf', documentFileType: 'application/pdf',
                    certificateNumber: null, status: 'REJECTED', adminRemarks: 'Library books pending return. Clear library records before re-applying.', issuedDate: null, cancellable: false
                },
                {
                    requestId: 6, studentId: 'STU2024001', studentName: 'John Doe', studentEmail: 'john.doe@college.edu',
                    department: 'Computer Science and Engineering', semester: 5, phoneNumber: '+1 555-019-2834',
                    certificateId: 5, certificateName: 'Migration Certificate', certificateDescription: 'Enables transition to other universities.', certificateFee: 0.0,
                    requestDate: '2026-10-01', purpose: 'Higher studies application at Central Technological University.',
                    documentType: 'Student ID / Identity Proof', documentFileName: 'student_id_proof.pdf', documentFileType: 'application/pdf',
                    certificateNumber: 'CERT-2026-0006-MIG89', status: 'ISSUED', adminRemarks: 'Migration clearance verified by Inter-University Board.', issuedDate: '2026-10-06', cancellable: false
                }
            ]
        };
        localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(initialData));
    } else {
        // Ensure legacy mock db has certificate numbers, 0 fees, and updated document categories
        try {
            const db = JSON.parse(localStorage.getItem(MOCK_DATA_KEY));
            let modified = false;
            if (db) {
                if (db.certificates) {
                    db.certificates.forEach(c => {
                        if (c.fee !== 0.0) { c.fee = 0.0; modified = true; }
                    });
                }
                if (db.requests) {
                    db.requests.forEach(r => {
                        if (r.certificateFee !== 0.0) { r.certificateFee = 0.0; modified = true; }
                        if (r.status === 'NEEDS_RESUBMISSION') r.resubmittable = true;
                        if (r.requestId === 2 && r.status === 'UNDER_REVIEW') {
                            r.status = 'NEEDS_RESUBMISSION';
                            r.resubmittable = true;
                            r.adminRemarks = 'Action Required: Scanned marksheet is blurry. Please upload a clear scanned PDF of your Semester 4/5 Grade Card with verified subjects.';
                            modified = true;
                        }
                        if (r.status === 'ISSUED' && !r.certificateNumber) {
                            r.certificateNumber = 'CERT-' + (r.issuedDate ? r.issuedDate.split('-')[0] : '2026') + '-' + String(r.requestId).padStart(4, '0') + '-9812A';
                            modified = true;
                        }
                        if (r.requestId === 1 && !r.documentFileName) {
                            r.documentType = 'Student ID / Identity Proof';
                            r.documentFileName = 'student_id_proof.pdf';
                            r.documentFileType = 'application/pdf';
                            modified = true;
                        }
                        if (r.documentType === 'Tuition Fee / Application Receipt') {
                            r.documentType = 'Enrollment / Admission Slip';
                            r.documentFileName = 'bus_concession_admission_slip.pdf';
                            modified = true;
                        }
                    });
                    if (!db.requests.some(r => r.requestId === 6)) {
                        db.requests.push({
                            requestId: 6, studentId: 'STU2024001', studentName: 'John Doe', studentEmail: 'john.doe@college.edu',
                            department: 'Computer Science and Engineering', semester: 5, phoneNumber: '+1 555-019-2834',
                            certificateId: 5, certificateName: 'Migration Certificate', certificateDescription: 'Enables transition to other universities.', certificateFee: 0.0,
                            requestDate: '2026-10-01', purpose: 'Higher studies application at Central Technological University.',
                            documentType: 'Student ID / Identity Proof', documentFileName: 'student_id_proof.pdf', documentFileType: 'application/pdf',
                            certificateNumber: 'CERT-2026-0006-MIG89', status: 'ISSUED', adminRemarks: 'Migration clearance verified by Inter-University Board.', issuedDate: '2026-10-06', cancellable: false
                        });
                        modified = true;
                    }
                }
                if (modified) localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(db));
            }
        } catch (e) {}
    }
}

function getMockDb() {
    initMockDatabase();
    return JSON.parse(localStorage.getItem(MOCK_DATA_KEY));
}

function saveMockDb(db) {
    localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(db));
}

/**
 * Executes a simulated API request using the mock store
 */
function handleMockApiCall(endpoint, method, body) {
    const db = getMockDb();

    // 1. Auth Login: POST /auth/login
    if (endpoint === '/auth/login' && method === 'POST') {
        const { usernameOrEmail, password, role } = body;
        if (role === 'STUDENT') {
            const student = db.students.find(s =>
                (s.studentId.toLowerCase() === usernameOrEmail.toLowerCase() || s.email.toLowerCase() === usernameOrEmail.toLowerCase()) &&
                s.password === password
            );
            if (!student) throw new Error('Invalid student ID/Email or password.');
            return {
                success: true,
                message: 'Login successful (Demo Mode)',
                data: {
                    id: student.id,
                    identifier: student.studentId,
                    name: student.name,
                    email: student.email,
                    role: 'STUDENT',
                    department: student.department,
                    semester: student.semester,
                    phoneNumber: student.phoneNumber
                }
            };
        } else if (role === 'ADMIN') {
            const admin = db.admins.find(a =>
                (a.adminId.toLowerCase() === usernameOrEmail.toLowerCase() || a.email.toLowerCase() === usernameOrEmail.toLowerCase()) &&
                a.password === password
            );
            if (!admin) throw new Error('Invalid admin ID/Email or password.');
            return {
                success: true,
                message: 'Login successful (Demo Mode)',
                data: {
                    id: admin.id,
                    identifier: admin.adminId,
                    name: admin.name,
                    email: admin.email,
                    role: 'ADMIN',
                    department: admin.department
                }
            };
        }
    }

    // 2. Student Profile: GET /students/{id}
    if (endpoint.startsWith('/students/') && method === 'GET') {
        const studentId = endpoint.split('/students/')[1];
        const student = db.students.find(s => s.studentId === studentId);
        if (!student) throw new Error('Student not found with ID: ' + studentId);
        return { success: true, message: 'Student retrieved', data: student };
    }

    // 3. Update Profile: PUT /students/{id}
    if (endpoint.startsWith('/students/') && method === 'PUT') {
        const studentId = endpoint.split('/students/')[1];
        const student = db.students.find(s => s.studentId === studentId);
        if (!student) throw new Error('Student not found with ID: ' + studentId);
        student.name = body.name;
        student.phoneNumber = body.phoneNumber;
        student.department = body.department;
        student.semester = body.semester;
        saveMockDb(db);
        return { success: true, message: 'Profile updated', data: student };
    }

    // 4. Certificates Catalogue: GET /certificates
    if (endpoint === '/certificates' && method === 'GET') {
        return { success: true, message: 'Certificates retrieved', data: db.certificates };
    }

    // 5. Student Requests: GET /requests/student/{id}
    if (endpoint.startsWith('/requests/student/') && method === 'GET') {
        const studentId = endpoint.split('/requests/student/')[1];
        const list = db.requests.filter(r => r.studentId === studentId);
        return { success: true, message: 'Student requests retrieved', data: list };
    }

    // 6. Submit Request: POST /requests
    if (endpoint === '/requests' && method === 'POST') {
        const student = db.students.find(s => s.studentId === body.studentId);
        const cert = db.certificates.find(c => c.id == body.certificateId);
        if (!student) throw new Error('Student not found');
        if (!cert) throw new Error('Certificate type not found');

        // Check duplicate active requests
        const hasDuplicate = db.requests.some(r =>
            r.studentId === student.studentId &&
            r.certificateId === cert.id &&
            (r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW')
        );
        if (hasDuplicate) {
            throw new Error(`You already have an active request for '${cert.certificateName}'. Please wait until it is processed or cancel it before re-applying.`);
        }

        const newReq = {
            requestId: db.requests.length + 1,
            studentId: student.studentId,
            studentName: student.name,
            studentEmail: student.email,
            department: student.department,
            semester: student.semester,
            phoneNumber: student.phoneNumber,
            certificateId: cert.id,
            certificateName: cert.certificateName,
            certificateDescription: cert.description,
            certificateFee: 0.0,
            requestDate: new Date().toISOString().split('T')[0],
            purpose: body.purpose,
            documentType: body.documentType || null,
            documentFileName: body.documentFileName || null,
            documentFileType: body.documentFileType || null,
            documentData: body.documentData || null,
            certificateNumber: null,
            status: 'SUBMITTED',
            adminRemarks: null,
            issuedDate: null,
            cancellable: true
        };
        db.requests.unshift(newReq);
        saveMockDb(db);
        return { success: true, message: 'Certificate request submitted successfully', data: newReq };
    }

    // 7. Cancel Request: PUT /requests/{id}/cancel
    if (endpoint.includes('/cancel') && method === 'PUT') {
        const reqId = parseInt(endpoint.split('/')[2]);
        const req = db.requests.find(r => r.requestId === reqId);
        if (!req) throw new Error('Request not found');
        if (req.status !== 'SUBMITTED' && req.status !== 'NEEDS_RESUBMISSION') throw new Error(`Cannot cancel request. Current status: ${req.status}`);
        req.status = 'CANCELLED';
        req.cancellable = false;
        req.resubmittable = false;
        req.adminRemarks = 'Cancelled by student.';
        saveMockDb(db);
        return { success: true, message: 'Request cancelled', data: req };
    }

    // 7b. Resubmit Request: PUT /requests/{id}/resubmit
    if (endpoint.includes('/resubmit') && method === 'PUT') {
        const reqId = parseInt(endpoint.split('/')[2]);
        const req = db.requests.find(r => r.requestId === reqId);
        if (!req) throw new Error('Request not found');
        if (req.status !== 'NEEDS_RESUBMISSION') throw new Error(`Cannot resubmit request. Current status: ${req.status}`);
        if (body.purpose) req.purpose = body.purpose;
        if (body.documentType) req.documentType = body.documentType;
        if (body.documentFileName) req.documentFileName = body.documentFileName;
        if (body.documentFileType) req.documentFileType = body.documentFileType;
        if (body.documentData) req.documentData = body.documentData;
        req.status = 'RESUBMITTED';
        req.cancellable = false;
        req.resubmittable = false;
        const studentComment = body.studentRemarks || body.studentNote;
        const note = studentComment ? ` (Student note: ${studentComment})` : '';
        req.adminRemarks = `Resubmitted by student with updated documents/details.${note}`;
        saveMockDb(db);
        return { success: true, message: 'Request resubmitted successfully', data: req };
    }

    // 8. Admin Requests: GET /admin/requests
    if (endpoint.startsWith('/admin/requests') && method === 'GET') {
        return { success: true, message: 'All requests retrieved', data: db.requests };
    }

    // 9. Admin Review: PUT /admin/requests/{id}/review
    if (endpoint.includes('/review') && method === 'PUT') {
        const reqId = parseInt(endpoint.split('/')[3]);
        const req = db.requests.find(r => r.requestId === reqId);
        if (!req) throw new Error('Request not found');
        req.status = 'UNDER_REVIEW';
        req.cancellable = false;
        req.resubmittable = false;
        req.adminRemarks = body?.remarks || 'Under administrative review.';
        saveMockDb(db);
        return { success: true, message: 'Marked under review', data: req };
    }

    // 9b. Admin Request Changes: PUT /admin/requests/{id}/request-changes
    if (endpoint.includes('/request-changes') && method === 'PUT') {
        const reqId = parseInt(endpoint.split('/')[3]);
        const req = db.requests.find(r => r.requestId === reqId);
        if (!req) throw new Error('Request not found');
        req.status = 'NEEDS_RESUBMISSION';
        req.cancellable = false;
        req.resubmittable = true;
        req.adminRemarks = body?.remarks ? `Action Required: ${body.remarks}` : 'Action Required: Please provide corrected documents or additional details.';
        saveMockDb(db);
        return { success: true, message: 'Changes requested from student', data: req };
    }

    // 10. Admin Approve: PUT /admin/requests/{id}/approve
    if (endpoint.includes('/approve') && method === 'PUT') {
        const reqId = parseInt(endpoint.split('/')[3]);
        const req = db.requests.find(r => r.requestId === reqId);
        if (!req) throw new Error('Request not found');
        req.status = 'APPROVED';
        req.cancellable = false;
        req.adminRemarks = body?.remarks || 'Approved by Academic Section.';
        saveMockDb(db);
        return { success: true, message: 'Request approved', data: req };
    }

    // 11. Admin Reject: PUT /admin/requests/{id}/reject
    if (endpoint.includes('/reject') && method === 'PUT') {
        const reqId = parseInt(endpoint.split('/')[3]);
        const req = db.requests.find(r => r.requestId === reqId);
        if (!req) throw new Error('Request not found');
        req.status = 'REJECTED';
        req.cancellable = false;
        req.adminRemarks = body?.remarks || 'Application rejected.';
        saveMockDb(db);
        return { success: true, message: 'Request rejected', data: req };
    }

    // 12. Admin Issue: PUT /admin/requests/{id}/issue
    if (endpoint.includes('/issue') && method === 'PUT') {
        const reqId = parseInt(endpoint.split('/')[3]);
        const req = db.requests.find(r => r.requestId === reqId);
        if (!req) throw new Error('Request not found');
        req.status = 'ISSUED';
        req.cancellable = false;
        req.issuedDate = new Date().toISOString().split('T')[0];
        if (!req.certificateNumber) {
            req.certificateNumber = `CERT-${new Date().getFullYear()}-${String(req.requestId).padStart(4, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        }
        req.adminRemarks = body?.remarks || 'Certificate signed and issued. Student may inspect/download certificate.';
        saveMockDb(db);
        return { success: true, message: 'Certificate issued', data: req };
    }

    throw new Error(`Unhandled endpoint: ${method} ${endpoint}`);
}

/**
 * Centralized fetch helper for making REST API calls with automatic offline fallback
 */
async function apiCall(endpoint, method = 'GET', body = null) {
    // If user explicitly opted for Demo Mode, use mock DB directly
    if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 120)); // slight natural delay
        return handleMockApiCall(endpoint, method, body);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            let errorMsg = data.message || `HTTP Error ${response.status}`;
            if (data.data && typeof data.data === 'object') {
                const details = Object.entries(data.data).map(([field, err]) => `${field}: ${err}`).join(', ');
                errorMsg += ` (${details})`;
            }
            throw new Error(errorMsg);
        }

        return data;
    } catch (err) {
        // Check for Network Error (Backend not running)
        if (err.name === 'TypeError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            console.warn(`[Backend Offline] Could not reach ${url}. Falling back to Demo Mode.`);
            setDemoMode(true);
            showToast('Backend not detected on :8080. Switched to Demo Mode automatically.', 'info');
            return handleMockApiCall(endpoint, method, body);
        }
        throw err;
    }
}

/**
 * Displays floating toast notifications
 */
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <span style="cursor:pointer; margin-left:10px; font-weight:bold;" onclick="this.parentElement.remove()">&times;</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 4500);
}

/**
 * ==============================================================================
 * Specialized Format Generator for each of the 5 Certificate Types
 * Renders distinct layouts, borders, seals, and typography for:
 * 1. Bonafide Certificate (Regal Navy, AICTE Seal)
 * 2. Course Certificate (Emerald Green, Academic Transcript Box)
 * 3. Conduct Certificate (Burgundy/Crimson, Moral Character Box)
 * 4. Transfer Certificate (Slate Register Extract, Two-column Data Table)
 * 5. Migration Certificate (Royal Indigo, Inter-University AIU Clearance)
 * ==============================================================================
 */
window.generateCertificateHtml = function(req) {
    const certNum = req.certificateNumber || `CERT-2026-${String(req.requestId).padStart(4, '0')}`;
    const issueDate = req.issuedDate || req.requestDate || new Date().toISOString().split('T')[0];
    const studentName = req.studentName || 'Student';
    const studentId = req.studentId || '-';
    const department = req.department || 'Engineering & Technology';
    const semester = req.semester || 'Current';
    const purpose = req.purpose || 'Official Institutional Purposes';
    const hash = 'SHA256-' + btoa(certNum + issueDate).substring(0, 16).toUpperCase();

    const certName = (req.certificateName || '').toLowerCase();

    // 1. BONAFIDE CERTIFICATE (Regal Navy Blue, AICTE Crest)
    if (certName.includes('bonafide')) {
        return `
            <div id="printable-certificate" class="certificate-sheet cert-sheet-bonafide">
                <div class="cert-corner-decor top-left"></div>
                <div class="cert-corner-decor top-right"></div>
                <div class="cert-corner-decor bottom-left"></div>
                <div class="cert-corner-decor bottom-right"></div>

                <div class="cert-header">
                    <div class="cert-emblem">🏛️</div>
                    <div class="cert-institution">College of Engineering &amp; Technology</div>
                    <div class="cert-subtitle">Approved by AICTE | Affiliated to State Technological University | Accredited 'A+'</div>
                    <div class="cert-office">Office of Academic Affairs &amp; Registrar</div>
                </div>

                <div class="cert-meta-bar">
                    <div><strong>Certificate No:</strong> ${certNum}</div>
                    <div><strong>Issue Date:</strong> ${issueDate}</div>
                    <div><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">Verified &amp; Issued</span></div>
                </div>

                <div class="cert-title-container">
                    <div class="cert-main-title">BONAFIDE ENROLLMENT CERTIFICATE</div>
                </div>

                <div class="cert-body-text">
                    <p>
                        This is to certify that <span class="cert-highlight">${studentName}</span>, 
                        bearing Student Registration ID <span class="cert-highlight">${studentId}</span>, 
                        is a bona fide student of this institution pursuing undergraduate studies in the Department of 
                        <span class="cert-highlight">${department}</span>, 
                        Semester <span class="cert-highlight">${semester}</span>, for the Academic Session 2023–2027.
                    </p>
                    <p style="margin-top: 0.85rem;">
                        This certificate is issued upon student requisition for the declared official purpose of: 
                        <em>"${purpose}"</em>.
                    </p>
                    <p style="margin-top: 0.85rem;">
                        According to official institutional records, the student's academic progress, attendance, and moral conduct have been found satisfactory during their tenure with this college.
                    </p>
                </div>

                <div class="cert-footer-grid">
                    <div>
                        <div class="cert-sig-line"></div>
                        <div class="cert-sig-title">Head of Department</div>
                        <div class="cert-sig-sub">Department Advisory Board</div>
                    </div>

                    <div class="cert-seal-box">
                        <div class="cert-seal seal-gold">
                            <span>★ OFFICIAL ★</span>
                            <span>COLLEGE</span>
                            <span>SEAL</span>
                        </div>
                    </div>

                    <div>
                        <div class="cert-sig-line"></div>
                        <div class="cert-sig-title">Academic Registrar</div>
                        <div class="cert-sig-sub">Controller of Examinations</div>
                    </div>
                </div>

                <div class="cert-verification-badge">
                    <div>🔒 <strong>Digital Verification:</strong> Authentic Online Bonafide Copy.</div>
                    <div><strong>Ref:</strong> ${hash}</div>
                </div>
            </div>
        `;
    }

    // 2. COURSE CERTIFICATE (Emerald Green, Academic Status & Profile Box)
    if (certName.includes('course')) {
        return `
            <div id="printable-certificate" class="certificate-sheet cert-sheet-course">
                <div class="cert-corner-decor top-left"></div>
                <div class="cert-corner-decor top-right"></div>
                <div class="cert-corner-decor bottom-left"></div>
                <div class="cert-corner-decor bottom-right"></div>

                <div class="cert-header">
                    <div class="cert-emblem">📜</div>
                    <div class="cert-institution">Directorate of Academic Evaluation &amp; Curriculum</div>
                    <div class="cert-subtitle">College of Engineering &amp; Technology • Autonomous Institution</div>
                    <div class="cert-office">Office of the Dean of Academic Affairs</div>
                </div>

                <div class="cert-meta-bar">
                    <div><strong>Curriculum Ref:</strong> ${certNum}</div>
                    <div><strong>Effective Date:</strong> ${issueDate}</div>
                    <div><strong>Standing:</strong> <span style="color: #059669; font-weight: bold;">Active Roll</span></div>
                </div>

                <div class="cert-title-container">
                    <div class="cert-main-title">COURSE ENROLLMENT &amp; ACADEMIC STANDING</div>
                </div>

                <div class="cert-body-text">
                    <p>
                        This official document confirms that <span class="cert-highlight">${studentName}</span> 
                        (Registration ID: <span class="cert-highlight">${studentId}</span>) 
                        is actively enrolled in the approved university degree program as detailed below:
                    </p>

                    <div class="cert-academic-box">
                        <div><strong>Program of Study:</strong> Bachelor of Technology</div>
                        <div><strong>Department:</strong> ${department}</div>
                        <div><strong>Current Semester:</strong> Semester ${semester} (Full-time)</div>
                        <div><strong>Medium of Instruction:</strong> English</div>
                    </div>

                    <p style="margin-top: 0.85rem;">
                        This certificate is issued to confirm academic registration and curriculum progress for the purpose of: 
                        <em>"${purpose}"</em>.
                    </p>
                    <p style="margin-top: 0.85rem;">
                        The student is successfully completing prescribed lecture credits, laboratory coursework, and institutional assessments.
                    </p>
                </div>

                <div class="cert-footer-grid">
                    <div>
                        <div class="cert-sig-line"></div>
                        <div class="cert-sig-title">Dean of Academics</div>
                        <div class="cert-sig-sub">Curriculum Advisory Council</div>
                    </div>

                    <div class="cert-seal-box">
                        <div class="cert-seal seal-emerald">
                            <span>★ ACADEMIC ★</span>
                            <span>EXCELLENCE</span>
                            <span>VERIFIED</span>
                        </div>
                    </div>

                    <div>
                        <div class="cert-sig-line"></div>
                        <div class="cert-sig-title">Controller of Examinations</div>
                        <div class="cert-sig-sub">Evaluation Board</div>
                    </div>
                </div>

                <div class="cert-verification-badge">
                    <div>🔒 <strong>Curriculum Registry:</strong> Validated Academic Course Standing Record.</div>
                    <div><strong>Ref:</strong> ${hash}</div>
                </div>
            </div>
        `;
    }

    // 3. CONDUCT / CHARACTER CERTIFICATE (Burgundy/Crimson, Character Commendation Box)
    if (certName.includes('conduct') || certName.includes('character')) {
        return `
            <div id="printable-certificate" class="certificate-sheet cert-sheet-conduct">
                <div class="cert-corner-decor top-left"></div>
                <div class="cert-corner-decor top-right"></div>
                <div class="cert-corner-decor bottom-left"></div>
                <div class="cert-corner-decor bottom-right"></div>

                <div class="cert-header">
                    <div class="cert-emblem">🏅</div>
                    <div class="cert-institution">College of Engineering &amp; Technology</div>
                    <div class="cert-subtitle">Student Welfare Directorate &amp; Proctorial Disciplinary Board</div>
                    <div class="cert-office">Office of the Dean of Student Welfare</div>
                </div>

                <div class="cert-meta-bar">
                    <div><strong>Conduct Folio:</strong> ${certNum}</div>
                    <div><strong>Date of Issue:</strong> ${issueDate}</div>
                    <div><strong>Disciplinary Record:</strong> <span style="color: #881337; font-weight: bold;">Exemplary</span></div>
                </div>

                <div class="cert-title-container">
                    <div class="cert-main-title">CERTIFICATE OF CHARACTER &amp; CONDUCT</div>
                </div>

                <div class="cert-body-text">
                    <p>
                        This is to certify that to the best of our institutional knowledge and verification of official proctorial records, 
                        <span class="cert-highlight">${studentName}</span>, 
                        bearing Student Registration ID <span class="cert-highlight">${studentId}</span>, 
                        is a student in the Department of <span class="cert-highlight">${department}</span>, Semester <span class="cert-highlight">${semester}</span>.
                    </p>

                    <div class="cert-conduct-highlight-box">
                        "During their tenure at this college, the student's moral character, personal integrity, 
                        and adherence to campus discipline have been uniformly EXEMPLARY. They have not engaged in 
                        any activities detrimental to the institution or public order."
                    </div>

                    <p style="margin-top: 0.85rem;">
                        This character attestation is issued upon requisition for: 
                        <em>"${purpose}"</em>.
                    </p>
                </div>

                <div class="cert-footer-grid">
                    <div>
                        <div class="cert-sig-line"></div>
                        <div class="cert-sig-title">Dean of Student Welfare</div>
                        <div class="cert-sig-sub">Proctorial Board</div>
                    </div>

                    <div class="cert-seal-box">
                        <div class="cert-seal seal-crimson">
                            <span>★ CHARACTER ★</span>
                            <span>HONOR</span>
                            <span>CLEARED</span>
                        </div>
                    </div>

                    <div>
                        <div class="cert-sig-line"></div>
                        <div class="cert-sig-title">Principal &amp; Director</div>
                        <div class="cert-sig-sub">Head of Institution</div>
                    </div>
                </div>

                <div class="cert-verification-badge">
                    <div>🔒 <strong>Disciplinary Clearance:</strong> Validated Character &amp; Moral Conduct Attestation.</div>
                    <div><strong>Ref:</strong> ${hash}</div>
                </div>
            </div>
        `;
    }

    // 4. TRANSFER CERTIFICATE (Slate Gray, Tabular Register Extract)
    if (certName.includes('transfer')) {
        return `
            <div id="printable-certificate" class="certificate-sheet cert-sheet-transfer">
                <div class="cert-corner-decor top-left"></div>
                <div class="cert-corner-decor top-right"></div>
                <div class="cert-corner-decor bottom-left"></div>
                <div class="cert-corner-decor bottom-right"></div>

                <div class="cert-header">
                    <div class="cert-emblem">🏛️</div>
                    <div class="cert-institution">College of Engineering &amp; Technology</div>
                    <div class="cert-subtitle">Recognized by Department of Higher Education &amp; University Board</div>
                    <div class="cert-office">Permanent Institutional Register Extract</div>
                </div>

                <div class="cert-meta-bar">
                    <div><strong>T.C. Register No:</strong> ${certNum}</div>
                    <div><strong>Relieving Date:</strong> ${issueDate}</div>
                    <div><strong>Clearance:</strong> <span style="color: #0f172a; font-weight: bold;">All Dues Settled</span></div>
                </div>

                <div class="cert-title-container">
                    <div class="cert-main-title">TRANSFER CERTIFICATE (T.C.)</div>
                </div>

                <table class="cert-tc-table">
                    <tr>
                        <td class="tc-label">1. Name of the Pupil (in full):</td>
                        <td><strong>${studentName}</strong></td>
                    </tr>
                    <tr>
                        <td class="tc-label">2. Student Registration / Roll No:</td>
                        <td><strong>${studentId}</strong></td>
                    </tr>
                    <tr>
                        <td class="tc-label">3. Department &amp; Program:</td>
                        <td>${department} (B.Tech)</td>
                    </tr>
                    <tr>
                        <td class="tc-label">4. Semester / Class at Leaving:</td>
                        <td>Semester ${semester}</td>
                    </tr>
                    <tr>
                        <td class="tc-label">5. Date of Admission to Institution:</td>
                        <td>14-August-2023</td>
                    </tr>
                    <tr>
                        <td class="tc-label">6. Whether College Dues are Cleared:</td>
                        <td><strong style="color: #15803d;">Fully Paid &amp; No Dues Pending</strong></td>
                    </tr>
                    <tr>
                        <td class="tc-label">7. Stated Reason for Leaving:</td>
                        <td><em>${purpose}</em></td>
                    </tr>
                    <tr>
                        <td class="tc-label">8. General Conduct &amp; Progress:</td>
                        <td>Satisfactory / Good</td>
                    </tr>
                </table>

                <div class="cert-body-text" style="font-size: 0.82rem; margin: 0.5rem 0;">
                    Certified that the above particulars are in complete accordance with the Official Register of this College. 
                    The student is relieved of their enrollment with no institutional objection.
                </div>

                <div class="cert-footer-grid">
                    <div>
                        <div class="cert-sig-line"></div>
                        <div class="cert-sig-title">Administrative Officer</div>
                        <div class="cert-sig-sub">Records &amp; Admission Cell</div>
                    </div>

                    <div class="cert-seal-box">
                        <div class="cert-seal seal-slate">
                            <span>★ REGISTERED ★</span>
                            <span>TRANSFER</span>
                            <span>SEAL</span>
                        </div>
                    </div>

                    <div>
                        <div class="cert-sig-line"></div>
                        <div class="cert-sig-title">Principal</div>
                        <div class="cert-sig-sub">College of Engg &amp; Tech</div>
                    </div>
                </div>

                <div class="cert-verification-badge">
                    <div>🔒 <strong>Official TC Extract:</strong> Verified against College Permanent Rolls.</div>
                    <div><strong>Ref:</strong> ${hash}</div>
                </div>
            </div>
        `;
    }

    // 5. MIGRATION CERTIFICATE (Royal Indigo, Inter-University AIU Clearance)
    return `
        <div id="printable-certificate" class="certificate-sheet cert-sheet-migration">
            <div class="cert-corner-decor top-left"></div>
            <div class="cert-corner-decor top-right"></div>
            <div class="cert-corner-decor bottom-left"></div>
            <div class="cert-corner-decor bottom-right"></div>

            <div class="cert-header">
                <div class="cert-emblem">🌐</div>
                <div class="cert-institution">Inter-University Council &amp; Migration Cell</div>
                <div class="cert-subtitle">College of Engineering &amp; Technology (Affiliated to State Technological University)</div>
                <div class="cert-office">Office of the Controller of Examinations &amp; Inter-State Transfers</div>
            </div>

            <div class="cert-meta-bar">
                <div><strong>Migration Order No:</strong> ${certNum}</div>
                <div><strong>Issue Date:</strong> ${issueDate}</div>
                <div><strong>Clearance:</strong> <span style="color: #4338ca; font-weight: bold;">Authorized AIU</span></div>
            </div>

            <div class="cert-title-container">
                <div class="cert-main-title">INTER-INSTITUTIONAL MIGRATION CERTIFICATE</div>
            </div>

            <div class="cert-body-text">
                <p>
                    This institution certifies that it holds <strong>NO OBJECTION</strong> to 
                    <span class="cert-highlight">${studentName}</span>, 
                    bearing Registration ID <span class="cert-highlight">${studentId}</span>, 
                    Department of <span class="cert-highlight">${department}</span>, 
                    migrating to any other recognized University, Autonomous Institute, or Academic Board in India or abroad.
                </p>

                <div class="cert-migration-badge-box">
                    ★ <strong>Inter-University Accreditation:</strong> 
                    Valid across all member institutions of the Association of Indian Universities (AIU) 
                    for continuation of higher education and degree admissions.
                </div>

                <p style="margin-top: 0.85rem;">
                    This Migration Certificate is issued upon formal student requisition for the declared reason of: 
                    <em>"${purpose}"</em>.
                </p>
                <p style="margin-top: 0.85rem;">
                    The student has cleared all institutional obligations and is relieved with full academic clearance.
                </p>
            </div>

            <div class="cert-footer-grid">
                <div>
                    <div class="cert-sig-line"></div>
                    <div class="cert-sig-title">Assistant Registrar</div>
                    <div class="cert-sig-sub">Migration &amp; Verification Wing</div>
                </div>

                <div class="cert-seal-box">
                    <div class="cert-seal seal-indigo">
                        <span>★ AIU COUNCIL ★</span>
                        <span>MIGRATION</span>
                        <span>AUTHORIZED</span>
                    </div>
                </div>

                <div>
                    <div class="cert-sig-line"></div>
                    <div class="cert-sig-title">Controller of Examinations</div>
                    <div class="cert-sig-sub">University Examination Board</div>
                </div>
            </div>

            <div class="cert-verification-badge">
                <div>🔒 <strong>Migration Authority:</strong> Digitally Signed &amp; AIU Recognized Inter-State Transfer Copy.</div>
                <div><strong>Ref:</strong> ${hash}</div>
            </div>
        </div>
    `;
};
