import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './core/contexts/AuthContext';
import LandingPage from './features/landing/pages/LandingPage';
import CourseMap from './features/course/pages/CourseMap';
import LessonPage from './features/course/pages/LessonPage';
import ExercisePage from './features/ide/pages/ExercisePage';
import PlaygroundPage from './features/ide/pages/PlaygroundPage';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import ProfilePage from './features/auth/pages/ProfilePage';

// Groups Feature
import GroupsPage from './features/groups/pages/GroupsPage';
import RoomPage from './features/groups/pages/RoomPage';
import CreateTaskPage from './features/groups/pages/CreateTaskPage';
import EditTaskPage from './features/groups/pages/EditTaskPage';
import GroupExercisePage from './features/groups/pages/GroupExercisePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/course-map" element={<CourseMap />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/exercise/:exerciseId" element={<ExercisePage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Groups Routes */}
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<RoomPage />} />
          <Route path="/groups/:groupId/create-task" element={<CreateTaskPage />} />
          <Route path="/groups/:groupId/edit-task/:exId" element={<EditTaskPage />} />
          <Route path="/groups/:groupId/exercise/:exId" element={<GroupExercisePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
