export default function StudentStatusModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0E1726] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22D3EE]/10 rounded-full flex items-center justify-center text-[#22D3EE] font-bold">
              {(student.username || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{student.username}</h2>
              <p className="text-xs text-slate-500">{student.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800 flex items-center gap-4 text-xs">
          <span className="text-slate-400">
            Submitted: <span className="text-white font-medium">{student.submitted_count}</span>
          </span>
          <span className="text-slate-400">
            Missing: <span className="text-white font-medium">{student.missing_count}</span>
          </span>
          <span className="text-slate-400">
            Aggregate: <span className={`font-bold ${student.aggregate_percent >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>
              {student.aggregate_percent}%
            </span>
          </span>
        </div>

        {/* Task Breakdown */}
        <div className="px-6 py-4 max-h-80 overflow-y-auto">
          {student.task_statuses && student.task_statuses.length > 0 ? (
            <div className="space-y-2">
              {student.task_statuses.map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">
                      Due: {new Date(task.deadline).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {task.status === 'not_answered' ? (
                      <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                        Not Answered
                      </span>
                    ) : task.score !== null && task.score >= 60 ? (
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        {task.score}/100
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                        {task.score}/100
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">No task data available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
