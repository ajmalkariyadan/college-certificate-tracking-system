package com.college.certificates.config;

import com.college.certificates.model.*;
import com.college.certificates.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Initializes the database with essential seed records if tables are empty.
 * Guarantees out-of-the-box readiness when running the project.
 */
@Component
public class DataLoader implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final CertificateRepository certificateRepository;
    private final CertificateRequestRepository requestRepository;

    @Autowired
    public DataLoader(AdminRepository adminRepository,
                      StudentRepository studentRepository,
                      CertificateRepository certificateRepository,
                      CertificateRequestRepository requestRepository) {
        this.adminRepository = adminRepository;
        this.studentRepository = studentRepository;
        this.certificateRepository = certificateRepository;
        this.requestRepository = requestRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Certificates if empty
        if (certificateRepository.count() == 0) {
            List<Certificate> certificates = Arrays.asList(
                    new Certificate("Bonafide Certificate", 
                            "Certifies that the student is a genuine bona fide student currently enrolled in the college.", 2, 0.0),
                    new Certificate("Course Certificate", 
                            "Confirms current enrollment, courses registered, and completion status.", 3, 0.0),
                    new Certificate("Conduct Certificate", 
                            "Attests to good disciplinary record and moral conduct during academic tenure.", 2, 0.0),
                    new Certificate("Transfer Certificate", 
                            "Official certificate permitting transfer to another academic institution upon completion or withdrawal.", 5, 0.0),
                    new Certificate("Migration Certificate", 
                            "Enables transition to other universities/boards in accordance with university guidelines.", 7, 0.0)
            );
            certificateRepository.saveAll(certificates);
            System.out.println(">> Seeded 5 standard Certificate types.");
        }

        // 2. Seed Admin if empty
        if (adminRepository.count() == 0) {
            Admin admin1 = new Admin("Dr. Sarah Jenkins", "admin@college.edu", "admin123", "ADM101", "Academic & Registrar Section");
            Admin admin2 = new Admin("Prof. Alan Turing", "alan.admin@college.edu", "admin123", "ADM102", "Examination Controller Office");
            adminRepository.saveAll(Arrays.asList(admin1, admin2));
            System.out.println(">> Seeded default Admin users (admin@college.edu / admin123).");
        }

        // 3. Seed Students if empty
        if (studentRepository.count() == 0) {
            Student s1 = new Student("John Doe", "john.doe@college.edu", "student123", "STU2024001",
                    "+1 555-019-2834", "Computer Science and Engineering", 5);
            Student s2 = new Student("Alice Smith", "alice.smith@college.edu", "student123", "STU2024002",
                    "+1 555-014-9981", "Information Technology", 6);
            Student s3 = new Student("Robert Johnson", "robert.j@college.edu", "student123", "STU2024003",
                    "+1 555-012-7723", "Mechanical Engineering", 8);

            studentRepository.saveAll(Arrays.asList(s1, s2, s3));
            System.out.println(">> Seeded default Students (e.g. STU2024001, pass: student123).");
        }

        // 4. Seed sample Certificate Requests if empty
        if (requestRepository.count() == 0) {
            Student john = studentRepository.findByStudentId("STU2024001").orElse(null);
            Student alice = studentRepository.findByStudentId("STU2024002").orElse(null);
            Student robert = studentRepository.findByStudentId("STU2024003").orElse(null);

            Certificate bonafide = certificateRepository.findByCertificateName("Bonafide Certificate").orElse(null);
            Certificate courseCert = certificateRepository.findByCertificateName("Course Certificate").orElse(null);
            Certificate conduct = certificateRepository.findByCertificateName("Conduct Certificate").orElse(null);
            Certificate transfer = certificateRepository.findByCertificateName("Transfer Certificate").orElse(null);

            if (john != null && bonafide != null) {
                CertificateRequest r1 = new CertificateRequest(john, bonafide, "Required for student bank account opening for scholarship credits.");
                r1.setStatus(RequestStatus.SUBMITTED);
                r1.setDocumentType("Student ID Card");
                r1.setDocumentFileName("student_id_proof.pdf");
                r1.setDocumentFileType("application/pdf");
                requestRepository.save(r1);
            }

            if (john != null && courseCert != null) {
                CertificateRequest r2 = new CertificateRequest(john, courseCert, "Application for Summer Internship at Research Institute.");
                r2.setStatus(RequestStatus.UNDER_REVIEW);
                r2.setRequestDate(LocalDate.now().minusDays(2));
                r2.setDocumentType("Grade Sheet / Marksheet");
                r2.setDocumentFileName("semester_marksheet.pdf");
                r2.setDocumentFileType("application/pdf");
                r2.setAdminRemarks("Verification with department advisor in progress.");
                requestRepository.save(r2);
            }

            if (alice != null && conduct != null) {
                CertificateRequest r3 = new CertificateRequest(alice, conduct, "Passport and Visa official documentation.");
                r3.setStatus(RequestStatus.APPROVED);
                r3.setRequestDate(LocalDate.now().minusDays(4));
                r3.setDocumentType("Passport/ID Verification");
                r3.setDocumentFileName("id_verification_copy.png");
                r3.setDocumentFileType("image/png");
                r3.setAdminRemarks("Disciplinary record verified clean. Approved for issuance.");
                requestRepository.save(r3);
            }

            if (alice != null && bonafide != null) {
                CertificateRequest r4 = new CertificateRequest(alice, bonafide, "Bus pass concession card application.");
                r4.setStatus(RequestStatus.ISSUED);
                r4.setRequestDate(LocalDate.now().minusDays(6));
                r4.setIssuedDate(LocalDate.now().minusDays(2));
                r4.setCertificateNumber("CERT-2026-0004-9812A");
                r4.setDocumentType("Enrollment / Admission Slip");
                r4.setDocumentFileName("bus_concession_admission_slip.pdf");
                r4.setDocumentFileType("application/pdf");
                r4.setAdminRemarks("Digitally issued. Original physical copy dispatched to Counter 3.");
                requestRepository.save(r4);
            }

            if (robert != null && transfer != null) {
                CertificateRequest r5 = new CertificateRequest(robert, transfer, "Transfer to national university for master program.");
                r5.setStatus(RequestStatus.REJECTED);
                r5.setRequestDate(LocalDate.now().minusDays(3));
                r5.setDocumentType("Clearance Certificate");
                r5.setDocumentFileName("no_dues_clearance.pdf");
                r5.setDocumentFileType("application/pdf");
                r5.setAdminRemarks("Hostel clearance form and library books pending return. Clear library records before re-applying.");
                requestRepository.save(r5);
            }

            System.out.println(">> Seeded sample Certificate Requests across different lifecycle stages.");
        }
    }
}
