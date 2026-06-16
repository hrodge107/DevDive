# Violation: Error Handling & Resilience

## Files and Lines
- `server/modules/evaluation/evaluation.controller.js`: Lines 97-104

## Explanation
The rubric states that failures in external/headless services (like Gemini or Playwright) must not return unhandled 500 errors to the client without context. While the backend does catch the error and returns a 500 status with an error message, standard REST architecture for third-party upstream failures is better represented as a 502 (Bad Gateway) or 503 (Service Unavailable). Returning a generic 500 error blurs the line between internal server errors and upstream service failures.

## Proposed Changes
Update the catch block in `evaluation.controller.js` to classify the error properly. If the error originates from Playwright (timeout) or Gemini (parsing/API failure), the server should return a more descriptive status code (like 502 or 503) and a cleaner user-facing message, ensuring resilience.
