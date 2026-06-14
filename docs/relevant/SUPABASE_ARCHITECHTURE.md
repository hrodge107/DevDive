# DevDive: Supabase Architecture & Data Flow

## Overview
DevDive utilizes a **Stateless Content / Stateful Ledger** architecture on Supabase PostgreSQL. The application follows an **Independent Learner Model** (no multi-tenant classrooms or teacher roles).

## 1. Identity Layer
* **`auth.users`**: Managed natively by Supabase (handles emails, passwords, JWTs).
* **`public.profiles`**: Application-level identity, linked 1:1 via an `id` Foreign Key to `auth.users`. Contains `username`, `email`, and `created_at`. Automatically populated via a Postgres Trigger on new user signup.

## 2. Content Layer (The Curriculum)
Content is strictly **stateless**. Tables use numeric, auto-incrementing `INT` primary keys. There is NO `is_completed` column in these tables.
* **`units`**: The top-level container. 
  * Columns: `id` (INT, PK), `unit_number` (INT), `title` (TEXT).
* **`lessons`**: The core reading milestone. 
  * Columns: `id` (INT, PK), `unit_id` (INT, FK), `lesson_number` (INT), `title` (TEXT), `markdown_body` (TEXT).
* **`quizzes`**: Optional assessment tied 1:1 to a lesson. 
  * Columns: `id` (INT, PK), `lesson_id` (INT, FK, UNIQUE), `questions` (JSONB).
* **`exercises`**: Optional coding sandbox tied 1:1 to a lesson. 
  * Columns: `id` (INT, PK), `lesson_id` (INT, FK, UNIQUE), `task_description` (TEXT), `starter_files` (JSONB), `ai_rubric` (JSONB - *MUST remain hidden from frontend*).

## 3. The State Layer (The Ledger)
* **`public.user_progress`**: A log-optimized ledger that tracks when a user completes a milestone.
  * Columns: `id` (BIGINT, PK), `user_id` (UUID, FK), `unit_id` (INT, FK), `lesson_id` (INT, FK, NULLABLE), `exercise_id` (INT, FK, NULLABLE), `is_completed` (BOOLEAN), `exercise_score` (INT).
  * **Core Logic:** Completion state is determined purely by the *presence* of a row for a specific user and lesson/exercise ID. 

## 4. Frontend Integration Rules
* **Curriculum Fetching:** The frontend (`CourseMap.jsx`) fetches the relational tree using `supabase.from('units').select('*, lessons(*, quizzes(*), exercises(*))')`.
* **State Merging:** The frontend fetches the user's progress ledger in parallel. It transforms the completed numeric IDs into a fast-lookup JavaScript `Set`. 
* **Semantic Statuses:** During the render cycle, the UI checks the `Set` to assign a semantic status:
  * `'completed'`: ID exists in the ledger.
  * `'auth_locked'`: User is not logged in AND the lesson has an attached exercise.
  * `'not_started'`: Default state (open and clickable).
* **Backend Evaluation:** When evaluating code, the Node.js/Express backend MUST use the `SERVICE_ROLE_KEY` to securely fetch the `ai_rubric` from the `exercises` table to prevent client-side inspection.