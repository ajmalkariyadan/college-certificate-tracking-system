/**
 * Student portal logic: Dashboard, Profile, Request Submission (with Document Upload),
 * and Request Tracking (with Online Certificate Copy viewer).
 */
let currentStudentRequests = [];
let uploadedDocument = null; // Holds { name, type, size, data }

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard for Students
    const user = checkAuth('STUDENT');
    if (!user) return;

    // 2. Set student name in navbar
    const navUserEl = document.getElementById('nav-user-name');
    if (navUserEl) {
        navUserEl.textContent = `${user.name} (${user.identifier})`;
    }

    // 3. Page-specific initializers
    initDashboard(user);
    initProfilePage(user);
    initRequestPage(user);
    initTrackingPage(user);
});

/* ---------------- Dashboard Initializer ---------------- */
async function initDashboard(user) {
    const totalEl = document.getElementById('stat-total');
    if (!totalEl) return; // Not on dashboard page

    try {
        const res = await apiCall(`/requests/student/${user.identifier}`);
        const requests = res.data || [];

        // Count stats
        const total = requests.length;
        const pending = requests.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
        const approved = requests.filter(r => r.status === 'APPROVED').length;
        const issued = requests.filter(r => r.status === 'ISSUED').length;

        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-pending').textContent = pending;
        document.getElementById('stat-approved').textContent = approved;
        document.getElementById('stat-issued').textContent = issued;

        // Render recent activity table (first 5 requests)
        const tableBody = document.getElementById('recent-requests-body');
        if (tableBody) {
            if (requests.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 1.5rem;">No certificate requests found yet.</td></tr>`;
            } else {
                tableBody.innerHTML = requests.slice(0, 5).map(req => `
                    <tr>
                        <td><strong>#${req.requestId}</strong></td>
                        <td>${req.certificateName}</td>
                        <td>${req.requestDate}</td>
                        <td><span class="badge badge-${req.status}">${req.status.replace('_', ' ')}</span></td>
                        <td>
                            <a href="tracking.html" class="btn btn-outline btn-sm">Track</a>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Failed to load student dashboard stats:', err);
    }
}

/* ---------------- Profile Page Initializer ---------------- */
async function initProfilePage(user) {
    const profileForm = document.getElementById('profile-form');
    if (!profileForm) return;

    try {
        // Fetch fresh student profile data from API
        const res = await apiCall(`/students/${user.identifier}`);
        const student = res.data;

        // Populate fields
        document.getElementById('profile-student-id').value = student.studentId;
        document.getElementById('profile-email').value = student.email;
        document.getElementById('profile-name').value = student.name;
        document.getElementById('profile-phone').value = student.phoneNumber;
        document.getElementById('profile-department').value = student.department;
        document.getElementById('profile-semester').value = student.semester;

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            const payload = {
                name: document.getElementById('profile-name').value.trim(),
                phoneNumber: document.getElementById('profile-phone').value.trim(),
                department: document.getElementById('profile-department').value.trim(),
                semester: parseInt(document.getElementById('profile-semester').value)
            };

            try {
                const updateRes = await apiCall(`/students/${user.identifier}`, 'PUT', payload);
                if (updateRes.success) {
                    // Update session user name
                    user.name = payload.name;
                    user.department = payload.department;
                    user.semester = payload.semester;
                    user.phoneNumber = payload.phoneNumber;
                    saveUser(user);

                    const navUserEl = document.getElementById('nav-user-name');
                    if (navUserEl) navUserEl.textContent = `${user.name} (${user.identifier})`;

                    showToast('Profile updated successfully!', 'success');
                }
            } catch (err) {
                showToast(err.message || 'Failed to update profile.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Changes';
            }
        });
    } catch (err) {
        showToast('Error loading profile: ' + err.message, 'error');
    }
}

/* ---------------- Request Submission Page with Document Upload ---------------- */
let availableCertificates = [];

async function initRequestPage(user) {
    const requestForm = document.getElementById('request-form');
    if (!requestForm) return;

    const certSelect = document.getElementById('certificate-select');
    const certDetailsBox = document.getElementById('certificate-details');
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('request-file');
    const previewContainer = document.getElementById('file-preview-container');
    const btnRemoveFile = document.getElementById('btn-remove-file');

    try {
        // Fetch certificate catalogue
        const res = await apiCall('/certificates');
        availableCertificates = res.data || [];

        certSelect.innerHTML = '<option value="">-- Choose a Certificate Type --</option>' +
            availableCertificates.map(c => `
                <option value="${c.id}">${c.certificateName}</option>
            `).join('');

        certSelect.addEventListener('change', () => {
            const selectedId = certSelect.value;
            const cert = availableCertificates.find(c => c.id == selectedId);

            if (cert && certDetailsBox) {
                certDetailsBox.style.display = 'block';
                document.getElementById('cert-desc').textContent = cert.description;
                document.getElementById('cert-days').textContent = `${cert.processingDays} Business Days`;
            } else if (certDetailsBox) {
                certDetailsBox.style.display = 'none';
            }
        });

        // Document Upload Handlers
        if (dropzone && fileInput) {
            dropzone.addEventListener('click', () => fileInput.click());

            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });

            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('dragover');
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    processSelectedFile(e.dataTransfer.files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    processSelectedFile(e.target.files[0]);
                }
            });
        }

        if (btnRemoveFile) {
            btnRemoveFile.addEventListener('click', () => {
                uploadedDocument = null;
                if (fileInput) fileInput.value = '';
                if (previewContainer) previewContainer.style.display = 'none';
                if (dropzone) dropzone.style.display = 'block';
            });
        }

        function processSelectedFile(file) {
            // Max size: 5 MB
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size exceeds 5MB limit. Please select a smaller file.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedDocument = {
                    name: file.name,
                    type: file.type || 'application/octet-stream',
                    size: (file.size / 1024).toFixed(1) + ' KB',
                    data: e.target.result // Base64 data URL
                };

                // Update UI preview card
                document.getElementById('preview-name').textContent = uploadedDocument.name;
                document.getElementById('preview-meta').textContent = `${uploadedDocument.size} • ${file.type || 'Document'}`;
                
                const previewIcon = document.getElementById('preview-icon');
                if (file.type && file.type.startsWith('image/')) {
                    previewIcon.textContent = '🖼️';
                } else if (file.type && file.type.includes('pdf')) {
                    previewIcon.textContent = '📑';
                } else {
                    previewIcon.textContent = '📄';
                }

                if (dropzone) dropzone.style.display = 'none';
                if (previewContainer) previewContainer.style.display = 'block';
                showToast('Document attached successfully.', 'success');
            };
            reader.readAsDataURL(file);
        }

        // Form Submit
        requestForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const certificateId = certSelect.value;
            const purpose = document.getElementById('request-purpose').value.trim();
            const docTypeSelect = document.getElementById('document-type');
            const documentCategory = docTypeSelect ? docTypeSelect.value : 'Student ID Proof';

            if (!certificateId) {
                showToast('Please select a certificate type.', 'error');
                return;
            }

            if (purpose.length < 10) {
                showToast('Purpose must be at least 10 characters long.', 'error');
                return;
            }

            const submitBtn = requestForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting Request...';

            const payload = {
                studentId: user.identifier,
                certificateId: parseInt(certificateId),
                purpose: purpose,
                documentType: documentCategory,
                documentFileName: uploadedDocument ? uploadedDocument.name : null,
                documentFileType: uploadedDocument ? uploadedDocument.type : null,
                documentData: uploadedDocument ? uploadedDocument.data : null
            };

            try {
                const response = await apiCall('/requests', 'POST', payload);

                if (response.success) {
                    showToast('Certificate request & documents submitted successfully!', 'success');
                    setTimeout(() => {
                        window.location.href = 'tracking.html';
                    }, 1000);
                }
            } catch (err) {
                showToast(err.message || 'Submission failed.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Request';
            }
        });

    } catch (err) {
        showToast('Failed to load certificates catalogue: ' + err.message, 'error');
    }
}

/* ---------------- Tracking Page & Online Certificate Viewer ---------------- */
let activeResubmitRequest = null;
let resubmitUploadedDocument = null;

async function initTrackingPage(user) {
    const trackingContainer = document.getElementById('tracking-list');
    if (!trackingContainer) return;

    setupResubmitModalHandlers(user);
    loadTrackingRequests(user);
}

function setupResubmitModalHandlers(user) {
    const dropzone = document.getElementById('resubmit-dropzone');
    const fileInput = document.getElementById('resubmit-file');
    const previewContainer = document.getElementById('resubmit-preview-container');
    const btnRemove = document.getElementById('btn-remove-resubmit-file');
    const resubmitForm = document.getElementById('resubmit-form');

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleResubmitFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleResubmitFile(e.target.files[0]);
            }
        });
    }

    if (btnRemove) {
        btnRemove.addEventListener('click', () => {
            resubmitUploadedDocument = null;
            if (fileInput) fileInput.value = '';
            if (previewContainer) previewContainer.style.display = 'none';
            if (dropzone) dropzone.style.display = 'block';
        });
    }

    function handleResubmitFile(file) {
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size exceeds 5MB limit.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            resubmitUploadedDocument = {
                name: file.name,
                type: file.type || 'application/octet-stream',
                size: (file.size / 1024).toFixed(1) + ' KB',
                data: e.target.result
            };
            document.getElementById('resubmit-preview-name').textContent = resubmitUploadedDocument.name;
            document.getElementById('resubmit-preview-meta').textContent = `${resubmitUploadedDocument.size} • ${file.type || 'Document'}`;
            const previewIcon = document.getElementById('resubmit-preview-icon');
            if (file.type && file.type.startsWith('image/')) {
                previewIcon.textContent = '🖼️';
            } else if (file.type && file.type.includes('pdf')) {
                previewIcon.textContent = '📑';
            } else {
                previewIcon.textContent = '📄';
            }
            if (dropzone) dropzone.style.display = 'none';
            if (previewContainer) previewContainer.style.display = 'block';
            showToast('Replacement document attached.', 'success');
        };
        reader.readAsDataURL(file);
    }

    if (resubmitForm) {
        resubmitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!activeResubmitRequest) return;

            const purpose = document.getElementById('resubmit-purpose').value.trim();
            const docType = document.getElementById('resubmit-doc-type').value;
            const studentNote = document.getElementById('resubmit-student-note').value.trim();

            if (purpose.length < 10) {
                showToast('Updated purpose must be at least 10 characters long.', 'error');
                return;
            }

            const submitBtn = document.getElementById('btn-resubmit-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting Changes...';
            }

            const payload = {
                purpose: purpose,
                documentType: docType,
                documentFileName: resubmitUploadedDocument ? resubmitUploadedDocument.name : activeResubmitRequest.documentFileName,
                documentFileType: resubmitUploadedDocument ? resubmitUploadedDocument.type : activeResubmitRequest.documentFileType,
                documentData: resubmitUploadedDocument ? resubmitUploadedDocument.data : activeResubmitRequest.documentData,
                studentRemarks: studentNote
            };

            try {
                const res = await apiCall(`/requests/${activeResubmitRequest.requestId}/resubmit`, 'PUT', payload);
                if (res.success) {
                    showToast('Application updated and resubmitted successfully!', 'success');
                    closeResubmitModal();
                    await loadTrackingRequests(user);
                }
            } catch (err) {
                showToast(err.message || 'Resubmission failed.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Corrections';
                }
            }
        });
    }
}

window.openResubmitModal = function(requestId) {
    const req = currentStudentRequests.find(r => r.requestId === requestId);
    if (!req) return;

    activeResubmitRequest = req;
    resubmitUploadedDocument = null;

    document.getElementById('resubmit-request-id-display').textContent = `Request #${req.requestId} - ${req.certificateName}`;
    document.getElementById('resubmit-admin-note').textContent = req.adminRemarks || 'The administrator requested revisions or supporting documents for this certificate application.';
    document.getElementById('resubmit-purpose').value = req.purpose || '';
    
    const docTypeSelect = document.getElementById('resubmit-doc-type');
    if (docTypeSelect && req.documentType) {
        docTypeSelect.value = req.documentType;
    }

    const currentDocEl = document.getElementById('resubmit-current-doc-info');
    if (currentDocEl) {
        currentDocEl.innerHTML = req.documentFileName ? 
            `Currently attached: <strong>📎 ${req.documentFileName}</strong> (${req.documentType || 'Supporting Proof'})` :
            `<em>No document was previously attached. Please upload one below.</em>`;
    }

    const fileInput = document.getElementById('resubmit-file');
    if (fileInput) fileInput.value = '';
    const dropzone = document.getElementById('resubmit-dropzone');
    if (dropzone) dropzone.style.display = 'block';
    const previewContainer = document.getElementById('resubmit-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';

    document.getElementById('resubmit-student-note').value = '';

    document.getElementById('resubmit-modal').classList.add('show');
};

window.closeResubmitModal = function() {
    const modal = document.getElementById('resubmit-modal');
    if (modal) modal.classList.remove('show');
    activeResubmitRequest = null;
    resubmitUploadedDocument = null;
};

async function loadTrackingRequests(user) {
    const trackingContainer = document.getElementById('tracking-list');
    try {
        const res = await apiCall(`/requests/student/${user.identifier}`);
        currentStudentRequests = res.data || [];

        if (currentStudentRequests.length === 0) {
            trackingContainer.innerHTML = `
                <div class="card" style="text-align: center; padding: 3rem 1rem;">
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">You have not submitted any certificate requests yet.</p>
                    <a href="request.html" class="btn btn-primary">Request a Certificate</a>
                </div>
            `;
            return;
        }

        trackingContainer.innerHTML = currentStudentRequests.map(req => renderTrackingCard(req)).join('');

    } catch (err) {
        trackingContainer.innerHTML = `<div class="alert alert-danger">Error loading requests: ${err.message}</div>`;
    }
}

function renderTrackingCard(req) {
    const isRejected = req.status === 'REJECTED';
    const isCancelled = req.status === 'CANCELLED';
    const isIssued = req.status === 'ISSUED';
    const needsResubmission = req.status === 'NEEDS_RESUBMISSION';
    const isResubmitted = req.status === 'RESUBMITTED';

    // Timeline steps state helper
    function getStepClass(stepName) {
        if (isCancelled) return '';
        if (isRejected) {
            if (stepName === 'SUBMITTED' || stepName === 'UNDER_REVIEW') return 'completed';
            if (stepName === 'REJECTED') return 'rejected';
            return '';
        }
        if (needsResubmission || isResubmitted) {
            if (stepName === 'SUBMITTED') return 'completed';
            if (stepName === 'UNDER_REVIEW') return 'active';
            return '';
        }

        const stages = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ISSUED'];
        const currentIndex = stages.indexOf(req.status);
        const stepIndex = stages.indexOf(stepName);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return '';
    }

    return `
        <div class="tracking-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
                <div>
                    <h3 style="font-size: 1.15rem; color: var(--text-primary); font-weight: 700;">
                        ${req.certificateName}
                        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal; margin-left: 0.5rem;">Request #${req.requestId}</span>
                    </h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">Applied on: <strong>${req.requestDate}</strong></p>
                </div>
                <div style="display:flex; align-items:center; gap: 0.75rem; flex-wrap: wrap;">
                    <span class="badge badge-${req.status}">${req.status.replace(/_/g, ' ')}</span>
                    ${(req.cancellable || needsResubmission) ? `
                        <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fca5a5;" 
                            onclick="cancelRequest(${req.requestId})">Cancel Request</button>
                    ` : ''}
                </div>
            </div>

            <!-- Visual Progress Stepper -->
            ${!isCancelled ? `
                <div class="timeline">
                    <div class="timeline-step ${getStepClass('SUBMITTED')}">
                        <div class="step-circle">1</div>
                        <div class="step-title">Submitted</div>
                    </div>
                    <div class="timeline-step ${getStepClass('UNDER_REVIEW')}">
                        <div class="step-circle">2</div>
                        <div class="step-title">${needsResubmission ? 'Changes Requested' : (isResubmitted ? 'Resubmitted' : 'Under Review')}</div>
                    </div>
                    ${isRejected ? `
                        <div class="timeline-step rejected">
                            <div class="step-circle">&times;</div>
                            <div class="step-title">Rejected</div>
                        </div>
                    ` : `
                        <div class="timeline-step ${getStepClass('APPROVED')}">
                            <div class="step-circle">3</div>
                            <div class="step-title">Approved</div>
                        </div>
                        <div class="timeline-step ${getStepClass('ISSUED')}">
                            <div class="step-circle">4</div>
                            <div class="step-title">Issued</div>
                        </div>
                    `}
                </div>
            ` : `
                <div class="alert alert-info" style="margin: 1rem 0;">This request was cancelled by you.</div>
            `}

            <!-- Action Required Banner for NEEDS_RESUBMISSION -->
            ${needsResubmission ? `
                <div class="resubmit-alert-box">
                    <div class="resubmit-header">
                        <span class="resubmit-icon">⚠️</span>
                        <div>
                            <div style="font-weight: 700; color: #92400e; font-size: 0.95rem;">Action Required: Administrator Requested Changes</div>
                            <div style="font-size: 0.82rem; color: #b45309;">Please review the admin remarks below, update your details or re-upload documents, and resubmit.</div>
                        </div>
                    </div>
                    <div style="background: white; border-radius: 6px; padding: 0.75rem 1rem; border: 1px dashed #fcd34d; margin-bottom: 0.85rem; font-size: 0.9rem;">
                        <strong>Admin Instructions:</strong> <span style="color: #b45309;">${req.adminRemarks || 'Please update your attached document or purpose.'}</span>
                    </div>
                    <div>
                        <button class="btn btn-warning" onclick="openResubmitModal(${req.requestId})" style="background: #f59e0b; color: white; border: none; font-weight: 600;">
                            ✏️ Edit Details &amp; Resubmit Application
                        </button>
                    </div>
                </div>
            ` : ''}

            <!-- Resubmitted Notice -->
            ${isResubmitted ? `
                <div style="margin: 0.85rem 0; background: #faf5ff; border: 1.5px solid #d8b4fe; border-radius: var(--radius-sm); padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.25rem;">🔄</span>
                        <div>
                            <div style="font-weight: 700; color: #6b21a8; font-size: 0.9rem;">Application Resubmitted by You</div>
                            <div style="font-size: 0.82rem; color: #7e22ce;">Your updated information and replacement files have been sent back to the academic office for review.</div>
                        </div>
                    </div>
                    <span class="badge badge-RESUBMITTED">UNDER ADMIN RE-EVALUATION</span>
                </div>
            ` : ''}

            <!-- Request Details Box -->
            <div style="background: #f8fafc; border-radius: var(--radius-sm); padding: 0.85rem; font-size: 0.9rem; margin-top: 0.75rem;">
                <p><strong>Purpose:</strong> ${req.purpose}</p>

                <!-- Attached Document Section -->
                ${req.documentFileName ? `
                    <div style="margin-top: 0.6rem; padding-top: 0.5rem; border-top: 1px dashed #e2e8f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-secondary);">Uploaded Document:</span>
                            <span class="doc-badge">📎 ${req.documentFileName} (${req.documentType || 'Supporting Proof'})</span>
                        </div>
                        <div>
                            <button class="btn btn-outline btn-sm" onclick="viewDocument(${req.requestId})" style="font-size: 0.8rem;">
                                👁️ View / Download Document
                            </button>
                        </div>
                    </div>
                ` : `
                    <div style="margin-top: 0.4rem; font-size: 0.82rem; color: var(--text-muted);">
                        <em>No supporting document was attached with this request.</em>
                    </div>
                `}

                ${req.adminRemarks && !needsResubmission ? `<p style="margin-top: 0.5rem; color: ${isRejected ? 'var(--danger)' : 'var(--text-secondary)'};"><strong>Admin Remarks:</strong> ${req.adminRemarks}</p>` : ''}
                ${req.issuedDate ? `<p style="margin-top: 0.35rem; color: var(--success);"><strong>Certificate Issued Date:</strong> ${req.issuedDate}</p>` : ''}
            </div>

            <!-- Online Certificate Banner for ISSUED requests -->
            ${isIssued ? `
                <div style="margin-top: 1rem; background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 1.5px solid #86efac; border-radius: var(--radius-sm); padding: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.08);">
                    <div>
                        <div style="font-weight: 700; color: #166534; font-size: 1rem; display: flex; align-items: center; gap: 0.4rem;">
                            <span>🎓</span> Official Online Certificate Copy Ready!
                        </div>
                        <div style="font-size: 0.82rem; color: #15803d; margin-top: 0.2rem;">
                            Certificate No: <strong>${req.certificateNumber || ('CERT-2026-' + req.requestId)}</strong> • Issued on: <strong>${req.issuedDate || req.requestDate}</strong>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-success" onclick="openCertificateModal(${req.requestId})" style="box-shadow: 0 2px 4px rgba(22, 163, 74, 0.3);">
                            📜 View / Download Certificate
                        </button>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Student cancel request action
window.cancelRequest = async function(requestId) {
    if (!confirm(`Are you sure you want to cancel certificate request #${requestId}?`)) {
        return;
    }

    try {
        const res = await apiCall(`/requests/${requestId}/cancel`, 'PUT');
        if (res.success) {
            showToast(`Request #${requestId} cancelled successfully.`, 'success');
            const user = getCurrentUser();
            if (user) loadTrackingRequests(user);
        }
    } catch (err) {
        showToast(err.message || 'Failed to cancel request.', 'error');
    }
};

/* ---------------- Official Online Certificate Modal Actions ---------------- */
let activeCertificateRequest = null;

window.openCertificateModal = function(requestId) {
    const req = currentStudentRequests.find(r => r.requestId === requestId);
    if (!req) return;

    activeCertificateRequest = req;

    const scrollWrapper = document.querySelector('#certificate-modal .certificate-scroll-wrapper');
    if (scrollWrapper && window.generateCertificateHtml) {
        scrollWrapper.innerHTML = window.generateCertificateHtml(req);
    }

    document.getElementById('certificate-modal').classList.add('show');
};

window.closeCertificateModal = function() {
    document.getElementById('certificate-modal').classList.remove('show');
    activeCertificateRequest = null;
};

window.printCertificate = function() {
    window.print();
};

window.downloadCertificateHtml = function() {
    if (!activeCertificateRequest) return;
    const certElement = document.getElementById('printable-certificate');
    if (!certElement) return;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${activeCertificateRequest.certificateName} - ${activeCertificateRequest.studentId}</title>
    <style>
        body { font-family: "Georgia", serif; padding: 2rem; background: #f8fafc; }
        ${document.querySelector('link[href*="style.css"]') ? '' : ''}
    </style>
    <link rel="stylesheet" href="css/style.css">
</head>
<body onload="window.print()">
    <div style="max-width: 820px; margin: 0 auto;">
        ${certElement.outerHTML}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCertificateRequest.certificateName.replace(/\s+/g, '_')}_${activeCertificateRequest.studentId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Certificate downloaded successfully.', 'success');
};

/* ---------------- Document Viewer Modal Handlers ---------------- */
window.viewDocument = function(requestId) {
    const req = currentStudentRequests.find(r => r.requestId === requestId);
    if (!req) return;

    document.getElementById('doc-modal-title').textContent = req.documentFileName || 'Supporting Document';
    const bodyContainer = document.getElementById('doc-modal-body');
    const downloadBtn = document.getElementById('btn-download-doc');

    if (req.documentData) {
        downloadBtn.href = req.documentData;
        downloadBtn.download = req.documentFileName || 'document';
        downloadBtn.style.display = 'inline-flex';

        if (req.documentFileType && req.documentFileType.startsWith('image/')) {
            bodyContainer.innerHTML = `
                <img src="${req.documentData}" alt="Uploaded Document" style="max-width: 100%; max-height: 480px; border-radius: 8px; box-shadow: var(--shadow-sm); border: 1px solid #e2e8f0;">
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.75rem;">
                    Category: <strong>${req.documentType || 'Identity Proof'}</strong> • File: ${req.documentFileName}
                </p>
            `;
        } else if (req.documentFileType && req.documentFileType.includes('pdf')) {
            bodyContainer.innerHTML = `
                <iframe src="${req.documentData}" style="width: 100%; height: 460px; border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
                    PDF Document: ${req.documentFileName} (${req.documentType || 'Uploaded'})
                </p>
            `;
        } else {
            bodyContainer.innerHTML = `
                <div style="padding: 2rem 1rem;">
                    <span style="font-size: 3rem;">📄</span>
                    <h4 style="margin: 0.5rem 0;">${req.documentFileName}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Category: ${req.documentType || 'Supporting Document'}</p>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">Click 'Download File' below to inspect the attachment.</p>
                </div>
            `;
        }
    } else {
        downloadBtn.style.display = 'none';
        bodyContainer.innerHTML = `
            <div style="padding: 2rem 1rem; color: var(--text-secondary);">
                <span style="font-size: 2.5rem;">📁</span>
                <p style="margin-top: 0.5rem;"><strong>File Name:</strong> ${req.documentFileName || 'Supporting Document'}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Document recorded under category: ${req.documentType || 'Official Verification'}</p>
            </div>
        `;
    }

    document.getElementById('document-modal').classList.add('show');
};

window.closeDocumentModal = function() {
    document.getElementById('document-modal').classList.remove('show');
};

// Global escape key listener to close modals easily
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const certModal = document.getElementById('certificate-modal');
        if (certModal && certModal.classList.contains('show')) closeCertificateModal();
        const docModal = document.getElementById('document-modal');
        if (docModal && docModal.classList.contains('show')) closeDocumentModal();
        const resubmitModal = document.getElementById('resubmit-modal');
        if (resubmitModal && resubmitModal.classList.contains('show')) closeResubmitModal();
    }
});
