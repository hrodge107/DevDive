import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CourseMap from './pages/CourseMap';
import LessonPage from './pages/LessonPage';
import ExercisePage from './pages/ExercisePage';

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
