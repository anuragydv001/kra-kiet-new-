# REPOMIX AI CODING INSTRUCTIONS
## Project: KIET KRA Tracker & Universal Accreditation Reporting System

Welcome AI Agent. This file is an optimized Repomix bundle containing the core architecture, data schemas, backend endpoints, and frontend components for the KIET KRA Tracker.

### 1. Essential Mental Model
- This is an enterprise web app replacing an Excel sheet for 13 academic departments tracking ~50 Key Result Areas (KRAs) for NBA & NAAC accreditation.
- **Backend:** Django 5 + Django REST Framework + Celery/Redis. Base apps: `core`, `accounts`, `tracker`.
- **Frontend:** Next.js 14+ (App Router), React 18, Tailwind CSS, TypeScript in `frontend/`.
- **Key Models:**
  - `KRAMetric` (`serial_number`, `annual_target`, `target_type`)
  - `Department` (`faculty_strength`, `student_strength`)
  - `BiMonthlyCycle` (`JUL-AUG`, `SEP-OCT`, etc., `deadline`)
  - `Achievement` (links `department` + `kra_metric` + `cycle`; stores structured form data in `custom_data` JSONField)
- **Target Scaling:** `dynamic_target = base_target * department.faculty_strength` (for Numeric KRAs).

### 2. KRA Form & Report Pipeline
- Deans fill KRA reports using `SplitTemplateEditor.tsx` (left: form, right: live official preview `OfficialKRAReportPreview.tsx`).
- Forms are routed via `frontend/components/kra-forms/KRAFormRegistry.tsx`.
- Form state is stored directly in `achievement.custom_data`.
- Dual Document Exporting:
  - **PDF:** `POST /api/tracker/export-kra-pdf/` -> `tracker/views.py` renders `tracker/templates/tracker/kra_generic_report.html` via `xhtml2pdf`.
  - **Word DOCX:** `POST /api/tracker/export-kra-docx/` -> `tracker/kra_reports.py` builds `.docx` via `python-docx`.

### 3. Key Conventions for Modifications
- When adding/modifying forms: update `frontend/components/kra-forms/` and register in `KRAFormRegistry.tsx`.
- When updating report formats: maintain consistency between `OfficialKRAReportPreview.tsx`, `kra_generic_report.html`, and `kra_reports.py`.
- Preserve existing comments and docstrings.
- Always check `AI_PROJECT_CONTEXT.md` at the top of this bundle for deep architectural references.
