import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../../core/components/Header';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../core/contexts/AuthContext';

// Resolve the route path for any lesson item
const getLessonPath = (item) => {
  if (item.type === 'exercise' && item.exercise_ref) return `/exercise/${item.exercise_ref}`;
  return `/lesson/${item.lesson_id}`;
};

export default function LessonPage() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const [prevPath, setPrevPath] = useState('/course-map');
  const [nextPath, setNextPath] = useState('/course-map');
  
  const handleComplete = async () => {
    if (!user || !lessonId) return;
    try {
      const [unitPart] = lessonId.split('_');
      await supabase.from('user_progress').insert({
        user_id: user.id,
        unit_id: unitPart,
        lesson_id: lessonId,
        is_completed: true,
      });
      // User can click "Next" manually or we can navigate. Keep UI simple.
      alert('Lesson marked as complete!');
    } catch (err) {
      console.error('Error logging progress', err);
    }
  };

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      setError(null);
      setSelectedAnswer(null);
      setIsCorrect(null);
      
      try {
        const [unitPart, lessonPart] = lessonId.split('_');
        const response = await fetch(`/curriculum/${unitPart}/${lessonPart}/lesson.json`);
        if (!response.ok) {
          throw new Error('Lesson not found');
        }
        const data = await response.json();
        setLessonData(data);

        // Fetch course map to determine prev/next
        const mapRes = await fetch('/curriculum/course_map.json');
        if (mapRes.ok) {
          const mapData = await mapRes.json();
          const allLessons = mapData.curriculum.flatMap(unit => unit.lessons);
          const currentIndex = allLessons.findIndex(l => l.lesson_id === lessonId);
          
          if (currentIndex > 0) setPrevPath(getLessonPath(allLessons[currentIndex - 1]));
          if (currentIndex !== -1 && currentIndex < allLessons.length - 1) setNextPath(getLessonPath(allLessons[currentIndex + 1]));
        }
      } catch (err) {
        console.error("Error loading lesson:", err);
        setError("Failed to load lesson content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const handleOptionClick = (index) => {
    setSelectedAnswer(index);
    if (lessonData?.knowledge_check) {
      setIsCorrect(index === lessonData.knowledge_check.correct_answer_index);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1326] text-slate-200 font-inter flex flex-col items-center justify-center">
        <Header />
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#22D3EE] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#22D3EE] font-mono tracking-widest text-sm uppercase">Loading Protocol...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lessonData) {
    return (
      <div className="min-h-screen bg-[#0B1326] text-slate-200 font-inter flex flex-col items-center justify-center">
        <Header />
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="text-red-400 font-mono text-center">
            <p className="text-xl mb-2">System Error</p>
            <p>{error || "Lesson data could not be retrieved."}</p>
            <Link to="/course-map" className="mt-6 inline-block text-[#22D3EE] hover:underline">
              Return to Course Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1326] text-slate-200 font-inter flex flex-col overflow-x-hidden selection:bg-[#22D3EE]/30 pb-24">
      <Header />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Breadcrumb */}
        <div className="text-[10px] font-bold tracking-widest text-[#22D3EE] uppercase mb-4">
          {lessonData.unit_title}
        </div>
        
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
          {lessonData.title}
        </h1>
        
        {/* Content Paragraph */}
        <div className="text-slate-300 text-base leading-relaxed mb-12" dangerouslySetInnerHTML={{ __html: lessonData.content }} />
        
        {/* Code Block */}
        {lessonData.code_block && (
          <div className="bg-[#131A2B] rounded-xl border border-white/5 p-6 mb-12 font-fira text-sm overflow-x-auto shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-slate-400 font-bold tracking-wide">
              <svg className="w-5 h-5 text-[#22D3EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {lessonData.code_block.title}
            </div>
            <pre className="text-slate-300 leading-relaxed">
              <code>
                {lessonData.code_block.code}
              </code>
            </pre>
          </div>
        )}

        {/* Knowledge Check */}
        {lessonData.knowledge_check && (
          <div className="bg-[#181F31] rounded-2xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
            
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#1E293B] flex items-center justify-center text-[#22D3EE] shadow-inner">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Knowledge Check</h2>
                <p className="text-slate-400 text-sm">Verify your structural understanding.</p>
              </div>
            </div>
            
            <p className="text-white font-medium mb-6 leading-relaxed">
              {lessonData.knowledge_check.question}
            </p>

            <div className="space-y-3 font-fira text-sm">
              {lessonData.knowledge_check.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                let optionStyle = "border-white/5 bg-[#0F172A] hover:border-white/10 text-slate-400";
                let radioStyle = "border-slate-500 bg-transparent";
                
                if (isSelected) {
                  if (isCorrect) {
                    optionStyle = "border-emerald-500 bg-[#0F172A] text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                    radioStyle = "border-4 border-emerald-500 bg-[#0F172A]";
                  } else {
                    optionStyle = "border-red-500 bg-[#0F172A] text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
                    radioStyle = "border-4 border-red-500 bg-[#0F172A]";
                  }
                }

                return (
                  <div 
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${optionStyle}`}
                  >
                    <div className={`w-4 h-4 rounded-full border ${radioStyle}`} />
                    <span>{option}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B1326] border-t border-white/5 p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to={prevPath} className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 hover:text-white transition-colors uppercase">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Previous
          </Link>
          
          <button onClick={handleComplete} className="flex items-center gap-2 bg-[#22D3EE] text-[#003546] font-bold text-xs px-6 py-3 rounded uppercase tracking-widest hover:bg-cyan-300 transition-colors">
            <svg className="w-4 h-4 text-[#003546]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Mark Complete
          </button>
          
          <Link to={nextPath} className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 hover:text-white transition-colors uppercase">
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
