import { useEffect, useState } from 'react';
import CourseTimeline from '../components/CourseTimeline';
import Header from '../../../core/components/Header';
import Footer from '../../../core/components/Footer';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../../core/contexts/AuthContext';
import { fetchCurriculum } from '../../../services/courseService';
import { fetchUserProgress } from '../../../services/progressService';

export default function CourseMap() {
  const [curriculum, setCurriculum] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMap = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [curriculumData, progress] = await Promise.all([
          fetchCurriculum(), 
          fetchUserProgress(user?.id)
        ]);
        
        let completedLessons = new Set();
        let completedExercises = new Set();
        
        if (progress) {
          progress.forEach(p => {
            if (p.lesson_id) completedLessons.add(p.lesson_id);
            if (p.exercise_id) completedExercises.add(p.exercise_id);
          });
        }
        
        // Phase 3: Map over Tree & Compute Status
        const curriculumWithStatus = curriculumData.map((unit, uIdx) => ({
          ...unit,
          lessons: unit.lessons.map((lesson, lIdx) => {
            const hasExercise = Array.isArray(lesson.exercises) ? lesson.exercises.length > 0 : !!lesson.exercises;
            const exerciseId = Array.isArray(lesson.exercises) ? lesson.exercises[0]?.id : lesson.exercises?.id;
            
            const isCompleted = exerciseId 
              ? completedExercises.has(exerciseId) 
              : completedLessons.has(lesson.id);

            // Default to 'not_started' (open and clickable) instead of 'locked'
            let status = 'not_started'; 

            if (isCompleted) {
              status = 'completed';
            }
            
            return { ...lesson, status, hasExercise };
          })
        }));
        
        setCurriculum(curriculumWithStatus);
      } catch (e) {
        console.error("Failed to load course map", e);
        setError("Failed to load curriculum. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMap();
  }, [user]);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col overflow-hidden selection:bg-[#22D3EE]/30">
      <Header
        showSidebarToggle={true}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      
      <div className="flex flex-1 relative w-full overflow-hidden">
        <Sidebar isExpanded={isSidebarExpanded} />
        
        <main className="flex-1 relative overflow-y-auto h-[calc(100vh-64px)] flex flex-col justify-between">
          <div className="pb-24">
            {/* Abstract background glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#22D3EE]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            
            {/* Header section */}
            <section className="pt-16 pb-12 px-4 text-center relative z-10 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 font-serif">
                Course Map
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto font-light leading-relaxed">
                Your journey through the fundamentals of web development. Follow the path to build your core skills.
              </p>
            </section>

            {/* Presentational Timeline */}
            <section className="px-4 relative z-10">
              {isLoading ? (
                <div className="flex justify-center py-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                </div>
              ) : error ? (
                <div className="flex justify-center py-32 text-red-400">
                  <p>{error}</p>
                </div>
              ) : curriculum.length > 0 ? (
                <CourseTimeline curriculum={curriculum} />
              ) : (
                <div className="flex justify-center py-32 text-slate-400">
                  <p>No curriculum found.</p>
                </div>
              )}
            </section>
          </div>
          
          <Footer />
        </main>
      </div>
    </div>
  );
}
