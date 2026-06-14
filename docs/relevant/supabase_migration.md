# Supabase Curriculum Migration Plan & SQL Scripts

## Step 1: Schema SQL

```sql
-- Create the parent units table
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  unit_number INT NOT NULL UNIQUE,
  title TEXT NOT NULL
);

-- Create the lessons table (1-to-Many with units)
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  unit_id INT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  lesson_number INT NOT NULL,
  title TEXT NOT NULL,
  markdown_body TEXT,
  UNIQUE(unit_id, lesson_number)
);

-- Create the quizzes table (1-to-1 with lessons)
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  lesson_id INT NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
  questions JSONB NOT NULL
);

-- Create the exercises table (1-to-1 with lessons)
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  lesson_id INT NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
  task_description TEXT NOT NULL,
  starter_files JSONB NOT NULL,
  ai_rubric JSONB NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies allowing any authenticated user to SELECT (read) content
CREATE POLICY "Allow authenticated read on units" ON units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on lessons" ON lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on quizzes" ON quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on exercises" ON exercises FOR SELECT TO authenticated USING (true);
```

## Step 2: Seeding SQL (Data Extraction)

*Note: IDs are hardcoded in the INSERTs to ensure foreign key relations line up perfectly based on the local file extraction.*

```sql
-- 1. Insert Units
INSERT INTO units (id, unit_number, title) VALUES 
(1, 1, 'HTML and CSS'),
(2, 2, 'CSS Styling');

-- 2. Insert Lessons
INSERT INTO lessons (id, unit_id, lesson_number, title, markdown_body) VALUES
(1, 1, 1, 'Document Structure', 'Every robust architectural marvel begins with a solid foundation. In the realm of web development, this foundation is the HTML document structure. It provides the essential scaffolding upon which all content, styling, and interactivity are built. Understanding the specific roles of the boilerplate tags—the declaration of intent, the metadata housing, and the visible canvas—is paramount to crafting resilient and semantic web environments.

### The Semantic Scaffolding
```html
<!DOCTYPE html>    // <-- The blueprint declaration
<html lang="en">  // <-- The master container
  <head>    // <-- The invisible metadata registry
    <meta charset="UTF-8">
    <title>Structural Integrity</title>
  </head>
  <body>    // <-- The visible canvas
    <h1>This is the header, a bigger text</h1>
    <p>This is a paragraph</p>
  </body>
</html>
```'),
-- Treating "Hello World in Blue Boxes" as a lesson record with an attached exercise
(2, 1, 2, 'Hello World in Blue Boxes', NULL), 
(3, 2, 1, 'CSS Fundamentals', 'Cascading Style Sheets (CSS) is the language used to style an HTML document. CSS describes how HTML elements should be displayed. In this lesson, we will cover the basics of selectors, properties, and values, enabling you to bring color, layout, and typography to your web pages.

### Basic CSS Ruleset
```css
body {
  background-color: #0B1326;
  color: #E2E8F0;
  font-family: ''Inter'', sans-serif;
}

h1 {
  color: #22D3EE;
  text-align: center;
}
```');

-- Reset sequences since we manually specified IDs
SELECT setval('units_id_seq', 2);
SELECT setval('lessons_id_seq', 3);

-- 3. Insert Quizzes
INSERT INTO quizzes (id, lesson_id, questions) VALUES
(1, 1, '[{"options": ["<html>", "<head>", "<body>", "<main>"], "question": "Which core tag is exclusively responsible for containing all visible content rendered by the browser?", "correct_answer_index": 2}]'::jsonb),
(2, 3, '[{"options": ["The Property", "The Selector", "The Value", "The Declaration"], "question": "Which part of a CSS rule targets the HTML element you want to style?", "correct_answer_index": 1}]'::jsonb);

SELECT setval('quizzes_id_seq', 2);

-- 4. Insert Exercises
INSERT INTO exercises (id, lesson_id, task_description, starter_files, ai_rubric) VALUES
(1, 2, 'In this exercise, you''ll learn how to target HTML elements using CSS to give them basic layout properties and color.

**Goal**: We have three `<div>` elements with the class `.box`. Your task is to make them look like distinct, blue rectangular cards.

**Instructions**:
1. Open index.html and add a **&lt;link&gt;** tag to link styles.css in the &lt;head&gt; section.
2. Use an external stylesheet for design
3. Set **background-color** to **cyan**.',
'[{"name": "index.html", "content": "<!DOCTYPE html>\n<html>\n  <head>\n    <!-- Link your stylesheet here -->\n  </head>\n  <body>\n    <div class=\"box\">Box 1</div>\n    <div class=\"box\">Box 2</div>\n    <div class=\"box\">Box 3</div>\n  </body>\n</html>", "language": "html"}]'::jsonb,
'{"codeRequirements": ["The .box CSS class selector is properly defined", "The background-color property is set to cyan or similar blue color"], "visualRequirements": ["All three boxes are visible and rendered on the page", "All boxes have a cyan/blue background color", "Each box are centered on the contnent"]}'::jsonb);

SELECT setval('exercises_id_seq', 1);
```

## Step 3: Codebase Integration Plan

### Frontend Changes

**1. `CourseMap.jsx`**
*   **Remove local fetch:** Remove the current `fetch('"/curriculum/course_map.json"')` logic entirely.
*   **Supabase Relational Query:** Use Supabase to fetch the whole tree in a single network request.
    ```javascript
    const { data: curriculum, error } = await supabase
      .from('units')
      .select(`
        id, unit_number, title,
        lessons (
          id, lesson_number, title,
          quizzes (id),
          exercises (id)
        )
      `)
      .order('unit_number', { ascending: true })
      .order('lesson_number', { referencedTable: 'lessons', ascending: true });
    ```
*   **Update UI Parsing:** 
    *   Change the data mapping loops to match the new nested output format.
    *   Currently, the component checks `completedLessons.has(lesson.lesson_id)`. Update the logic to rely on numeric integer IDs matching `lesson.id` and `exercise.id` from Supabase results.

**2. `LessonPage.jsx`**
*   **Remove static fetching:** Remove `fetch('/curriculum/${unitPart}/${lessonPart}/lesson.json')`.
*   **Fetch Single Lesson from Supabase:**
    ```javascript
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        *,
        units (title),
        quizzes (*)
      `)
      .eq('id', parseInt(lessonId)) // Assuming route now passes numeric ID
      .single();
    ```
*   **Update Navigation Logic:** Instead of calculating `prevPath` and `nextPath` by flattening an array from `course_map.json`, you can either query for the `next` lesson using `lesson_number`, or pass the flattened state down from the `CourseMap` context.
*   **Handle Null Markdown:** Since some lessons (like pure exercises) have `markdown_body: NULL`, wrap the markdown viewer in a conditional check (e.g., `if (lesson.markdown_body)`) before rendering it to prevent undefined crashes.

### Backend Changes

**Express / Gemini Evaluation Pipeline**
*   **Remove Local Read:** The backend currently reads `exercise.json` to get the `aiRubric` and `initialFiles` when evaluating a user's submitted code. 
*   **Fetch from Supabase DB:** Your Node server needs to fetch the `ai_rubric` from Supabase using `@supabase/supabase-js`.
    ```javascript
    // Inside evaluation route handler
    const { data: exercise, error } = await supabase
      .from('exercises')
      .select('ai_rubric')
      .eq('id', req.body.exerciseId)
      .single();
      
    // Pass exercise.ai_rubric to Gemini prompt
    ```
*   **Security Strict Boundary:** Initialize your Express backend Supabase client using the `SERVICE_ROLE_KEY`. This bypasses RLS entirely, allowing your Node server to safely read the private rubric and feed it to Gemini without exposing it to the client loop. This prevents students from potentially seeing the answer key via dev tools if you update your RLS policies later.
