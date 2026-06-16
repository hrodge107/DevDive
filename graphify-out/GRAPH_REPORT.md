# Graph Report - devdive  (2026-06-17)

## Corpus Check
- 60 files · ~31,759 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 355 nodes · 453 edges · 33 communities (30 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fcfd5804`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 15 edges
2. `Header()` - 9 edges
3. `supabase` - 9 edges
4. `Module: Application Entry & Routing` - 9 edges
5. `Module: Core UI Components` - 9 edges
6. `Module: Landing Feature` - 9 edges
7. `Module: Course Feature` - 9 edges
8. `Module: IDE Feature` - 9 edges
9. `Module: Frontend Utilities` - 9 edges
10. `Module: Server Entry` - 9 edges

## Surprising Connections (you probably didn't know these)
- `captureScreenshots()` --calls--> `normalizeCaptureScreens()`  [EXTRACTED]
  server/modules/browser/playwright.service.js → server/utils/helpers.js
- `Header()` --calls--> `useAuth()`  [EXTRACTED]
  src/core/components/Header.jsx → src/core/contexts/AuthContext.jsx
- `CourseMap()` --calls--> `useAuth()`  [EXTRACTED]
  src/features/course/pages/CourseMap.jsx → src/core/contexts/AuthContext.jsx
- `LessonPage()` --calls--> `useAuth()`  [EXTRACTED]
  src/features/course/pages/LessonPage.jsx → src/core/contexts/AuthContext.jsx
- `ProfilePage()` --calls--> `useAuth()`  [EXTRACTED]
  src/features/auth/pages/ProfilePage.jsx → src/core/contexts/AuthContext.jsx

## Import Cycles
- None detected.

## Communities (33 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (18): Footer(), Header(), QuizEngine(), Sidebar(), AuthProvider(), supabase, CourseMap(), ExercisePage() (+10 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (16): devDependencies, autoprefixer, concurrently, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (14): evaluateSubmission(), getGenAI(), BrowserQueue, captureScreenshots(), enqueueScreenshot(), checkEvaluation(), healthCheck(), checkLimiter (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (29): Code Example, Code Example, Code Example, Cross-References, Cross-References, Cross-References, Dependencies, Dependencies (+21 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (20): 1. Core Identity Architecture, 1. File Structure Restructured, 2. Stateless Content Maps, 2. The Progress Ledger (`public.user_progress`), 3. Security (RLS Policies), 3. Supabase Authentication, 4. Dynamic Curriculum, 5. Backend Ledger Automation (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (18): 1. Current Implementation Report, 2. Technical Documentation, 3. Hosting Feasibility & Resource Analysis, 4. Open Architecture Risks, API Route Map, Core Workflows, Database Schema, DevDive Technical Audit & Architecture Report (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (17): AddFileModal(), EXTENSION_MAP, CodeEditor(), DeleteFileModal(), ExerciseContainer(), DEFAULT_FILES, PlaygroundContainer(), ProblemSidebar() (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (26): dependencies, cors, dotenv, express, express-rate-limit, @google/generative-ai, lodash.debounce, @monaco-editor/react (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (3): CourseTimeline(), TimelineLesson(), TimelineUnit()

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (8): 1. System Overview, 2. Technology Stack, 3. Directory Structure, 4. Routing Strategy, 5. Data Contracts (The Source of Truth), 6. State Management & Lifecycle Constraints, 7. Styling Strictness, DevDive: Frontend Architecture & Routing Specification

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (9): Code Example, Cross-References, Dependencies, Known Limitations / Edge Cases, Location, Module: Application Entry & Routing, Public API / Exports, Purpose (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (9): Code Example, Cross-References, Dependencies, Known Limitations / Edge Cases, Location, Module: Course Feature, Public API / Exports, Purpose (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (9): Code Example, Cross-References, Dependencies, Known Limitations / Edge Cases, Location, Module: AI Evaluation Service, Public API / Exports, Purpose (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (9): Code Example, Cross-References, Dependencies, Known Limitations / Edge Cases, Location, Module: Browser Capture Service, Public API / Exports, Purpose (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (9): Code Example, Cross-References, Dependencies, Known Limitations / Edge Cases, Location, Module: Server Entry, Public API / Exports, Purpose (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (9): Code Example, Cross-References, Dependencies, Known Limitations / Edge Cases, Location, Module: Evaluation API, Public API / Exports, Purpose (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (9): Code Example, Cross-References, Dependencies, Known Limitations / Edge Cases, Location, Module: IDE Feature, Public API / Exports, Purpose (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (9): Code Example, Cross-References, Dependencies, Known Limitations / Edge Cases, Location, Module: Core UI Components, Public API / Exports, Purpose (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (9): Code Example, Cross-References, Dependencies, Known Limitations / Edge Cases, Location, Module: Data Layer, Public API / Exports, Purpose (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (6): 1. Identity Layer, 2. Content Layer (The Curriculum), 3. The State Layer (The Ledger), 4. Frontend Integration Rules, DevDive: Supabase Architecture & Data Flow, Overview

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (6): Backend Changes, Frontend Changes, Step 1: Schema SQL, Step 2: Seeding SQL (Data Extraction), Step 3: Codebase Integration Plan, Supabase Curriculum Migration Plan & SQL Scripts

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (8): Architecture Standards, Behavior, Log Footer, Logging Protocol, Principles, Role, Tool Priority, Violation Schema

### Community 29 - "Community 29"
Cohesion: 0.40
Nodes (4): Explanation, Files and Lines, Proposed Changes, Violation: Error Handling & Resilience

### Community 30 - "Community 30"
Cohesion: 0.40
Nodes (4): Explanation, Files and Lines, Proposed Changes, Violation: Security & Data Privacy

### Community 31 - "Community 31"
Cohesion: 0.40
Nodes (4): Explanation, Files and Lines, Proposed Changes, Violation: Separation of Concerns (SoC) & Coupling

### Community 32 - "Community 32"
Cohesion: 0.40
Nodes (4): Explanation, Files and Lines, Proposed Changes, Violation: State Management

## Knowledge Gaps
- **206 isolated node(s):** `supabase`, `name`, `private`, `version`, `type` (+201 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Module: Application Entry & Routing` connect `Community 10` to `Community 3`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Module: Core UI Components` connect `Community 17` to `Community 3`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `supabase`, `name`, `private` to the rest of the system?**
  _206 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1411764705882353 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14492753623188406 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._