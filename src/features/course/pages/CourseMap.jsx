import { useEffect, useState } from 'react';
import CourseTimeline from '../components/CourseTimeline';
import Header from '../../../core/components/Header';
import Footer from '../../../core/components/Footer';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../core/contexts/AuthContext';

export default function CourseMap() {
  const [curriculum, setCurriculum] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const response = await fetch('/curriculum/course_map.json');
        const data = await response.json();
        
        let completedLessons = new Set();
        
        if (user) {
          const { data: progress } = await supabase
            .from('user_progress')
            .select('lesson_id, exercise_id')
            .eq('user_id', user.id)
            .eq('is_completed', true);
            
          if (progress) {
            progress.forEach(p => {
              if (p.lesson_id) completedLessons.add(p.lesson_id);
              if (p.exercise_id) completedLessons.add(p.exercise_id);
            });
          }
        }
        
        const curriculumWithStatus = data.curriculum.map((unit, uIdx) => ({
          ...unit,
          lessons: unit.lessons.map((lesson, lIdx) => {
            let status = 'locked';
            if (completedLessons.has(lesson.lesson_id) || completedLessons.has(lesson.exercise_ref)) {
              status = 'completed';
            } else if (uIdx === 0 && lIdx === 0) {
              status = 'in_progress';
            }
            return { ...lesson, status };
          })
        }));
        
        setCurriculum(curriculumWithStatus);
      } catch (e) {
        console.error("Failed to load course map", e);
      }
    };
    fetchMap();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col overflow-x-hidden selection:bg-[#22D3EE]/30">
      <Header />
      
      <main className="flex-1 pb-24 relative">
        {/* Abstract background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#22D3EE]/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Header section */}
        <section className="pt-16 pb-12 px-4 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 font-serif">
            Course Map
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto font-light leading-relaxed">
            Your journey through the fundamentals of web development. Follow the path to build your core skills.
          </p>
        </section>

        {/* Presentational Timeline */}
        <section className="px-4 relative z-10">
          {curriculum.length > 0 ? (
            <CourseTimeline curriculum={curriculum} />
          ) : (
            <div className="flex justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
