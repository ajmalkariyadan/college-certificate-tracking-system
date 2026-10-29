/**
 * Administrator portal logic: Overview, Status Filtering, Review, Approval, Rejection, Issuance,
 * Attached Document Verification, and Online Certificate Preview.
 */
let allAdminRequests = [];
let activeFilter = 'ALL';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard for Administrators
    const user = checkAuth('ADMIN');
    if (!user) return;

    // 2. Set Admin Info in Navbar
    const navUserEl = document.getElementById('nav-user-name');
    if (navUserEl) {
        navUserEl.textContent = `${user.name} (${user.identifier})`;
    }

    // 3. Setup event listeners
    setupFilters();
    setupSearch();

    // 4. Initial load
    await loadAdminRequests();
});

async function loadAdminRequests() {
    try {
        const res = await apiCall('/admin/requests');
        allAdminRequests = res.data || [];
        updateMetrics(allAdminRequests);
        renderRequestsTable();
    } catch (err) {
        showToast('Error fetching requests: ' + err.message, 'error');
    }
}

function updateMetrics(requests) {
    const total = requests.length;
    const submitted = requests.filter(r => r.status === 'SUBMITTED').length;
    const underReview = requests.filter(r => r.status === 'UNDER_REVIEW').length;
    const approved = requests.filter(r => r.status === 'APPROVED').length;
    const issued = requests.filter(r => r.status === 'ISSUED').length;
    const rejected = requests.filter(r => r.status === 'REJECTED').length;

    const elTotal = document.getElementById('stat-total');
    const elSubmitted = document.getElementById('stat-submitted');
    const elUnderReview = document.getElementById('stat-under-review');
    const elApproved = document.getElementById('stat-approved');
    const elIssued = document.getElementById('stat-issued');

    if (elTotal) elTotal.textContent = total;
    if (elSubmitted) elSubmitted.textContent = submitted;
    if (elUnderReview) elUnderReview.textContent = underReview;
    if (elApproved) elApproved.textContent = approved;
    if (elIssued) elIssued.textContent = issued;
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.status;
            renderRequestsTable();
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('admin-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderRequestsTable();
        });
    }
}

function renderRequestsTable() {
    const tableBody = document.getElementById('admin-requests-body');
    if (!tableBody) return;

    const searchTerm = (document.getElementById('admin-search')?.value || '').trim().toLowerCase();

    // Filter by status
    let filtered = allAdminRequests;
    if (activeFilter !== 'ALL') {
        filtered = filtered.filter(r => r.status === activeFilter);
    }

    // Filter by search query
    if (searchTerm) {
        filtered = filtered.filter(r =>
            r.requestId.toString().includes(searchTerm) ||
            r.studentId.toLowerCase().includes(searchTerm) ||
            (r.studentName && r.studentName.toLowerCase().includes(searchTerm)) ||
            r.certificateName.toLowerCase().includes(searchTerm)
        );
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No requests matching criteria.</td></tr>`;
        return;
    }

    tableBody.innerHTML = filtered.map(req => `
        <tr>
            <td><strong>#${req.requestId}</strong></td>
            <td>
                <div style="font-weight:600;">${req.studentName || 'Student'}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${req.studentId}</div>
            </td>
            <td>
                <div>${req.certificateName}</div>
                ${req.documentFileName ? `<span class="doc-badge" style="font-size:0.75rem; margin-top:3px;">📎 ${req.documentFileName}</span>` : ''}
            </td>
            <td>${req.requestDate}</td>
            <td><span class="badge badge-${req.status}">${req.status.replace('_', ' ')}</span></td>
            <td>${req.issuedDate || '-'}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="openDetailsModal(${req.requestId})">
                    View &amp; Action
                </button>
            </td>
        </tr>
    `).join('');
}

/* ---------------- Modal & Lifecycle Action Handling ---------------- */
let currentActiveRequest = null;

window.openDetailsModal = function(requestId) {
    const req = allAdminRequests.find(r => r.requestId === requestId);
    if (!req) return;

    currentActiveRequest = req;

    document.getElementById('modal-req-id').textContent = req.requestId;
    document.getElementById('modal-student-name').textContent = req.studentName || '-';
    document.getElementById('modal-student-id').textContent = req.studentId;
    document.getElementById('modal-student-email').textContent = req.studentEmail || '-';
    document.getElementById('modal-student-dept').textContent = `${req.department || '-'} (Semester ${req.semester || '-'})`;
    document.getElementById('modal-student-phone').textContent = req.phoneNumber || '-';

    document.getElementById('modal-cert-name').textContent = req.certificateName;
    document.getElementById('modal-req-date').textContent = req.requestDate;
    document.getElementById('modal-purpose').textContent = req.purpose;
    document.getElementById('modal-status-badge').innerHTML = `<span class="badge badge-${req.status}">${req.status.replace('_', ' ')}</span>`;
    document.getElementById('modal-issued-date').textContent = req.issuedDate || 'Not yet issued';
    document.getElementById('modal-remarks-text').textContent = req.adminRemarks || 'None';

    // Populate Certificate Number
    const certNumEl = document.getElementById('modal-cert-num-info');
    if (certNumEl) {
        certNumEl.textContent = req.certificateNumber || (req.status === 'ISSUED' ? `CERT-2026-${req.requestId}` : 'Not yet generated');
    }

    // Populate Attached Document
    const docInfoEl = document.getElementById('modal-doc-info');
    if (docInfoEl) {
        if (req.documentFileName) {
            docInfoEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <span class="doc-badge">📎 ${req.documentFileName} (${req.documentType || 'Verification Document'})</span>
                    ${req.documentData ? `<button class="btn btn-outline btn-sm" onclick="viewDocument(${req.requestId})">👁️ Inspect Document</button>` : ''}
                </div>
            `;
        } else {
            docInfoEl.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem;"><em>No document attached</em></span>`;
        }
    }

    // Render Action Buttons conditionally based on Status
    const actionsContainer = document.getElementById('modal-actions');
    actionsContainer.innerHTML = '';

    if (req.status === 'SUBMITTED') {
        actionsContainer.innerHTML = `
            <button class="btn btn-primary" onclick="executeReview(${req.requestId})">
                Move to UNDER_REVIEW
            </button>
            <button class="btn btn-warning" onclick="executeRequestChanges(${req.requestId})" style="background:#f59e0b; color:white; border:none;">
                ⚠️ Request Changes / Documents
            </button>
        `;
    } else if (req.status === 'UNDER_REVIEW') {
        actionsContainer.innerHTML = `
            <button class="btn btn-success" onclick="executeApprove(${req.requestId})">
                Approve Request
            </button>
            <button class="btn btn-danger" onclick="executeReject(${req.requestId})">
                Reject Request
            </button>
            <button class="btn btn-warning" onclick="executeRequestChanges(${req.requestId})" style="background:#f59e0b; color:white; border:none;">
                ⚠️ Request Changes / Documents
            </button>
        `;
    } else if (req.status === 'RESUBMITTED') {
        actionsContainer.innerHTML = `
            <button class="btn btn-primary" onclick="executeReview(${req.requestId})">
                Move to UNDER_REVIEW
            </button>
            <button class="btn btn-success" onclick="executeApprove(${req.requestId})">
                Approve Request
            </button>
            <button class="btn btn-danger" onclick="executeReject(${req.requestId})">
                Reject Request
            </button>
            <button class="btn btn-warning" onclick="executeRequestChanges(${req.requestId})" style="background:#f59e0b; color:white; border:none;">
                ⚠️ Request Further Changes
            </button>
        `;
    } else if (req.status === 'NEEDS_RESUBMISSION') {
        actionsContainer.innerHTML = `
            <div style="font-size: 0.88rem; color: #b45309; margin-bottom: 0.5rem; width: 100%;">
                ⏳ <strong>Awaiting Student Corrections:</strong> Student notified to submit changes.
            </div>
            <button class="btn btn-danger btn-sm" onclick="executeReject(${req.requestId})">
                Reject Request
            </button>
        `;
    } else if (req.status === 'APPROVED') {
        actionsContainer.innerHTML = `
            <button class="btn btn-success" onclick="executeIssue(${req.requestId})">
                Issue Certificate
            </button>
        `;
    } else if (req.status === 'ISSUED') {
        actionsContainer.innerHTML = `
            <button class="btn btn-success" onclick="openCertificateModal(${req.requestId})" style="font-weight: bold;">
                📜 View Issued Online Certificate
            </button>
            <span style="font-size: 0.85rem; color: #16a34a; align-self: center; margin-left: 0.5rem;">
                ✓ Certificate issued and published to student tracking page.
            </span>
        `;
    } else {
        actionsContainer.innerHTML = `
            <span style="font-size: 0.9rem; color: var(--text-muted);">
                This request is in terminal state (${req.status}). No further actions required.
            </span>
        `;
    }

    document.getElementById('request-modal').classList.add('show');
};

window.closeDetailsModal = function() {
    document.getElementById('request-modal').classList.remove('show');
    currentActiveRequest = null;
};

// 1. Move to UNDER_REVIEW
window.executeReview = async function(requestId) {
    const remarks = prompt("Enter optional review notes (or leave blank):", "Documents are under administrative review.");
    if (remarks === null) return; // user cancelled

    try {
        const res = await apiCall(`/admin/requests/${requestId}/review`, 'PUT', { remarks: remarks });
        showToast(`Request #${requestId} is now UNDER_REVIEW.`, 'success');
        closeDetailsModal();
        await loadAdminRequests();
    } catch (err) {
        showToast(err.message || 'Action failed.', 'error');
    }
};

// 2. Approve Request
window.executeApprove = async function(requestId) {
    const remarks = prompt("Enter approval remarks (optional):", "Verified and approved by Academic Section.");
    if (remarks === null) return;

    try {
        const res = await apiCall(`/admin/requests/${requestId}/approve`, 'PUT', { remarks: remarks });
        showToast(`Request #${requestId} has been APPROVED!`, 'success');
        closeDetailsModal();
        await loadAdminRequests();
    } catch (err) {
        showToast(err.message || 'Approval failed.', 'error');
    }
};

// 3. Reject Request
window.executeReject = async function(requestId) {
    const reason = prompt("Enter mandatory rejection reason:", "Incomplete documents or unverified records.");
    if (reason === null) return;

    if (!reason.trim()) {
        alert("Rejection reason cannot be empty!");
        return;
    }

    try {
        const res = await apiCall(`/admin/requests/${requestId}/reject`, 'PUT', { remarks: reason.trim() });
        showToast(`Request #${requestId} has been REJECTED.`, 'success');
        closeDetailsModal();
        await loadAdminRequests();
    } catch (err) {
        showToast(err.message || 'Rejection failed.', 'error');
    }
};

// 4. Request Changes from Student
window.executeRequestChanges = async function(requestId) {
    const note = prompt("Enter specific changes or missing documents required from the student:", "Please re-upload a clear scanned copy of your Student ID or mark sheet.");
    if (note === null) return; // user cancelled

    if (!note.trim()) {
        alert("Change request reason cannot be empty!");
        return;
    }

    try {
        const res = await apiCall(`/admin/requests/${requestId}/request-changes`, 'PUT', { remarks: note.trim() });
        showToast(`Change request sent to student for Request #${requestId}.`, 'success');
        closeDetailsModal();
        await loadAdminRequests();
    } catch (err) {
        showToast(err.message || 'Failed to request changes.', 'error');
    }
};

// 5. Issue Certificate
window.executeIssue = async function(requestId) {
    const remarks = prompt("Enter final remarks for issuance:", "Certificate signed and issued successfully.");
    if (remarks === null) return;

    try {
        const res = await apiCall(`/admin/requests/${requestId}/issue`, 'PUT', { remarks: remarks });
        showToast(`Certificate for Request #${requestId} marked as ISSUED! Online copy generated.`, 'success');
        closeDetailsModal();
        await loadAdminRequests();
    } catch (err) {
        showToast(err.message || 'Issuance failed.', 'error');
    }
};

/* ---------------- Document Viewer Modal Handlers ---------------- */
window.viewDocument = function(requestId) {
    const req = allAdminRequests.find(r => r.requestId === requestId);
    if (!req) return;

    document.getElementById('doc-modal-title').textContent = req.documentFileName || 'Student Attached Document';
    const bodyContainer = document.getElementById('doc-modal-body');
    const downloadBtn = document.getElementById('btn-download-doc');

    if (req.documentData) {
        downloadBtn.href = req.documentData;
        downloadBtn.download = req.documentFileName || 'document';
        downloadBtn.style.display = 'inline-flex';

        if (req.documentFileType && req.documentFileType.startsWith('image/')) {
            bodyContainer.innerHTML = `
                <img src="${req.documentData}" alt="Student Document" style="max-width: 100%; max-height: 480px; border-radius: 8px; box-shadow: var(--shadow-sm); border: 1px solid #e2e8f0;">
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
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">Click 'Download File' below to inspect the document.</p>
                </div>
            `;
        }
    } else {
        downloadBtn.style.display = 'none';
        bodyContainer.innerHTML = `
            <div style="padding: 2rem 1rem; color: var(--text-secondary);">
                <span style="font-size: 2.5rem;">📁</span>
                <p style="margin-top: 0.5rem;"><strong>File Name:</strong> ${req.documentFileName || 'Supporting Document'}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Category: ${req.documentType || 'Verification Document'}</p>
            </div>
        `;
    }

    document.getElementById('document-modal').classList.add('show');
};

window.closeDocumentModal = function() {
    document.getElementById('document-modal').classList.remove('show');
};

/* ---------------- Online Certificate Preview Modal Handlers ---------------- */
window.openCertificateModal = function(requestId) {
    const req = allAdminRequests.find(r => r.requestId === requestId);
    if (!req) return;

    const scrollWrapper = document.querySelector('#certificate-modal .certificate-scroll-wrapper');
    if (scrollWrapper && window.generateCertificateHtml) {
        scrollWrapper.innerHTML = window.generateCertificateHtml(req);
    }

    document.getElementById('certificate-modal').classList.add('show');
};

window.closeCertificateModal = function() {
    document.getElementById('certificate-modal').classList.remove('show');
};

window.printCertificate = function() {
    window.print();
};

// Global escape key listener to close modals easily
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const certModal = document.getElementById('certificate-modal');
        if (certModal && certModal.classList.contains('show')) closeCertificateModal();
        const docModal = document.getElementById('document-modal');
        if (docModal && docModal.classList.contains('show')) closeDocumentModal();
        const reqModal = document.getElementById('request-modal');
        if (reqModal && reqModal.classList.contains('show')) closeDetailsModal();
    }
});
