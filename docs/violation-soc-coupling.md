# Violation: Separation of Concerns (SoC) & Coupling

## Files and Lines
- `src/features/ide/components/ExerciseContainer.jsx`: Lines 68-115, 198-208
- `src/features/course/pages/LessonPage.jsx`: Lines 41-65, 86-127
- `src/features/course/pages/CourseMap.jsx`: Lines 19-48

## Explanation
Frontend UI components contain heavy data-fetching logic and direct database queries using the `supabase` client. This tightly couples the UI rendering layer with the data access layer. According to the rubric, frontend UI components must not contain raw data-fetching implementation details; these should be abstracted into hooks or service layers.

## Proposed Changes
1. Abstract all direct `supabase` calls into a dedicated service layer (e.g., `src/services/courseService.js` and `src/services/progressService.js`).
2. Update `CourseMap.jsx`, `LessonPage.jsx`, and `ExerciseContainer.jsx` to use these service functions instead of querying Supabase directly.
3. Move the `/api/check` fetch call in `ExerciseContainer.jsx` into an `evaluationService.js`.
