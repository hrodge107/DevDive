# DevDive Technical Audit & Architecture Report

## 1. Current Implementation Report

### Directory Structure & Role
The repository is structured as a monorepo containing both the frontend application and a lightweight backend evaluation server:
*   **/server**: Contains the Express.js backend responsible for evaluating student code (`index.js`).
*   **/src**: The frontend React application built with Vite.
    *   **/pages**: Top-level route components (`LandingPage.jsx`, `CourseMap.jsx`, `ExercisePage.jsx`, `LessonPage.jsx`).
    *   **/components**: Reusable UI components (e.g., `Header.jsx`, `CourseTimeline.jsx`) and a dedicated `/ide` directory for the code editor environment (`CodeEditor.jsx`, `ExerciseContainer.jsx`, `ResultsSidebar.jsx`).
    *   **/content**: Static JSON data contracts (e.g., `course_map.json`) that act as the single source of truth for the curriculum.
    *   **/utils**: Utility functions for HTML string manipulation and local storage management (`htmlUtils.js`).

### Tech Stack Verification
*   **Frontend:** React 19.2.5, React Router v7, Vite 8, Tailwind CSS v4, Monaco Editor 4.7.0.
*   **Backend:** Express 5.2.1 running on Node.js.
*   **Third-Party Services:** 
    *   Playwright 1.59.1 (Headless browser automation).
    *   Google Generative AI API v0.24.1 (Gemini 2.5 Flash for code and visual evaluation).
*   **Database:** *None.* There are no database drivers (Prisma, Supabase, SQL) installed or configured in the current codebase.

### Core Workflows
1.  **Code Input:** Students write HTML, CSS, and JS in the Monaco Editor on the frontend.
2.  **Submission:** The frontend sends a POST request to `/api/check` containing the raw code and an AI evaluation rubric.
3.  **Assembly & Rendering:** The Express backend assembles the code into a unified HTML string, launches Playwright, injects the code, and captures screenshots (desktop/mobile).
4.  **AI Evaluation:** The source code and base64 screenshots are sent to Gemini 2.5 Flash with a strict prompt forcing a JSON response based on the rubric.
5.  **Grading:** The server parses the AI response, calculates a score (out of 100), generates a targeted hint, and returns the results to the frontend.

---

## 2. Technical Documentation

### API Route Map
*   **`POST /api/check`**
    *   **Purpose:** Evaluates student code against a predefined rubric and captures visual output.
    *   **Request Payload (JSON):**
        ```json
        {
          "code": {
            "html": "<h1>Hello</h1>",
            "css": "h1 { color: red; }",
            "js": ""
          },
          "aiRubric": {
            "codeRequirements": ["Must use an h1 tag"],
            "visualRequirements": ["Text must be red"]
          },
          "captureScreens": ["desktop", "mobile"]
        }
        ```
    *   **Response Payload (JSON):**
        ```json
        {
          "score": 100,
          "isPassed": true,
          "screenshot": "base64_encoded_png...",
          "overallHint": "🎉 Excellent! Your submission meets all requirements...",
          "codeEvaluation": [{ "requirement": "Must use an h1 tag", "passed": true }],
          "visualEvaluation": [{ "requirement": "Text must be red", "passed": true }]
        }
        ```
*   **`GET /api/health`**
    *   **Purpose:** Verifies server uptime. Returns `{ "status": "ok", "timestamp": "..." }`.

### State Management
The frontend avoids complex global state managers (like Redux or Zustand). According to strict guidelines in `ARCHITECTURE.md`, editor state is maintained via React `useState` and persistently cached in the browser's `localStorage`.
*   **Rehydration:** On mount, `ExerciseContainer` reads from `localStorage` using the `exercise_ref` as the key.
*   **Persistence:** Code changes are debounced and saved to `localStorage` to prevent data loss if the user navigates back to the Course Map.

### Database Schema
**No active database exists.** The application currently relies entirely on static data files (`src/content/course_map.json`) for the curriculum timeline. User progress is strictly local. Any future implementation of user authentication or progress tracking will require a ground-up database integration.

---

## NOTE: The following section has been fixed, but kept for historical purposes.

## 3. Hosting Feasibility & Resource Analysis

### Headless Browser Dependencies
The backend relies heavily on `chromium.launch()` via Playwright. 
*   **System Requirements:** Playwright requires extensive underlying OS libraries (e.g., `libnss3`, `libasound2`, `libatk-bridge2.0-0` on Linux). 
*   **Docker Requirement:** A standard minimal Node.js Docker image will fail. The host must use the official Playwright image (e.g., `mcr.microsoft.com/playwright:v1.59.1-jammy`) or install the necessary OS packages manually.

### Memory & Timeout Footprint
*   **Memory:** Extremely High. Launching a full Chromium browser instance per request can consume 150MB - 300MB of RAM each.
*   **Execution Time:** Slow. The sequence of launching a browser, awaiting network idle, capturing screenshots, and waiting for the Gemini API to stream a response can easily exceed 10-15 seconds per request.

### Platform Compatibility Check
*   **Serverless (Vercel / Netlify / AWS Lambda):** **Incompatible.** The Playwright binary exceeds standard serverless function size limits. Furthermore, execution times will easily breach 10-second timeout limits, and memory spikes will cause crashes.
*   **Free/Cheap PaaS (Render Free / Railway / Heroku Basic):** **High Risk.** These platforms typically provide 512MB RAM limits. Because the code launches a *new browser per request*, just 2-3 concurrent student submissions will trigger an Out-Of-Memory (OOM) server crash.
*   **Recommendation:** This architecture requires a **Dedicated VPS** (e.g., DigitalOcean Droplet, Hetzner) or a paid Docker container tier with at least **1GB-2GB of RAM**. 

---

## 4. Open Architecture Risks

### Race Conditions & Severe Performance Bottlenecks
*   **No Browser Pooling:** In `/server/index.js`, `chromium.launch()` is executed *inside* the route handler. 10 simultaneous student submissions will launch 10 separate Chromium instances simultaneously, instantly crashing the server. This must be refactored to use a browser pool (e.g., `puppeteer-cluster` or reusing a single browser context).
*   **Zombie Processes:** While there is a `finally { browser.close() }` block, unexpected Node process crashes or unhandled promise rejections inside the Playwright flow could leave headless Chromium instances running in the background indefinitely, creating memory leaks.

### Security Vulnerabilities
*   **Unsandboxed Code Execution (SSRF/XSS):** User-submitted HTML/JS is directly evaluated using `page.setContent()`. If a student writes malicious JS (e.g., `fetch('http://169.254.169.254')` to hit AWS metadata endpoints, or attempts to access local backend endpoints), it will execute from the server's IP address.
*   **Infinite Loop Hanging (DoS):** There is no explicit execution timeout on the Playwright `setContent` step. If a student writes a `while(true) {}` loop in their JS, Playwright will hang indefinitely, tying up server resources and causing a Denial of Service.

### Incomplete Features & Hardcoded Data
*   **No Persistence:** As noted, there is no database. "Completed" states on lessons are entirely mocked or stored locally.
*   **Hardcoded Prompts:** The AI evaluation prompt is rigidly hardcoded in `index.js`. Any adjustments to grading logic require a backend deployment.
