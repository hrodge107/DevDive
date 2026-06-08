## Project Overview
- **What the project does**: DevDive is a local-first, self-paced web development learning platform. It allows users to browse a curriculum, read lessons, and write HTML/CSS/JS in a built-in browser IDE. It uses a Node/Express backend equipped with Playwright and Google Gemini to provide real-time, AI-driven visual and code-level feedback.
- **High-level architecture**: The system follows a layered client-server architecture. The frontend is a React SPA (built with Vite) organized by features (Landing, Course, IDE). It manages state in the browser (using `localStorage` to cache exercise drafts). The backend is an Express server exposing a stateless REST API for evaluation. The evaluation pipeline queues Playwright for headless browser screenshotting and then calls the Gemini API to compare the submission against a strict rubric.
- **How the modules relate to each other**: `src/main.jsx` and `src/App.jsx` bootstrap the frontend routing. The `Course` feature consumes static data from `src/data/course_map.json`. When a user opens an exercise, the `IDE` feature loads the Monaco editor and preview utilities from `src/utils/htmlUtils.js`. Upon submission, it calls the backend `Evaluation API`. The backend delegates work to the `Browser` module for visual rendering and the `AI` module for rubric-based grading.
- **Setup and entry point**: The frontend entry point is `src/main.jsx` and the backend entry point is `server/index.js`. The project runs concurrently via the `npm run dev` script.

---

## Module: Application Entry & Routing

### Purpose
Responsible for bootstrapping the React application, applying global styles, and defining the top-level client-side routing.

### Location
- `src/main.jsx`
- `src/App.jsx`
- `src/index.css`
- `src/App.css`

### Public API / Exports
| Name | Parameters and types | Return type | Description |
| :--- | :--- | :--- | :--- |
| `App` | `void` | `JSX.Element` | The root component defining all `BrowserRouter` routes. |

### Technical Deep Dive
`main.jsx` strictly mounts the app into the DOM using React 18's `createRoot`. `App.jsx` maps URL paths to specific page components (e.g., `LandingPage`, `CourseMap`, `LessonPage`, `ExercisePage`). No complex nested routing is used in this phase to keep navigation simple.

### Code Example
```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mounts the app to the root DOM node
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### Dependencies
- Internal: LandingPage, CourseMap, LessonPage, ExercisePage
- External: `react`, `react-dom`, `react-router-dom`

### Known Limitations / Edge Cases
Routes are hardcoded and not dynamically generated from the `course_map.json`, meaning any new feature pages require manual addition to `App.jsx`.

### Cross-References
- Course Feature
- IDE Feature
- Landing Feature

---

## Module: Core UI Components

### Purpose
Provides foundational, reusable UI elements that wrap the main layout, such as the site header and footer.

### Location
- `src/core/components/Header.jsx`
- `src/core/components/Footer.jsx`

### Public API / Exports
| Name | Parameters and types | Return type | Description |
| :--- | :--- | :--- | :--- |
| `Header` | `void` | `JSX.Element` | The top navigation bar of the application. |
| `Footer` | `void` | `JSX.Element` | The bottom footer with copyright and generic links. |

### Technical Deep Dive
These are stateless, presentational ("dumb") components. They utilize Tailwind CSS for styling and `react-router-dom`'s `<Link>` for client-side navigation. `Header.jsx` checks the `useLocation()` hook to determine the active path and apply a visual underline indicator to the current route.

### Code Example
```jsx
// src/core/components/Header.jsx
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header>
      <Link to="/course-map" className={currentPath === '/course-map' ? 'text-white' : ''}>
        Curriculum
      </Link>
    </header>
  );
}
```

### Dependencies
- Internal: None
- External: `react-router-dom`

### Known Limitations / Edge Cases
The header currently has a hardcoded, commented-out "Moon" button (dark mode toggle) since the application enforces a dark theme by default.

### Cross-References
- Application Entry & Routing

---

## Module: Landing Feature

### Purpose
Presents the landing/home page to introduce the user to DevDive, explain how it works, and provide calls to action to start learning.

### Location
- `src/features/landing/pages/LandingPage.jsx`

### Public API / Exports
| Name | Parameters and types | Return type | Description |
| :--- | :--- | :--- | :--- |
| `LandingPage` | `void` | `JSX.Element` | The main hero and feature explanation page. |

### Technical Deep Dive
A purely presentational page leveraging complex Tailwind classes to create layered background glow effects, gradients, and custom SVGs. It visually explains the 3-step learning process: Read Lesson, Write Code, Get Feedback.

### Code Example
```jsx
// src/features/landing/pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import Header from '../../../core/components/Header';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Call to action navigating to the curriculum */}
        <Link to="/course-map">Start Learning for Free</Link>
      </main>
    </div>
  );
}
```

### Dependencies
- Internal: `Header`, `Footer`, `whaleshark.png`
- External: `react-router-dom`

### Known Limitations / Edge Cases
None. It is a static promotional page.

### Cross-References
- Core UI Components

---

## Module: Course Feature

### Purpose
Renders the interactive curriculum timeline and the theoretical lesson reading pages.

### Location
- `src/features/course/pages/CourseMap.jsx`
- `src/features/course/pages/LessonPage.jsx`
- `src/features/course/components/CourseTimeline.jsx`
- `src/features/course/components/TimelineUnit.jsx`
- `src/features/course/components/TimelineLesson.jsx`

### Public API / Exports
| Name | Parameters and types | Return type | Description |
| :--- | :--- | :--- | :--- |
| `CourseMap` | `void` | `JSX.Element` | Page displaying the full curriculum timeline. |
| `LessonPage` | `void` | `JSX.Element` | Page displaying a specific theory lesson's content. |
| `CourseTimeline` | `{ curriculum: Array }` | `JSX.Element` | Container for rendering units. |
| `TimelineUnit` | `{ unit: Object, index: number }` | `JSX.Element` | A collapsible unit containing lessons. |
| `TimelineLesson`| `{ lesson: Object, index: number, isLast: boolean }`| `JSX.Element` | A single lesson item link in the timeline. |

### Technical Deep Dive
The `CourseMap` currently loads data synchronously from a local JSON file (`course_map.json`). It passes this data down to `CourseTimeline`, which maps over the units to create collapsible `TimelineUnit` accordions. `TimelineLesson` parses the lesson's `type` (`theory` vs `exercise`) to determine whether its `<Link>` should route to `/lesson/:id` or `/exercise/:id`.

`LessonPage` asynchronously fetches the specific lesson's JSON content from the `public/lessons/` directory. It uses `dangerouslySetInnerHTML` to render the HTML content and provides a built-in multiple-choice Knowledge Check at the end. It dynamically calculates "Next/Previous" paths by flattening the entire curriculum array.

### Code Example
```jsx
// src/features/course/pages/CourseMap.jsx
import { useEffect, useState } from 'react';
import courseMapData from '../../../data/course_map.json';
import CourseTimeline from '../components/CourseTimeline';

export default function CourseMap() {
  const [curriculum, setCurriculum] = useState([]);

  useEffect(() => {
    // Simulates an API fetch by loading local data
    setCurriculum(courseMapData.curriculum);
  }, []);

  return <CourseTimeline curriculum={curriculum} />;
}
```

### Dependencies
- Internal: `course_map.json`, Core UI Components
- External: `react`, `react-router-dom`

### Known Limitations / Edge Cases
`LessonPage` utilizes `dangerouslySetInnerHTML` which poses a security risk (XSS) if lesson content is ever user-generated or compromised.

### Cross-References
- Data Layer

---

## Module: IDE Feature

### Purpose
The core learning environment where users write code to solve exercises, preview their results, and submit it for AI evaluation.

### Location
- `src/features/ide/pages/ExercisePage.jsx`
- `src/features/ide/components/ExerciseContainer.jsx`
- `src/features/ide/components/CodeEditor.jsx`
- `src/features/ide/components/ProblemSidebar.jsx`
- `src/features/ide/components/ResultsSidebar.jsx`
- `src/features/ide/components/AddFileModal.jsx`
- `src/features/ide/components/DeleteFileModal.jsx`

### Public API / Exports
| Name | Parameters and types | Return type | Description |
| :--- | :--- | :--- | :--- |
| `ExercisePage` | `void` | `JSX.Element` | Page wrapper for the IDE. |
| `ExerciseContainer`| `void` | `JSX.Element` | Main stateful controller for the IDE environment. |
| `CodeEditor` | `Object props` | `JSX.Element` | The Monaco editor wrapper with file tabs. |
| `ProblemSidebar` | `Object props` | `JSX.Element` | Resizable sidebar displaying the problem description. |
| `ResultsSidebar` | `Object props` | `JSX.Element` | Sliding panel displaying evaluation feedback. |

### Technical Deep Dive
`ExerciseContainer` is a massive "smart" container component managing the complex state of the IDE. It handles:
- Fetching exercise configurations (instructions, AI rubrics) from `public/exercises/`.
- Hydrating and debouncing code saves to `localStorage` to prevent data loss on navigation.
- Multi-file management (HTML/CSS/JS) and injecting CSS styles into the HTML preview via `htmlUtils.js`.
- Calling the backend `/api/check` endpoint and toggling the `ResultsSidebar` to display the breakdown of the AI's feedback.

The actual code editing is delegated to `@monaco-editor/react` inside `CodeEditor.jsx`.

### Code Example
```jsx
// src/features/ide/components/ExerciseContainer.jsx
import debounce from 'lodash.debounce';

// Debounced save to prevent excessive localStorage writes on every keystroke
const debouncedSaveToLocalStorage = useMemo(
  () => debounce((currentFiles, currentId) => {
    localStorage.setItem(`devdive_saved_code_${currentId}`, JSON.stringify(currentFiles));
  }, 1000),
  []
);

const handleEditorChange = (value) => {
  const updatedFiles = files.map(file => 
    file.name === activeFileName ? { ...file, content: value } : file
  );
  setFiles(updatedFiles);
  debouncedSaveToLocalStorage(updatedFiles, exerciseId);
};
```

### Dependencies
- Internal: `htmlUtils.js`, Core UI Components
- External: `react`, `react-router-dom`, `@monaco-editor/react`, `lodash.debounce`

### Known Limitations / Edge Cases
The code evaluates the `index.html` file explicitly. If the user deletes or renames `index.html`, the preview and evaluation systems may fail.

### Cross-References
- Frontend Utilities
- Evaluation API

---

## Module: Frontend Utilities

### Purpose
Helper functions for manipulating raw HTML and CSS strings in the browser for live previewing.

### Location
- `src/utils/htmlUtils.js`

### Public API / Exports
| Name | Parameters and types | Return type | Description |
| :--- | :--- | :--- | :--- |
| `injectCSS` | `(htmlContent: string, files: Array)` | `string` | Replaces `<link>` tags with inline `<style>` tags. |
| `buildPreviewHtml`| `(files: Array)` | `string` | Assembles a master HTML document for iframe/window preview. |

### Technical Deep Dive
Because the editor writes raw strings, standard CSS `<link>` tags pointing to relative files won't resolve correctly in an injected Blob preview. `injectCSS` uses RegEx to find `<link>` tags, extracts the filename, finds the corresponding CSS file in the memory array, and injects the raw CSS into a `<style>` block directly into the `<head>`. `buildPreviewHtml` constructs a full `<!DOCTYPE html>` wrapper and attaches internal JavaScript event listeners to intercept anchor (`<a>`) clicks for rudimentary multi-page mock routing.

### Code Example
```javascript
// src/utils/htmlUtils.js
export const injectCSS = (htmlContent, files) => {
  const linkRegex = /<link[^>]*href="([^"]+)"[^>]*rel="stylesheet"[^>]*>/gi;
  let match;
  
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    const cssFileName = match[1];
    // Find the file in memory and inject it as a style tag
    // ...
  }
  return injectedHtml;
};
```

### Dependencies
- Internal: None
- External: None

### Known Limitations / Edge Cases
The RegEx parsing for `<link>` tags is rudimentary and might fail if the HTML attributes are structured unconventionally or contain unexpected line breaks.

### Cross-References
- IDE Feature

---

## Module: Server Entry

### Purpose
Bootstraps the Express backend application and mounts the API routes.

### Location
- `server/index.js`

### Public API / Exports
This module does not export anything; it initiates the listening server.

### Technical Deep Dive
Standard Express setup loading environment variables via `dotenv`. It configures global middleware: `cors` for cross-origin requests, and `express.json` / `express.urlencoded` with an increased payload limit (`10mb`) to handle large Base64 screenshot payloads. It mounts the evaluation routes under `/api`.

### Code Example
```javascript
// server/index.js
import express from 'express';
import evaluationRoutes from './modules/evaluation/evaluation.routes.js';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use('/api', evaluationRoutes);

app.listen(5000, () => console.log('Server active'));
```

### Dependencies
- Internal: Evaluation API
- External: `express`, `dotenv`, `cors`

### Known Limitations / Edge Cases
The server currently runs globally without strict environment-based configuration for ports, meaning it relies heavily on the local environment variables.

### Cross-References
- Evaluation API

---

## Module: Server Utilities

### Purpose
Helper functions for assembling the raw code into a single document on the backend before screenshotting.

### Location
- `server/utils/helpers.js`

### Public API / Exports
| Name | Parameters and types | Return type | Description |
| :--- | :--- | :--- | :--- |
| `assembleDocument`| `(html: string, css: string, js: string)` | `string` | Merges HTML, CSS, and JS strings. |
| `normalizeCaptureScreens`| `(requested: Array)` | `Array` | Sanitizes viewport array. |

### Technical Deep Dive
`assembleDocument` simply concatenates raw HTML, CSS, and JS into a clean `<!DOCTYPE html>` template so that Playwright can load it directly via `setContent()` without needing to write physical files to the disk.

### Code Example
```javascript
// server/utils/helpers.js
export function assembleDocument(html, css, js) {
  return `
    <!DOCTYPE html>
    <html>
      <head><style>${css || ''}</style></head>
      <body>${html || ''}<script>${js || ''}</script></body>
    </html>
  `;
}
```

### Dependencies
- Internal: None
- External: None

### Known Limitations / Edge Cases
Does not support advanced multi-file resolution on the backend. Only accepts a single flattened string per language.

### Cross-References
- Evaluation API

---

## Module: AI Evaluation Service

### Purpose
Interacts with Google's Gemini API to evaluate user code and screenshots against a predefined rubric.

### Location
- `server/modules/ai/gemini.service.js`

### Public API / Exports
| Name | Parameters and types | Return type | Description |
| :--- | :--- | :--- | :--- |
| `evaluateSubmission` | `(html, css, js, rubric, screenshots)` | `Object` | The parsed JSON evaluation response from Gemini. |

### Technical Deep Dive
Initializes the `@google/generative-ai` client lazily. It constructs a highly specific, few-shot prompt appending the user's raw code strings and the desired AI rubric criteria. It attaches the Base64 screenshots (desktop/mobile) as inline data so the vision model can analyze the visual output. It mandates the model to return strict JSON using `responseMimeType: "application/json"`.

### Code Example
```javascript
// server/modules/ai/gemini.service.js
const model = getGenAI().getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: "application/json" }
});

const requestParts = [{ text: prompt }];
if (screenshots.desktop) {
  requestParts.push({ inlineData: { mimeType: 'image/png', data: screenshots.desktop } });
}

const result = await model.generateContent(requestParts);
return JSON.parse(result.response.text());
```

### Dependencies
- Internal: None
- External: `@google/generative-ai`

### Known Limitations / Edge Cases
AI models are prone to hallucination. To mitigate this, a Regex fallback is used to parse JSON wrapped in markdown backticks, which Gemini sometimes outputs despite the strict MIME type configuration.

### Cross-References
- Evaluation API

---

## Module: Browser Capture Service

### Purpose
Manages headless Chromium instances via Playwright to securely capture visual screenshots of user code.

### Location
- `server/modules/browser/playwright.service.js`

### Public API / Exports
| Name | Parameters and types | Return type | Description |
| :--- | :--- | :--- | :--- |
| `enqueueScreenshot`| `(htmlContent: string, captureScreens: Array)`| `Promise<Object>` | Enqueues and resolves with Base64 screenshots. |

### Technical Deep Dive
Because launching Playwright browsers is incredibly RAM-heavy, this module implements a custom `BrowserQueue` class. It restricts concurrency to exactly 2 active tasks. When a task runs, it launches a new Chromium context with strict safety flags (`offline: true`, `--no-sandbox`). It uses `page.setContent()` to load the code, sets the viewport size, and returns the generated Base64 PNG buffer.

### Code Example
```javascript
// server/modules/browser/playwright.service.js
// Set up isolated context restricting external network access
context = await browser.newContext({ offline: true });
const page = await context.newPage();

// Strict timeout prevents infinite loops (e.g. while(true))
await page.setContent(htmlContent, { waitUntil: 'load', timeout: 5000 });

await page.setViewportSize({ width: 800, height: 500 });
const desktopBuffer = await page.screenshot({ type: 'png' });
```

### Dependencies
- Internal: Server Utilities
- External: `playwright`

### Known Limitations / Edge Cases
If the user's code contains an infinite loop, Playwright will hang. The strict 5000ms timeout prevents server crashes, but results in a failed screenshot.

### Cross-References
- Evaluation API

---

## Module: Evaluation API

### Purpose
The primary backend controller handling the `/api/check` request pipeline.

### Location
- `server/modules/evaluation/evaluation.controller.js`
- `server/modules/evaluation/evaluation.routes.js`

### Public API / Exports
| Name | Parameters and types | Return type | Description |
| :--- | :--- | :--- | :--- |
| `checkEvaluation`| `(req, res)` | `void` | Express handler for processing code evaluation. |
| `healthCheck` | `(req, res)` | `void` | Express handler verifying server status. |

### Technical Deep Dive
`evaluation.routes.js` defines the endpoints and applies `express-rate-limit` (20 reqs/15m) to prevent abuse of the expensive AI/Browser pipeline. `checkEvaluation` acts as the orchestrator:
1. Validates the payload.
2. Calls `assembleDocument` and `enqueueScreenshot`.
3. Calls `evaluateSubmission` passing the code and screenshots.
4. Calculates a weighted score based on code (50%) and visual (50%) completion.
5. Derives an `overallHint` string to guide the user.

### Code Example
```javascript
// server/modules/evaluation/evaluation.controller.js
export const checkEvaluation = async (req, res) => {
  const assembledDoc = assembleDocument(html, css, js);
  const screenshots = await enqueueScreenshot(assembledDoc, screensToCapture);
  const evaluation = await evaluateSubmission(html, css, js, rubric, screenshots);
  
  // Scoring logic and JSON response omitted for brevity...
  res.json({ score: totalScore, /* ... */ });
};
```

### Dependencies
- Internal: Server Utilities, Browser Capture Service, AI Evaluation Service
- External: `express`, `express-rate-limit`

### Known Limitations / Edge Cases
If any stage of the pipeline fails (e.g., Playwright timeout, Gemini API failure), the entire request crashes and sends a generic 500 response to the client.

### Cross-References
- Browser Capture Service
- AI Evaluation Service

---

## Module: Data Layer

### Purpose
Static JSON files serving as the central source of truth for the curriculum map and lesson content.

### Location
- `src/data/course_map.json`

### Public API / Exports
This is a standard JSON file and does not export programmatic API interfaces.

### Technical Deep Dive
`course_map.json` outlines an array of `curriculum` units. Each unit holds an array of `lessons`. The `status` key defines if the lesson is `locked`, `in_progress`, or `completed`. The `type` key (`theory` vs `exercise`) is critical because it dictates how the frontend parses the object and where it routes the user.

### Code Example
```json
// src/data/course_map.json
{
  "curriculum": [
    {
      "unit_id": "u1",
      "lessons": [
        {
          "lesson_id": "u1_e1",
          "title": "Hello World in Blue Boxes",
          "type": "exercise",
          "status": "locked",
          "exercise_ref": "u1_e1"
        }
      ]
    }
  ]
}
```

### Dependencies
- Internal: None
- External: None

### Known Limitations / Edge Cases
There is no database attached in this phase. The application must treat this JSON file as the absolute, read-only contract.

### Cross-References
- Course Feature

---

## Glossary
- **Local-first**: Data state (like the IDE code) is stored exclusively in the browser's `localStorage` rather than a remote database.
- **Rubric**: A predefined JSON array of specific instructions that the AI evaluator looks for when analyzing student code.
- **Playwright**: A library used by the backend to launch an invisible ("headless") Chromium browser, load user code, and capture screenshots for visual evaluation.
- **SPA (Single Page Application)**: The React frontend architecture where navigation occurs without reloading the page.
- **Hydration**: The process of reading the user's cached code from `localStorage` and injecting it into the Monaco Editor immediately when the component mounts.
