# System Architecture

## 1. Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Python, Django, Django REST Framework (DRF)
- **Database:** PostgreSQL
- **Background Tasks:** Celery, Redis (for email reminders)
- **Deployment:** Docker, Docker Compose, Nginx (Local Intranet)

## 2. Architecture Overview
The application follows a decoupled client-server architecture interacting via REST APIs. 
- The Next.js frontend is served locally.
- The Django backend exposes secured endpoints.
- Celery workers continuously monitor the Postgres DB for deadlines and use Redis as a message broker to dispatch emails.

## 3. Proposed Folder Structure
```text
/kiet-kra
├── /frontend
│   ├── /app          # Next.js App Router
│   ├── /components   # Reusable UI (Tailwind)
│   ├── /lib          # API calls (Axios)
│   └── package.json
├── /backend
│   ├── /core         # Django base app & Auth
│   ├── /tracker      # KRA & Achievement logic
│   ├── /reports      # Template Engine & PDF generation
│   ├── manage.py
│   └── requirements.txt
├── /nginx            # Reverse proxy config
└── docker-compose.yml
```
