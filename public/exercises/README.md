# Exercise System Documentation

## How It Works

The DevDive IDE now uses a JSON-driven exercise system. Exercise content is completely separated from the React component, making it easy to create and manage multiple exercises.

## Adding a New Exercise

### Step 1: Create a new JSON file
Create a file in public/exercises/ named your-exercise-id.json

### Step 2: Use this template

\\\json
{
  "id": "unique-exercise-id",
  "title": "Exercise Title",
  "description": "Short description of what students will learn",
  "category": "HTML / CSS or JS / HTML or any category",
  "goal": "Detailed goal/outcome description",
  "instructions": [
    "First instruction step",
    "Second instruction step",
    "Third instruction step with <strong>HTML</strong> tags allowed",
    "You can use basic HTML in instructions"
  ],
  "captureScreens": [
    "desktop",
    "mobile"
  ],
  "initialFiles": [
    {
      "name": "index.html",
      "language": "html",
      "content": "Your starting HTML code here"
    },
    {
      "name": "styles.css",
      "language": "css",
      "content": "Your starting CSS code here"
    }
  ]
}
\\\

### Step 3: Load the exercise

Access it via URL parameter:
- Default: http://localhost:5174 (loads hello-world-blue-boxes)
- Custom: http://localhost:5174?exercise=your-exercise-id

## Exercise JSON Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (matches filename without .json) |
| title | string | Yes | Exercise title shown in the IDE |
| description | string | Yes | Overview of what students learn |
| category | string | Yes | Topic (e.g., 'HTML / CSS', 'JavaScript', etc.) |
| goal | string | Yes | Detailed outcome description |
| instructions | array | Yes | Array of instruction strings (supports HTML) |
| captureScreens | array | No | Screenshots to capture: "desktop", "mobile", or both (default is desktop) |
| initialFiles | array | Yes | Initial file set for the exercise |
| initialFiles[].name | string | Yes | Filename (e.g., 'index.html') |
| initialFiles[].language | string | Yes | Language ('html', 'css', 'javascript') |
| initialFiles[].content | string | Yes | Initial file content |

## Supported Languages

- html
- css
- javascript

## Features

- Exercises load automatically from /public/exercises/ directory
- Instructions support HTML tags (e.g., <strong>, <code>, etc.)
- Students always start with a clean slate (files reset on page refresh)
- Easy to add, update, or remove exercises without code changes
- Future-proof: Ready for backend database integration

## Future Enhancements (Phase 3+)

- Load exercises from backend API (GET /api/exercises/:id)
- Store user progress in Supabase
- Add exercise metadata (difficulty, estimated time, etc.)
- Support for multi-step exercises with checkpoints
