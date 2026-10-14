# Product Requirements Document (PRD)

## 1. Product Overview
The KIET KRA Tracker is a centralized, role-based Enterprise Web Application designed to replace the existing Excel-based tracking mechanism. It tracks Key Result Areas (KRAs) across various departments for NBA and NAAC accreditation standards.

## 2. Problem Statement
Currently, the institution uses a manual, error-prone Excel sheet with 13 department tabs to track ~50 KRAs. This leads to data inconsistency, broken Google Drive evidence links, lack of dynamic target scaling based on department strength, and significant delays in generating compliance reports.

## 3. Goals
- Eliminate manual spreadsheet entry.
- Ensure strict data typing (numbers vs text).
- Securely store evidence locally without relying on external cloud links.
- Automate reminders and report generation.
- Dynamically scale KRA targets based on faculty/student strength.

## 4. Target Users
1. **Super Admin (IQAC/Management):** Global overview, report generation, system management.
2. **HOD (Head of Department):** Department-level dashboard to monitor faculty progress.
3. **Faculty:** Fills out standardized templates and uploads evidence.

## 5. Core Features
- **Dynamic KRA Distribution:** Targets automatically multiply based on department faculty/student counts.
- **Template & Live Preview:** Standardized forms for data entry that instantly generate a PDF preview before submission.
- **Automated Email Reminders:** Emails sent 5 days before bi-monthly deadlines.
- **Intranet Security:** Completely local deployment via Docker.
- **Role-Based Access Control:** Strict data isolation between departments.
