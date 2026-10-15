# KIET KRA Tracker & Universal Accreditation Reporting System
## Master Architecture, Domain Model & Developer Playbook

> **Target Audience:** AI Coding Agents, Pair-Programmers, and Developers.  
> **Mission:** Provide an instant 360° mental model of the entire repository without consuming token budgets or requiring full-repo analysis.

---

## 1. Executive System Overview

### 1.1 Problem Statement & Solution
- **Previous State:** KIET University historically tracked ~50 Key Result Areas (KRAs) across 13 engineering/management departments using a complex, error-prone manual Excel workbook. This caused data inconsistencies, dead Google Drive evidence links, unscaled target thresholds, and manual delays during NBA/NAAC accreditation audits.
- **Current System:** A decoupled, role-based, intranet-hosted web application that:
  1. Standardizes all ~50 KRAs into structured data schemas and archetypes.
  2. Dynamically scales numeric targets based on department faculty/student strength (`target = base_target * faculty_strength`).
  3. Enforces strict bi-monthly submission cycles with automated email reminders and administrative deadline exceptions.
  4. Provides a split-screen live report builder for faculty/deans with pixel-perfect letterhead preview.
  5. Houses a dual-engine document exporter: produces official, audit-ready **PDFs** (via `xhtml2pdf`) and editable **Word (.docx)** documents (via `python-docx`).
  6. Stores raw JSON evidence and file attachments locally on the college intranet for 100% data privacy.

### 1.2 Technology Stack
| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Axios, Lucide Icons |
| **Backend** | Python 3.12, Django 5+, Django REST Framework (DRF), Celery 5+, Redis (Broker), SQLite (local dev) / PostgreSQL (production) |
| **Document Generation** | `python-docx` (Word engine), `xhtml2pdf` + HTML templates (PDF engine) |
| **Authentication** | Session & Token-based DRF Authentication with CSRF protection |
| **Infrastructure** | Docker, Docker Compose, Nginx (local campus intranet deployment) |

---

## 2. Directory Layout & Key Locations

```text
d:\KIET-KRA--main/
├── core/                           # Institution master definitions
│   ├── models.py                   # Department, KRAMetric, AccreditationCriteria, ExtraTarget
│   ├── views.py & urls.py          # Master data REST endpoints
│   └── management/commands/        # Seed scripts (e.g. init_kra_data)
├── accounts/                       # Identity & Role Management
│   ├── models.py                   # User (AbstractUser), AuditLog
│   └── views.py & urls.py          # Login, Logout, CSRF, Current User ('/me/')
├── tracker/                        # Core KRA Tracking, Cycles & Reporting Engine
│   ├── models.py                   # BiMonthlyCycle, CycleException, Achievement, Evidence, UploadedEvidenceFile
│   ├── views.py                    # AchievementViewSet, stats, export views, file upload handlers
│   ├── urls.py                     # Tracker routing endpoints
│   ├── kra_reports.py              # Word (.docx) styling and report builder engine for all KRAs
│   └── templates/tracker/          # HTML report templates (e.g. kra_generic_report.html)
├── frontend/                       # Next.js App Router Client
│   ├── app/                        # App router pages (page.tsx, layout.tsx, globals.css)
│   ├── components/
│   │   ├── SharedHeader.tsx        # Top institution header with user profile & role switcher
│   │   ├── SharedSidebar.tsx       # Department / Menu navigation
│   │   ├── TopRoleSwitcher.tsx     # Role switch dropdown (Dean ↔ Super Admin / VC)
│   │   ├── dean/                   # Dean dashboard, submission lists, split editor
│   │   │   ├── DeanDashboard.tsx   # Summary metric cards, cycle status, quick actions
│   │   │   ├── DeanMyKRAs.tsx      # Filterable 50-KRA grid/table with criteria tags
│   │   │   ├── SplitTemplateEditor.tsx # Interactive 50/50 split: Form on left, live Preview on right
│   │   │   └── DeanSubmissions.tsx # History of submitted achievements & statuses
│   │   ├── vc/                     # Super Admin / Vice-Chancellor / IQAC views
│   │   │   ├── VCDashboard.tsx     # Institution-wide performance analytics & heatmaps
│   │   │   ├── VCSubmissions.tsx   # Review queue to approve or reject submissions with feedback
│   │   │   ├── VCKRAManagement.tsx # KRA metric configuration & target management
│   │   │   └── VCReports.tsx       # Aggregated institution NBA/NAAC audit report generator
│   │   └── kra-forms/              # KRA Form & Live Preview System
│   │       ├── KRAFormRegistry.tsx # Route map dispatching KRA # to specialized or universal form
│   │       ├── KRATemplateDataForm.tsx # Universal 10-archetype dynamic form builder
│   │       ├── OfficialKRAReportPreview.tsx # Universal pixel-perfect letterhead preview
│   │       ├── SmartVACReportBuilder.tsx # Specialized KRA 1 (Value Added Courses)
│   │       ├── SmartKRA7ReportBuilder.tsx # Specialized KRA 7 (Curriculum Feedback)
│   │       └── MultiEvidenceUploader.tsx # Local multi-file attachment uploader
│   ├── context/
│   │   └── AppContext.tsx          # Master client state (user, active cycle, achievements, cache)
│   ├── services/
│   │   ├── api.ts                  # Axios client configured with CSRF tokens and baseURL
│   │   ├── kraReportService.ts     # PDF & DOCX export API dispatchers
│   │   └── seedData.ts             # Default fallback KRAs and initial institution data
│   └── types/
│       └── kra.ts                  # TypeScript types for KRAs, Achievements, Cycles, Submissions
```

---

## 3. Data Models & Relational Architecture

### 3.1 `core` App Models
1. **`Department`**
   - `name`: string (e.g. `'Computer Science & Engineering'`, `'ECE'`, `'IT'`).
   - `faculty_strength`: integer (used as multiplier for dynamic KRA annual targets).
   - `student_strength`: integer.
2. **`AccreditationCriteria`**
   - `nba_code`: string (e.g. `'NBA Criterion 2'`).
   - `naac_code`: string (e.g. `'NAAC Criterion 1.1'`).
3. **`KRAMetric`**
   - `serial_number`: string (e.g. `'KRA 1'`, `'KRA 7'`).
   - `activity_description`: text.
   - `target_type`: `'Numeric'` | `'Percentage'` | `'Boolean'`.
   - `annual_target`: string (number or descriptive threshold).
   - `criteria`: ForeignKey → `AccreditationCriteria`.

### 3.2 `accounts` App Models
1. **`User` (extends `AbstractUser`)**
   - `role`: `'SUPER_ADMIN'` (VC / Director / IQAC) or `'DEAN'` (Department Dean/HOD).
   - `department`: OneToOneField → `Department` (null for Super Admin).
2. **`AuditLog`**
   - Tracks actions, user, timestamp, IP, before_state, after_state for compliance.

### 3.3 `tracker` App Models
1. **`BiMonthlyCycle`**
   - `academic_year`: e.g. `'2026-2027'`.
   - `cycle_name`: choices = `['JUL-AUG', 'SEP-OCT', 'NOV-DEC', 'JAN-FEB', 'MAR-APR', 'MAY-JUN']`.
   - `deadline`: DateField (automated emails triggered 5 days prior).
   - `is_active`: boolean.
2. **`CycleException`**
   - Allows reopening a cycle for a specific department beyond standard deadline.
   - `cycle`, `department`, `open_until`, `reason`, `opened_by`.
3. **`Achievement` (Central Entity)**
   - `department`: FK → `Department`.
   - `kra_metric`: FK → `KRAMetric`.
   - `cycle`: FK → `BiMonthlyCycle`.
   - `status`: `'DRAFT'` | `'SUBMITTED'` | `'REJECTED'` | `'APPROVED'`.
   - `numeric_value`: DecimalField (for numeric metrics).
   - `remarks`: text.
   - `review_comment`: text (rejection reason or admin feedback).
   - `custom_data`: **JSONField** (Stores the entire structured form state for the specific KRA template, including tabular rows, coordinator names, dates, surveys, etc.).
   - `submitted_by`: FK → `User`.
   - **`dynamic_target` property**: Calculates `base_target * department.faculty_strength` dynamically.
4. **`UploadedEvidenceFile`**
   - Attached to `Achievement`.
   - `document_type`, `file`, `filename`, `file_size_kb`, `uploaded_at`, `uploaded_by`.

---

## 4. The KRA Form & Universal Reporting System

Every KRA submission requires structured evidence that can be previewed live and exported into official KIET University documents.

### 4.1 The 10 Universal KRA Archetypes
To avoid writing 50 separate forms, all ~50 KRAs map onto 10 standard archetypes handled by `KRATemplateDataForm.tsx` & `SmartUniversalReportBuilder.tsx`:
1. **VAC / Certificate Course** (Course title, duration, enrolled count, syllabus, coordinator).
2. **Curriculum Feedback & Action Taken** (Stakeholder surveys, percentage satisfaction, actions).
3. **Research, Publications & Patents** (Paper title, journal/conference, Scopus/SCI, DOI, authors).
4. **Workshops, FDPs & Conferences Organized** (Event title, dates, speakers, participants, budget).
5. **Student Competitions & Hackathons** (Event name, team members, prize won, level).
6. **Industry MOUs & Supported Labs** (Company name, validity, scope, outcomes).
7. **Placements & Higher Studies** (Student list, company, CTC, university admitted).
8. **Exam Results & Remedial Actions** (Subject, pass %, fail count, corrective plan).
9. **Mentoring & Student Counseling** (Mentee batches, sessions conducted, issues resolved).
10. **Institutional Governance & Committees** (Committee name, meetings held, key minutes).

### 4.2 Split Screen Architecture
- Located in `frontend/components/dean/SplitTemplateEditor.tsx`.
- **Left Panel:** Interactive form (`KRATemplateDataForm`, `SmartVACReportBuilder`, or `SmartKRA7ReportBuilder`). As the user types, the state updates in real time.
- **Right Panel:** Live Official Document Preview (`OfficialKRAReportPreview.tsx`). Matches the exact layout, maroon/blue KIET header, metadata tables, dynamic table rows, photo spaces, and sign-off blocks.
- **Top Actions:**
  - `Save Draft`: Persists state to `custom_data` with status `DRAFT`.
  - `Submit for Approval`: Validates required fields, sets status `SUBMITTED`.
  - `Export PDF`: Calls `/api/tracker/export-kra-pdf/`.
  - `Export DOCX`: Calls `/api/tracker/export-kra-docx/`.

---

## 5. Dual-Engine Document Export Architecture

Both PDF and Word exports match official KIET University document formatting:
- **Header:** KIET University Logo, Department Name, Academic Year, Cycle, Date.
- **Title Block:** Official KRA Code, Formal Accreditation Title, Prepared By, Designation.
- **Summary Metadata Table:** Coordinator details, venue, dates, target vs achieved.
- **Data Table:** Dynamic tabular rows matching the specific KRA (with shaded header rows).
- **Survey / Rating Grid (if applicable):** Questions, Likert scales, averages.
- **Action Taken / Narrative:** Descriptive paragraphs and remedial plans.
- **Signatures Block:** Faculty Coordinator, Head of Department, Dean of Faculty.

### 5.1 PDF Exporter (`tracker/views.py` + `xhtml2pdf`)
- **Endpoint:** `POST /api/tracker/export-kra-pdf/`
- **Template:** `tracker/templates/tracker/kra_generic_report.html`
- **Mechanism:** Takes the submitted JSON data, renders HTML with embedded CSS, converts to PDF stream using `xhtml2pdf.pisa`.

### 5.2 Word (.docx) Exporter (`tracker/kra_reports.py` + `python-docx`)
- **Endpoint:** `POST /api/tracker/export-kra-docx/`
- **Mechanism:** Builds a clean, editable Word `.docx` file programmatically:
  - Header styling with KIET Blue (`RGBColor(0, 35, 111)`) and Maroon (`RGBColor(98, 36, 35)`).
  - Shaded table headers with custom borders.
  - Formatted paragraphs, bullets, and table widths.

---

## 6. Key REST API Endpoints

| Method | Endpoint | Description | Permissions |
|---|---|---|---|
| `POST` | `/api/accounts/login/` | User authentication (username & password) | Public |
| `POST` | `/api/accounts/logout/` | User logout | Authenticated |
| `GET` | `/api/accounts/me/` | Fetch current authenticated user & role | Authenticated |
| `GET` | `/api/accounts/csrf/` | Retrieve CSRF cookie | Public |
| `GET` | `/api/core/departments/` | List all departments & strengths | Authenticated |
| `GET` | `/api/core/kra-metrics/` | List all 50 KRA definitions & criteria | Authenticated |
| `GET` | `/api/tracker/cycles/` | List academic cycles & deadlines | Authenticated |
| `GET` | `/api/tracker/achievements/` | List achievements (filtered by dept/cycle) | Authenticated |
| `POST` | `/api/tracker/achievements/upsert/` | Create or update achievement with `custom_data` | Dean / Admin |
| `GET` | `/api/tracker/dashboard-stats/` | Dashboard metrics, completion rates, totals | Authenticated |
| `POST` | `/api/tracker/export-kra-pdf/` | Generate official PDF report for any KRA | AllowAny |
| `POST` | `/api/tracker/export-kra-docx/` | Generate editable Word (.docx) for any KRA | AllowAny |
| `POST` | `/api/tracker/evidence-file/upload/` | Upload supporting document/image | Dean / Admin |
| `DELETE` | `/api/tracker/evidence-file/<id>/` | Delete uploaded file | Dean / Admin |

---

## 7. Developer Playbook: How to Make Changes

### 7.1 How to Add or Modify a Specialized KRA Form
1. Create or update the form component in `frontend/components/kra-forms/MyKRAForm.tsx`.
2. Register the component in `frontend/components/kra-forms/KRAFormRegistry.tsx`:
   ```tsx
   import MyKRAForm from './MyKRAForm';
   
   // Inside getKRAFormComponent(kraNumber):
   if (cleanNum === 15) {
     return <MyKRAForm {...props} />;
   }
   ```
3. Ensure the form saves its data into `achievement.custom_data` via `onSave(formData)`.

### 7.2 How to Adjust Report Layouts
- **For PDF:** Edit `tracker/templates/tracker/kra_generic_report.html`. Note: `xhtml2pdf` supports standard CSS 2.1 (avoid flexbox/grid; use standard `<table>` layout).
- **For DOCX:** Edit `tracker/kra_reports.py`. Check `generate_kra_report_docx(data)`.
- **For React Live Preview:** Edit `frontend/components/kra-forms/OfficialKRAReportPreview.tsx`.

### 7.3 How to Run Backend Locally
```powershell
# From root directory:
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 7.4 How to Run Frontend Locally
```powershell
cd frontend
npm install
npm run dev
# Accessible at http://localhost:3000
```

### 7.5 Docker Full Stack Deployment
```powershell
docker-compose up --build -d
```
Runs:
- `db`: PostgreSQL container
- `redis`: Redis broker container
- `backend`: Django web application (Gunicorn)
- `celery`: Background worker for bi-monthly deadline reminders
- `frontend`: Next.js production server
- `nginx`: Reverse proxy routing requests on the local intranet
