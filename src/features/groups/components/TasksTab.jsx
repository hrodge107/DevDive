import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchExercises, deleteExercise } from '../../../services/groupService';

export default function TasksTab({ groupId }) {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchExercises(groupId);
        setExercises(data);
      } catch (e) {
        setError('Failed to load exercises.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadExercises();
  }, [groupId]);

  const handleDelete = async (exId) => {
    if (!confirm('Delete this task? This will also remove all submissions.')) return;
    try {
      await deleteExercise(groupId, exId);
      setExercises(prev => prev.filter(e => e.id !== exId));
    } catch (err) {
      console.error('Failed to delete exercise:', err);
    }
  };

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

  return (
    <div>
      {/* Create Task Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/groups/${groupId}/create-task`)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#22D3EE] text-slate-900 font-bold rounded-lg hover:bg-cyan-300 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Task
        </button>
      </div>

      {/* Exercise List */}
      {exercises.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">No tasks yet. Create your first task above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exercises.map(ex => {
            const { formatted, isPast } = formatDeadline(ex.deadline);
            return (
              <div
                key={ex.id}
                className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm mb-1">{ex.title}</h4>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-3">{ex.task_description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`flex items-center gap-1 ${isPast ? 'text-red-400' : 'text-slate-500'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {isPast ? 'Overdue' : 'Due'}: {formatted}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/groups/${groupId}/edit-task/${ex.id}`)}
                      className="px-3 py-1.5 text-slate-400 hover:text-[#22D3EE] hover:bg-[#22D3EE]/10 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ex.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
