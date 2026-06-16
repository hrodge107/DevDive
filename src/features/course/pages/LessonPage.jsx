import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import Header from '../../../core/components/Header';
import { useAuth } from '../../../core/contexts/AuthContext';
import QuizEngine from '../../../components/QuizEngine';
import { fetchLesson, fetchCurriculum } from '../../../services/courseService';
import { markLessonCompleted } from '../../../services/progressService';

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

  const [prevPath, setPrevPath] = useState('/course-map');
  const [nextPath, setNextPath] = useState('/course-map');
  const [isQuizMode, setIsQuizMode] = useState(false);

  const handleQuizPassed = async () => {
    console.log('[handleQuizPassed] Pipeline started');
    console.log('[handleQuizPassed] Current user:', user?.id);
    console.log('[handleQuizPassed] Current lessonData:', lessonData?.id);

    if (!user || !lessonData) {
      console.warn('[handleQuizPassed] Silent exit: Missing user or lessonData.');
      return;
    }

    try {
      console.log('[handleQuizPassed] Checking for existing progress...');
      await markLessonCompleted(user.id, lessonData.unit_id, lessonData.id);
      console.log('[handleQuizPassed] Mark complete successful!');
    } catch (err) {
      console.error('[handleQuizPassed] Caught Exception:', err.message);
    }
  };

  useEffect(() => {
    const loadLessonData = async () => {
      setLoading(true);
      setError(null);

      try {
        const lesson = await fetchLesson(lessonId);

        let parsedQuestions = [];
        const qs = lesson.quizzes?.questions;
        if (qs) {
          parsedQuestions = typeof qs === 'string' ? JSON.parse(qs) : qs;
        }

        setLessonData({
          id: lesson.id,
          unit_id: lesson.unit_id,
          unit_title: lesson.units?.title,
          title: lesson.title,
          markdown_body: lesson.markdown_body,
          questions: parsedQuestions
        });

        // Fetch course map to determine prev/next
        const curriculumData = await fetchCurriculum();

        if (curriculumData) {
          const allLessons = curriculumData.flatMap(unit => unit.lessons);
          const currentIndex = allLessons.findIndex(l => l.id.toString() === lessonId);

          const getPath = (lessonObj) => {
            const exerciseId = Array.isArray(lessonObj.exercises) ? lessonObj.exercises[0]?.id : lessonObj.exercises?.id;
            return exerciseId ? `/exercise/${exerciseId}` : `/lesson/${lessonObj.id}`;
          };

          if (currentIndex > 0) setPrevPath(getPath(allLessons[currentIndex - 1]));
          if (currentIndex !== -1 && currentIndex < allLessons.length - 1) setNextPath(getPath(allLessons[currentIndex + 1]));
        }
      } catch (err) {
        console.error("Error loading lesson:", err);
        setError("Failed to load lesson content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      loadLessonData();
    }
  }, [lessonId, user]);

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

        {!isQuizMode ? (
          <div>
            {/* Content Paragraph */}
            {lessonData.markdown_body && (
              <article className="prose prose-invert lg:prose-xl max-w-none text-slate-300 mb-12">
                <style>{`
                  .keyword {
                    color: #22D3EE;
                    font-weight: 600;
                    background-color: rgba(34, 211, 238, 0.1);
                    padding: 2px 6px;
                    border-radius: 6px;
                    border: 1px solid rgba(34, 211, 238, 0.2);
                    box-shadow: 0 0 8px rgba(34, 211, 238, 0.1);
                    transition: all 0.2s ease-in-out;
                  }
                  .keyword:hover {
                    background-color: rgba(34, 211, 238, 0.2);
                    box-shadow: 0 0 12px rgba(34, 211, 238, 0.25);
                    cursor: default;
                  }
                `}</style>
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline ? (
                        <div className="not-prose bg-[#131A2B] rounded-xl border border-white/5 p-6 my-6 font-fira text-sm overflow-x-auto shadow-xl">
                          <pre className="text-slate-300 leading-relaxed" {...props}>
                            <code>{children}</code>
                          </pre>
                        </div>
                      ) : (
                        <code className="not-prose bg-[#131A2B] px-1.5 py-0.5 rounded text-cyan-300" {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {lessonData.markdown_body}
                </ReactMarkdown>
              </article>
            )}

            {/* Knowledge Check Button */}
            {lessonData.questions?.length > 0 && (
              <button
                onClick={() => setIsQuizMode(true)}
                className="btn-primary px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#0B1326] rounded-xl transition-all shadow-lg shadow-cyan-500/20 font-semibold"
              >
                Start Knowledge Check
              </button>
            )}
          </div>
        ) : (
          <QuizEngine
            questions={lessonData.questions}
            onPassed={handleQuizPassed}
            onCancel={() => setIsQuizMode(false)}
            passThreshold={80}
          />
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
