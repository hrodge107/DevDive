import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './features/landing/pages/LandingPage';
import CourseMap from './features/course/pages/CourseMap';
import LessonPage from './features/course/pages/LessonPage';
import ExercisePage from './features/ide/pages/ExercisePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/course-map" element={<CourseMap />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/exercise/:exerciseId" element={<ExercisePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
