# Architecture & Tech Decisions

## 1. Why Next.js over React SPA?
- **Decision:** Use Next.js App Router.
- **Reason:** Provides built-in routing, better performance via server components, and is the enterprise standard for React. It handles heavy data fetching (for Admin dashboards) more efficiently than standard client-side React.

## 2. Why Django & PostgreSQL?
- **Decision:** Use Django with DRF and Postgres.
- **Reason:** Django offers high security out-of-the-box, a built-in admin panel for emergency database management, and a robust ORM that easily handles the complex relational mapping between Departments, dynamic KRAs, and bi-monthly achievements. Postgres enforces strict data integrity.

## 3. Why Local Intranet via Docker?
- **Decision:** Host on local college servers instead of AWS/Cloud.
- **Reason:** Ensures 100% data privacy. By using Docker, we avoid "it works on my machine" issues. IT staff can deploy the entire stack with a single `docker-compose up` command.

## 4. Why Celery & Redis for Emails?
- **Decision:** Offload email tasks to Celery.
- **Reason:** If we put a sleep timer or a synchronous loop in Django to check for deadlines 5 days prior, the server will crash. Celery runs asynchronously in the background, checking the database daily without interrupting the main web application.

## 5. Why Live Preview Templates?
- **Decision:** Generate PDFs on the fly based on form data.
- **Reason:** Ensures standard formatting across all 13 departments. Faculty no longer have to design their own Word documents; they just fill a form and the system generates the official compliance document.


## 6. Why Data-Driven Evidence over Manual File Uploads?
- **Decision:** The Evidence model stores raw JSON data (document_data) instead of requiring an explicit file upload.
- **Reason:** Faculty should be able to edit their reports later without having to re-upload PDFs. The frontend form saves the raw JSON to the database, and the backend handles generating the final PDF automatically upon export.