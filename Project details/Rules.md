# Project Rules & AI Guidelines

> **ATTENTION AI AGENTS:** If you are an AI reading this file, you must strictly adhere to all rules below. Treat this folder as your primary context.

## 1. AI Execution & Workflow Directives
- **Read Before Acting:** Before writing code, always read 	ask.md to know what is next, and read memory.md to understand the current state.
- **Always Branch:** NEVER push directly to main for new features. Always create a new Git branch for your specific task (e.g., git checkout -b feat/task-name).
- **Continuous Documentation:** Update Project details (memory.md, 	ask.md) after every new piece of work is completed, and explicitly detail to the user what was done.

## 2. General Principles
- **DRY (Don't Repeat Yourself):** Extract reusable logic in both Next.js components and Django services.
- **Fail Fast:** Validate data at the frontend boundary, and strictly enforce it at the Django ORM level.
- **Security First:** Never expose local file paths. Always use Django Session Authentication for API access.

## 3. Tech & Coding Standards
- **Next.js / Frontend:** TypeScript strictly. Tailwind CSS for styling. Components must be functional and use Hooks.
- **Django / Backend:** Follow PEP8 styling guidelines. Keep "Fat Models, Thin Views". Use Django REST Framework Serializers for validation.

## 4. Project Structure Rules
- API responses must be standardized: { "data": ..., "message": "...", "status": ... }
- Use environmental variables (.env) for secrets.