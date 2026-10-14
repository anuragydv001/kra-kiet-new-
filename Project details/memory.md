# Project Memory & Status

## Current Status
- **Phase:** Development Phase 1 (Backend Initialization).
- **Next Step:** Refactored Roles: Removed FACULTY/HOD and enforced DEAN and SUPER_ADMIN roles across models and APIs.! Awaiting Frontend Integration.

## Completed Items
- Defined tech stack (Next.js, Django, Postgres, Docker).
- Established 4-member parallel workflow.
- Removed JWT and implemented Django Session Authentication.
- Backend 1: Core models and base app initialized.
- Refactored Evidence model to use JSON form data instead of manual uploads.
- Backend 2: Created CycleException model and DRAFT/SUBMITTED/REJECTED/APPROVED per-KRA workflow.
- Backend 2: Refactored generic PDF engine into a versioned Template Registry.
- Backend 2: Built Admin Reporting API (DashboardStatsView) aggregating college-wide KRA compliance.
- Backend 2: Set up Celery & Redis for asynchronous background tasks.
- Backend 2: Wrote 'send_deadline_reminders' task to email HODs 5 days before deadlines.
- Backend 2: Implemented TemplatePreviewView using ReportLab to generate on-the-fly PDFs from JSON form data.
- Backend 2: Built tracker app Serializers and Views (REST APIs) including the Template API stub.
- Backend 2: tracker app models (BiMonthlyCycle, Achievement, Evidence) created and migrated.
- Finalized local intranet deployment strategy.
- Created SRS and Defense Guide artifacts.
- Created Desktop project management files.

## Important Decisions Logged
- **Dynamic Calculation:** Shifted from hardcoded KRA targets to dynamic calculation based on department strength.
- **Live Preview:** Added template generation engine to replace raw data entry.
- **Intranet Only:** Removed AWS/Vercel dependency for privacy/security compliance.

## Bugs & Fixes
- *(None yet. System is in pre-development phase).*
