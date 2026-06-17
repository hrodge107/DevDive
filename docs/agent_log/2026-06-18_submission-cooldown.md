### [VIOLATION-001] Timer Logic Coupled to UI Container
- **Principle:** SRP
- **Location:** `src/features/ide/components/ExerciseContainer.jsx` (cooldown timer useEffect)
- **Severity:** Medium
- **Problem:** Embedding `setInterval` and `cooldownRemaining` state directly inside a massive container component mixes orchestration with low-level timer logic, reducing testability and increasing component bloat.
- **Fix:** Extract to a reusable custom hook `useCooldown()` that handles the interval and returns `[cooldownRemaining, startCooldown]`.

**Summary:** The post-edit architectural health remains functional, but extracting custom hooks for timer and local storage logic would greatly improve maintainability.
