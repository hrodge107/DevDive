import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './core/contexts/AuthContext';
import LandingPage from './features/landing/pages/LandingPage';
import CourseMap from './features/course/pages/CourseMap';
import LessonPage from './features/course/pages/LessonPage';
import ExercisePage from './features/ide/pages/ExercisePage';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/course-map" element={<CourseMap />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/exercise/:exerciseId" element={<ExercisePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
