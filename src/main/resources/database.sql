-- ==============================================================================
-- College Certificate Request & Tracking System
-- Complete MySQL Database Schema and Seed Data Script
-- ==============================================================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS `college_certificates_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `college_certificates_db`;

-- 2. Drop Tables if already existing (clean state)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `certificate_requests`;
DROP TABLE IF EXISTS `certificates`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- Table: users (Base table for User OOP Entity via JOINED Inheritance)
-- ==============================================================================
CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL, -- 'STUDENT' or 'ADMIN'
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==============================================================================
-- Table: students (Child table extending users)
-- ==============================================================================
CREATE TABLE `students` (
    `id` BIGINT PRIMARY KEY,
    `student_id` VARCHAR(50) NOT NULL UNIQUE,
    `phone_number` VARCHAR(20) NOT NULL,
    `department` VARCHAR(100) NOT NULL,
    `semester` INT NOT NULL,
    CONSTRAINT `fk_student_user` 
        FOREIGN KEY (`id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- Table: admins (Child table extending users)
-- ==============================================================================
CREATE TABLE `admins` (
    `id` BIGINT PRIMARY KEY,
    `admin_id` VARCHAR(50) NOT NULL UNIQUE,
    `department` VARCHAR(100) NOT NULL,
    CONSTRAINT `fk_admin_user` 
        FOREIGN KEY (`id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- Table: certificates (Available certificate types)
-- ==============================================================================
CREATE TABLE `certificates` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `certificate_name` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT NOT NULL,
    `processing_days` INT NOT NULL DEFAULT 3,
    `fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB;

-- ==============================================================================
-- Table: certificate_requests (Tracks certificate lifecycle & status transitions)
-- ==============================================================================
CREATE TABLE `certificate_requests` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `student_user_id` BIGINT NOT NULL,
    `certificate_id` BIGINT NOT NULL,
    `request_date` DATE NOT NULL,
    `purpose` TEXT NOT NULL,
    `document_type` VARCHAR(100) NULL,
    `document_file_name` VARCHAR(255) NULL,
    `document_file_type` VARCHAR(100) NULL,
    `document_data` LONGTEXT NULL,
    `certificate_number` VARCHAR(60) NULL UNIQUE,
    `status` VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED', 
    -- Allowed statuses: SUBMITTED, UNDER_REVIEW, NEEDS_RESUBMISSION, RESUBMITTED, APPROVED, REJECTED, ISSUED, CANCELLED
    `admin_remarks` TEXT NULL,
    `issued_date` DATE NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_request_student` 
        FOREIGN KEY (`student_user_id`) REFERENCES `students` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_request_certificate` 
        FOREIGN KEY (`certificate_id`) REFERENCES `certificates` (`id`) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ==============================================================================
-- Sample Seed Data
-- ==============================================================================

-- 1. Insert Base Users (Admins and Students)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Dr. Sarah Jenkins', 'admin@college.edu', 'admin123', 'ADMIN', NOW()),
(2, 'Prof. Alan Turing', 'alan.admin@college.edu', 'admin123', 'ADMIN', NOW()),
(3, 'John Doe', 'john.doe@college.edu', 'student123', 'STUDENT', NOW()),
(4, 'Alice Smith', 'alice.smith@college.edu', 'student123', 'STUDENT', NOW()),
(5, 'Robert Johnson', 'robert.j@college.edu', 'student123', 'STUDENT', NOW());

-- 2. Insert Admins
INSERT INTO `admins` (`id`, `admin_id`, `department`) VALUES
(1, 'ADM101', 'Academic & Registrar Section'),
(2, 'ADM102', 'Examination Controller Office');

-- 3. Insert Students
INSERT INTO `students` (`id`, `student_id`, `phone_number`, `department`, `semester`) VALUES
(3, 'STU2024001', '+1 555-019-2834', 'Computer Science and Engineering', 5),
(4, 'STU2024002', '+1 555-014-9981', 'Information Technology', 6),
(5, 'STU2024003', '+1 555-012-7723', 'Mechanical Engineering', 8);

-- 4. Insert Certificate Types (All free of cost)
INSERT INTO `certificates` (`id`, `certificate_name`, `description`, `processing_days`, `fee`) VALUES
(1, 'Bonafide Certificate', 'Certifies that the student is a genuine bona fide student currently enrolled in the college.', 2, 0.00),
(2, 'Course Certificate', 'Confirms current enrollment, courses registered, and completion status.', 3, 0.00),
(3, 'Conduct Certificate', 'Attests to good disciplinary record and moral conduct during academic tenure.', 2, 0.00),
(4, 'Transfer Certificate', 'Official certificate permitting transfer to another academic institution upon completion or withdrawal.', 5, 0.00),
(5, 'Migration Certificate', 'Enables transition to other universities/boards in accordance with university guidelines.', 7, 0.00);

-- 5. Insert Sample Certificate Requests with different statuses
INSERT INTO `certificate_requests` (`id`, `student_user_id`, `certificate_id`, `request_date`, `purpose`, `document_type`, `document_file_name`, `document_file_type`, `certificate_number`, `status`, `admin_remarks`, `issued_date`, `created_at`) VALUES
(1, 3, 1, CURDATE(), 'Required for opening a student bank account for scholarship credits.', 'Student ID Card', 'student_id_proof.pdf', 'application/pdf', NULL, 'SUBMITTED', NULL, NULL, NOW()),
(2, 3, 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Application for Summer Research Internship at Tech Labs.', 'Grade Sheet / Marksheet', 'semester_marksheet.pdf', 'application/pdf', NULL, 'UNDER_REVIEW', 'Academic records are being verified with HOD.', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 4, 3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Required for Passport and Visa Verification interview.', 'Passport/ID Verification', 'id_verification_copy.png', 'image/png', NULL, 'APPROVED', 'Verification completed. Sent to Registrar for digital signing.', NULL, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 4, 1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Bus pass concession application at Regional Transport Office.', 'Enrollment Slip', 'bus_concession_admission_slip.pdf', 'application/pdf', 'CERT-2026-0004-9812A', 'ISSUED', 'Issued digitally. Online certificate copy generated and verified.', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(5, 5, 4, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Transfer to national university for PG program.', 'Clearance Certificate', 'no_dues_clearance.pdf', 'application/pdf', NULL, 'REJECTED', 'Library books pending return. Clear library records and re-apply.', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY));
