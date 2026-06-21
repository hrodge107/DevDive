import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchExercises, fetchGroupSubmissions } from '../../../services/groupService';

export default function MemberTasksView({ groupId, activeTab }) {
  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [exData, subData] = await Promise.all([
          fetchExercises(groupId),
          fetchGroupSubmissions(groupId)
        ]);
        setExercises(exData);
        setSubmissions(subData);
      } catch (err) {
        setError('Failed to load tasks.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#22D3EE]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-center py-16">{error}</div>;
  }

  const subMap = new Map();
  submissions.forEach(sub => subMap.set(sub.exercise_id, sub));

  const ongoing = [];
  const completed = [];

  exercises.forEach(ex => {
    if (subMap.has(ex.id)) {
      completed.push({ ...ex, submission: subMap.get(ex.id) });
    } else {
      ongoing.push(ex);
    }
  });

  // Sort ongoing by deadline ascending
  ongoing.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  // Sort completed by submitted_at descending
  completed.sort((a, b) => new Date(b.submission.submitted_at) - new Date(a.submission.submitted_at));

  const displayedTasks = activeTab === 'ongoing' ? ongoing : completed;

  const formatDeadline = (deadline) => {
    const d = new Date(deadline);
    const now = new Date();
    const isPast = d < now;
    const formatted = d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    return { formatted, isPast };
  };

  return (
    <div>
      {displayedTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">
            {activeTab === 'ongoing' ? "You have no ongoing tasks. Great job!" : "You haven't completed any tasks yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedTasks.map(task => {
            const { formatted, isPast } = formatDeadline(task.deadline);
            return (
              <div
                key={task.id}
                className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm mb-1">{task.title}</h4>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-3">{task.task_description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      {activeTab === 'ongoing' ? (
                        <span className={`flex items-center gap-1 ${isPast ? 'text-red-400' : 'text-slate-500'}`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {isPast ? 'Overdue' : 'Due'}: {formatted}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Score: {task.submission.score}/100
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      onClick={() => navigate(`/groups/${groupId}/exercise/${task.id}`)}
                      className="px-4 py-2 bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20 hover:bg-[#22D3EE]/20 rounded-lg text-xs font-medium transition-colors"
                    >
                      Open Task
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
