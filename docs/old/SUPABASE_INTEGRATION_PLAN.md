This is a massive milestone. Locking down your database schema on the Supabase website before writing the integration code is exactly how senior engineers avoid messy migrations later. You now have a solid, production-ready foundation waiting for your application.

Here is the markdown documentation you can copy directly into your repository (e.g., `docs/supabase_architecture.md` or appended to your main `README.md`).

---

# DevDive Technical Architecture: Supabase & User Progress

## Overview

This document outlines the database architecture for **DevDive**, transitioning from a localized, flat-file prototype to a cloud-ready, forward-compatible relational database using Supabase.

As of the current phase, DevDive operates strictly on an **Independent Learner Model**. The complexity of multi-tenant classrooms, teachers, and student roles has been removed to prioritize a flawless, non-linear core learning loop.

> **Current Implementation Status:** The database schema, triggers, and Row Level Security (RLS) policies are active and configured in the remote Supabase project. **No changes have been applied to the local repository code yet.** The React frontend and Express backend are pending integration with the `@supabase/supabase-js` client.

---

## 1. Core Identity Architecture

User identity is split into two components to separate secure authentication from public application data.

### `auth.users` (Supabase Managed)

* Handles secure credentials, password encryption, and session tokens.
* **Note:** This table is managed entirely by Supabase. We do not write to this table manually.

### `public.profiles` (Application Managed)

Maintains the student's identity within the DevDive application. Linked 1:1 with `auth.users`.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | UUID | Primary Key, FK (`auth.users.id`) | Secure identifier bridging to the auth shell. |
| `username` | TEXT | UNIQUE, NOT NULL | Display handle for the learner. |
| `email` | TEXT |  | Cached email for administrative queries. |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp. |

#### Automated Profile Generation

A PostgreSQL trigger (`on_auth_user_created`) automatically intercepts successful sign-ups in `auth.users` and generates a corresponding row in `public.profiles`, using the prefix of their email address as a temporary username.

---

## 2. The Progress Ledger (`public.user_progress`)

DevDive tracks progress using a **Highly Normalized Relational Hierarchy**. Instead of updating a single array inside the user's profile, the system logs a new ledger row for each completed milestone.

This design mirrors the current static file directory structure (e.g., `/u1/l1/`) but uses explicit foreign key columns to ensure forward compatibility when content is eventually migrated to the database.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | BIGINT | Primary Key, IDENTITY | Unique log entry identifier. |
| `user_id` | UUID | FK (`profiles.id`), NOT NULL | The learner who completed the activity. |
| `unit_id` | TEXT | NOT NULL | The parent unit structural key (e.g., `u1`). |
| `lesson_id` | TEXT | NULLABLE | The specific lesson key (e.g., `l1`). NULL if standalone exercise. |
| `exercise_id` | TEXT | NULLABLE | The specific exercise key. NULL if pure reading/quiz. |
| `is_completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Binary flag confirming successful completion. |
| `exercise_score` | INT | CHECK (0-100), DEFAULT 0 | AI-evaluated quality score for coding exercises. |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp of the milestone achievement. |

#### Data Integrity Constraints

To prevent duplicate logging if a user re-submits an exercise, **Partial Unique Indexes** ensure a student can only have one progress row per specific `lesson_id` or `exercise_id`.

---

## 3. Security (RLS Policies)

Row Level Security is enabled on all public tables:

* **Read Access:** Authenticated users can read all profile and progress data (required for generating course maps and leaderboards).
* **Write Access:** Users are strictly limited to updating their *own* profiles and inserting progress rows that match their *own* `auth.uid()`.

---

### Part 2: Mentor's Opinion on Structuring Your JSON Content

Now that your database is standing by to track the *state* of the user, how should you structure the actual JSON *content* files inside those `u1/l1/` folders?

Here is my architectural advice on the direction you should take:

**1. Keep State Completely Out of the JSON**
Your JSON files should act like printed textbooks. They should have absolutely no concept of "completion," "progress," or "current user." Never include fields like `"is_completed": false` in your content files. Let the Supabase ledger handle 100% of the state, while the JSON handles 100% of the educational material.

**2. The Tri-File Component Split**
Inside a folder like `public/curriculum/u1_html/l1_intro/`, your files should have highly specific jobs:

* **`lesson.json` (The Reading):** Keep this focused on metadata and markdown.
* *Fields to include:* `title`, `estimated_minutes`, `markdown_body`.


* **`quiz.json` (The Assessment):** Keep this structured for easy UI rendering.
* *Fields to include:* An array of `questions`, each with `options` (array of strings), and a `correct_index` (integer).


* **`exercise.json` (The Lab):** This is the most complex. It needs to feed both the Monaco editor on the frontend and the Express/Gemini evaluator on the backend.
* *Fields to include:* `task_description` (for the sidebar), `starter_files` (array of filenames and default code strings to load into Monaco), and `ai_rubric` (the hidden grading rules).



**3. The "Table of Contents" File**
Because you are using isolated folders, your frontend might struggle to know how many total lessons exist (to calculate the overall progress percentage). I highly recommend creating one master file at the root: `public/curriculum/course_map.json`. This file should just be a lightweight array outlining the intended order of the units and lessons so your React router knows exactly how to build the navigation sidebar.

Now that the database is live and your structural plan is solid, what part of the application do you want to wire up first—the React login screens using Supabase Auth, or the `course_map.json` to get your frontend navigation rendering correctly?

---

## The following changes are done by AntiGravity
# DevDive Supabase Integration Walkthrough

## Overview
Successfully transitioned DevDive from a localized, stateless application using hardcoded files to a cloud-ready web app powered by Supabase.

## Changes Made

### 1. File Structure Restructured
Merged the disparate `public/lessons` and `public/exercises` into a neat Tri-File component hierarchy:
- `public/curriculum/u1/l1/lesson.json`
- `public/curriculum/u1/e1/exercise.json`

### 2. Stateless Content Maps
- Created a new `public/curriculum/course_map.json`.
- Removed `status` from the JSON object to keep educational content strictly separated from user progress, conforming to the Independent Learner Model guidelines.

### 3. Supabase Authentication
- Installed `@supabase/supabase-js`.
- Implemented `supabaseClient.js` for secure access using `.env` variables.
- Wrapped the app in an `AuthContext` to manage session persistence natively.
- Created dynamic React components for `LoginPage` and `SignupPage` connected to Supabase Auth.
- Updated the header to display Sign-In and Sign-Out buttons contextually based on user state.

### 4. Dynamic Curriculum
Re-wired `CourseMap.jsx` to dynamically merge the static curriculum mapping with `user_progress` rows fetched securely from Supabase, computing "locked", "in_progress", or "completed" visually for the timeline.

### 5. Backend Ledger Automation
- Initialized the Supabase server client `server/lib/supabase.js`.
- Hooked the React UI (`LessonPage.jsx`) to explicitly log theory knowledge checks into the Supabase ledger.
- Connected the Node.js Gemini AI evaluator (`evaluation.controller.js`) to automatically inject an `exercise_score` record directly into the Supabase database upon successful validation (scoring >= 75/100).

## Verification
To verify the system end-to-end:
1. Ensure your `.env` and `.env.local` files contain `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
2. Run `npm run dev` to launch both servers.
3. Use the new `/signup` interface to create a test learner account.
4. Interact with the `CourseMap` and complete an exercise to verify it natively logs an `is_completed: true` record to the Supabase dashboard.

