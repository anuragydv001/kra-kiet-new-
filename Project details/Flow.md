# Execution Flow

## 1. Deployment Entry Point
1. College IT runs `docker-compose up`.
2. **Nginx** container starts, listening on local IP port 80.
3. Nginx routes `/api/*` traffic to the **Django Gunicorn** container.
4. Nginx routes `/` traffic to the **Next.js** container.
5. **Redis** and **Celery** worker containers boot up to monitor emails.

## 2. User Authentication Flow
1. User navigates to local IP. Next.js loads the Login Page.
2. User enters credentials -> POST `/api/auth/login/`.
3. Django verifies credentials against Postgres DB and returns Session Cookies.
4. Next.js stores tokens securely. Route middleware redirects user based on Role (Admin -> Admin Dashboard, HOD -> Department Dashboard).

## 3. Data Entry & Live Preview Flow
1. Faculty selects a KRA.
2. Next.js renders the specific Template Form for that KRA.
3. As Faculty types, Next.js debounces the input and sends POST `/api/tracker/preview/`.
4. Django Template Engine processes the JSON, generates a PDF in memory, and returns the binary stream.
5. Next.js renders the PDF in the Split-Screen UI.
6. Faculty clicks "Submit" -> POST `/api/tracker/achievements/` -> Saved permanently to Postgres.

## 4. Automated Email Flow
1. Celery Beat runs a cron task every day at 00:01 AM.
2. The task queries `BiMonthlyCycle` where `deadline == today + 5 days`.
3. If true, fetches all Faculty/HOD emails associated with pending KRAs for that cycle.
4. Dispatches email jobs to Redis queue.
5. Celery Worker consumes the queue and sends SMTP emails.
