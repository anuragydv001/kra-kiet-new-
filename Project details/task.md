# Full Project Task Breakdown (Phases 1-3)

This document tracks the tasks for all 4 members across the entire 15-day timeline.

---

## Backend Member 1 (Architecture & Security)

### Phase 1: Foundation (Completed)
- [x] Initialize Django project and Postgres connection.
- [x] Implement Custom User Model (Roles: Super Admin, Dean).
- [x] Implement `Department` model with `faculty_strength` and `student_strength`.
- [x] Implement `KRA_Metric` model and logic for dynamic target calculation.
- [x] Setup Django Session Authentication configuration.

### Phase 2: API & Permissions
- [x] Create `core/serializers.py` for Departments, Users, and KRAs.
- [x] Create `core/views.py` (CRUD REST endpoints for Super Admins).
- [x] Implement Custom Permissions (e.g., `IsSuperAdmin`, `IsHOD`) to strictly isolate department data.
- [x] Write the Python property/signal logic to actively multiply KRA targets by department strength.

### Phase 3: Final Polish
- [x] Conduct final security audit (Ensure no N+1 query problems in the ORM).
- [x] Remove all debug prints and ensure logging is configured for production.

---

## Backend Member 2 (Core Engine & Mail)

### Phase 1: Transactional Models (Completed)
- [x] Implement `BiMonthlyCycle` model with deadlines.
- [x] Implement `Achievement` model linking KRAs and Departments.
- [x] Refactor `Evidence` model to store JSON `document_data` instead of manual PDF uploads.

### Phase 2: Transactional APIs & Template Engine
- [x] Create `tracker/serializers.py` for Cycles, Achievements, and Evidence.
- [x] Build `tracker/views.py`: API for Faculty to GET assigned KRAs and POST form data.
- [x] Build Template API: Accept JSON form data, save it to `document_data`, and generate a live PDF using ReportLab.

### Phase 3: Background Tasks & Reporting
- [x] Setup Celery & Redis inside the Django project.
- [x] Write background task to email HODs exactly 5 days before a `BiMonthlyCycle` deadline.
- [x] Build Admin Reporting API: Aggregate all department KRA data to serve the institutional dashboard charts.

---

## Frontend Member 1 (Admin & Deployment)

### Phase 1: Intranet Setup & Auth
- [ ] Initialize Next.js (App Router) project with Tailwind CSS.
- [ ] Set up basic `docker-compose.yml` for local intranet testing (Next + Django + Postgres).
- [ ] Build Login UI and configure Axios to send `withCredentials: true` for Django Sessions.

### Phase 2: Admin Command Center
- [ ] Build Super Admin Dashboard layout (Sidebar, Header).
- [ ] Integrate Chart.js or Recharts to visualize institutional progress (consuming Backend 2's Aggregation API).
- [ ] Build Admin screens to manage Users, Departments, and assign dynamic KRAs.

### Phase 3: Export & Final Deployment
- [ ] Build the Live Report Export UI (Buttons to download PDF/Excel compliance reports).
- [ ] Configure Nginx reverse proxy routing inside Docker to correctly route `/api/` to Django and `/` to Next.js.

---

## Frontend Member 2 (HOD/Faculty Portal)

### Phase 1: Dashboard Foundation
- [ ] Build Dean dashboard layout.
- [ ] Fetch and display assigned KRAs based on the logged-in user's department.
- [ ] Build progress bars showing specific department targets vs current achievements.

### Phase 2: Dynamic Data Entry Forms
- [ ] Build standard numeric/percentage input forms for basic KRAs.
- [ ] Build detailed Template Forms for complex KRAs (e.g., Event details, Attendees).
- [ ] Implement client-side validation so faculty cannot enter text into math fields.

### Phase 3: Split-Screen Live Preview UI
- [ ] Build the Split-Screen UI: Form inputs on the left, PDF viewer component on the right.
- [ ] Hook up the debounce function: When faculty stops typing for 1 second, ping the Backend 2 Template API to refresh the PDF preview on the right.
- [ ] Build the final "Submit & Approve" confirmation flow.
