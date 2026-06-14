# Violation: State Management

## Files and Lines
- `src/features/course/pages/CourseMap.jsx`: Lines 50-83

## Explanation
The frontend component `CourseMap.jsx` directly merges the stateless curriculum data with the stateful `user_progress` ledger. The rubric dictates that frontend state must correctly merge these without local component state becoming the orchestrator of this complex join. Furthermore, `ExerciseContainer.jsx` uses `localStorage` for caching `initialData` without a proper invalidation strategy if the single source of truth from Supabase (the starter files) updates.

## Proposed Changes
1. Abstract the merging of curriculum data and user progress into a dedicated data-fetching hook or service layer, separating this concern from the presentation component.
2. For the local storage caching, implement a check to ensure `localStorage` caching does not conflict if the Supabase `starter_files` have changed (e.g., comparing a hash or version, or simply favoring Supabase on first load). (For now, we'll focus on abstracting the merging logic into `courseService.js`).
