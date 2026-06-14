# Violation: Security & Data Privacy

## Files and Lines
- `src/features/course/pages/LessonPage.jsx`: Lines 223-243
- `src/features/ide/components/ExerciseContainer.jsx`: Lines 249-250
- `server/modules/evaluation/evaluation.controller.js`: Lines 44-46, 88-95

## Explanation
1. `rehypeRaw` is used with `ReactMarkdown` in `LessonPage.jsx` without sanitization. This allows raw HTML from the database to be rendered directly, which acts similarly to `dangerouslySetInnerHTML` and opens the application to XSS attacks if the markdown content is compromised.
2. In `ExerciseContainer.jsx`, the frontend logic attempts to calculate evaluation scores using `exerciseConfig?.aiRubric?.codeRequirements?.length`. Although `ai_rubric` is correctly secured and excluded from the payload, relying on it in the frontend is an architectural violation. The frontend is assuming access to sensitive grading logic (the rubric), resulting in bugs (scores displaying as 0).

## Proposed Changes
1. Install and add `rehype-sanitize` to `LessonPage.jsx` to ensure any raw HTML from the curriculum database is properly sanitized before rendering.
2. Update the backend `evaluation.controller.js` to return `codePointsPerReq` and `visualPointsPerReq` along with the calculated scores.
3. Update `ExerciseContainer.jsx` to remove any reliance on `aiRubric` for score calculation and use the backend response directly.
