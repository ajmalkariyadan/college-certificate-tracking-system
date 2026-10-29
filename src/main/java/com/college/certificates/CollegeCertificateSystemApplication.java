package com.college.certificates;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for College Certificate Request & Tracking System.
 */
@SpringBootApplication
public class CollegeCertificateSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(CollegeCertificateSystemApplication.class, args);
        System.out.println("===============================================================");
        System.out.println(" College Certificate Request & Tracking System Started!");
        System.out.println(" Backend API Base URL: http://localhost:8080/api");
        System.out.println("===============================================================");
    }
}
