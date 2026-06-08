# DevDive: Frontend Architecture & Routing Specification

## 1. System Overview
DevDive is a local-first, self-paced web development learning platform. This document defines the strict architectural constraints for Phase 1: the frontend navigation shell and the injection of the beta IDE/evaluation pipeline. 

**Database and backend persistence layers are explicitly out of scope for this phase.**

## 2. Technology Stack
*   **Build Tool:** Vite
*   **Core Framework:** React 18+
*   **Routing:** React Router v6
*   **Styling:** Tailwind CSS (Strict token-based configuration)
*   **Editor Environment:** Monaco Editor (Pre-existing beta component)

## 3. Directory Structure
The `src/` directory must strictly adhere to the following separation of concerns:
*   `/pages` - Top-level route components (`LandingPage.jsx`, `CourseMap.jsx`).
*   `/components` - Reusable UI elements, strictly separated into presentational (dumb) and container (smart) components.
*   `/content` - Static JSON data contracts (e.g., `course_map.json`).
*   `/utils` - Helper functions, local storage wrappers, and formatting logic.
*   `/styles` - Theme constants and extracted Figma tokens.

## 4. Routing Strategy
The application utilizes `BrowserRouter` with three primary routes. Avoid nested routing complexities in this phase.

| Route Path | Component | Purpose |
| :--- | :--- | :--- |
| `/` | `LandingPage` | Project introduction and entry point. |
| `/course-map` | `CourseMap` | Dynamic timeline rendering of the curriculum. |
| `/exercise/:exercise_ref`| `ExerciseContainer` | The injected beta IDE and submission pipeline. |

## 5. Data Contracts (The Source of Truth)
Do not hallucinate curriculum data. All course map rendering must strictly map over the `src/content/course_map.json` data contract. 
*   **Parsing Logic:** The `CourseMap` component must parse the JSON. 
*   **Rendering Logic:** Presentational components must render nodes conditionally based on the `type` key (`theory` vs. `exercise`).
*   **Navigation:** Nodes with `type: 'exercise'` must generate a `<Link>` pointing to the dynamic `/exercise/:exercise_ref` route.

## 6. State Management & Lifecycle Constraints
Because the application uses React Router to navigate between the `CourseMap` and the `ExerciseContainer`, components will unmount.

*   **Constraint:** Do NOT rely exclusively on local `useState` inside the Monaco editor wrappers to hold the user's HTML/CSS/JS strings. If the user clicks "Back to Course Map," that state will be destroyed.
*   **Implementation:** Implement a `localStorage` caching mechanism inside `ExerciseContainer`.
    *   **On Mount:** Read from `localStorage` using the `exercise_ref` as the key. If data exists, hydrate the Monaco instances. If null, load the default starter code.
    *   **On Change/Unmount:** Save the current editor strings to `localStorage` under the `exercise_ref` key (use a debounce to optimize performance).

## 7. Styling Strictness
All styling must be executed via Tailwind CSS utility classes. 
*   **Constraint:** Do not write custom CSS or inline styles. 
*   **Theming:** The `tailwind.config.js` file will be strictly overwritten by tokens extracted from the Figma Design System. Rely entirely on the configured theme variables for spacing, typography, and colors.