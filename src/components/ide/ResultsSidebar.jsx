
export function ResultsSidebar({
  feedback,
  isEvaluating,
  expandedSections,
  onToggleSection,
  onClose,
  onResubmit,
  codeScore,
  visualScore,
  codePointsPerReq,
  visualPointsPerReq,
}) {
  return (
    <div className="w-[400px] shrink-0 flex flex-col bg-gray-900 border-l border-gray-800 shadow-2xl transition-all h-full z-20 absolute right-0 top-0">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span className="text-blue-400">📊</span> Evaluation Results
        </h2>
        <button
          className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
          onClick={onClose}
          title="Close results"
        >
          ✕
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">
        {isEvaluating ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="font-medium animate-pulse">Evaluating your code...</p>
          </div>
        ) : feedback ? (
          <>
            {feedback.error ? (
              <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-lg">
                <p className="text-red-400 font-medium">❌ {feedback.error}</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* SCORE HEADER */}
                <div
                  className={`p-6 rounded-xl border flex items-center justify-between shadow-lg ${feedback.score >= 90
                      ? 'bg-green-900/20 border-green-500/30'
                      : feedback.score >= 60
                        ? 'bg-yellow-900/20 border-yellow-500/30'
                        : 'bg-red-900/20 border-red-500/30'
                    }`}
                >
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black tracking-tighter ${feedback.score >= 90 ? 'text-green-400' : feedback.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                      {feedback.score}
                    </span>
                    <span className="text-gray-500 font-medium">/100</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${feedback.score >= 90
                        ? 'bg-green-500/10 text-green-400 border-green-500/50'
                        : feedback.score >= 60
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50'
                          : 'bg-red-500/10 text-red-400 border-red-500/50'
                      }`}
                  >
                    {feedback.score >= 90
                      ? '✓ PASS'
                      : feedback.score >= 60
                        ? '⚠ INCOMPLETE'
                        : '✗ FAIL'}
                  </span>
                </div>

                {/* OVERALL FEEDBACK */}
                {feedback.overallHint && (
                  <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl overflow-hidden">
                    <div className="bg-blue-900/30 px-4 py-2 border-b border-blue-500/20 flex items-center gap-2">
                      <span className="text-blue-400 text-sm">💡</span>
                      <span className="text-xs font-bold text-blue-300 tracking-wider uppercase">Feedback</span>
                    </div>
                    <p className="p-4 text-gray-300 text-sm leading-relaxed">
                      {feedback.overallHint}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* CODEBASE SECTION */}
                  {feedback.codeEvaluation?.length > 0 && (
                    <EvaluationSection
                      title="Codebase Requirements"
                      score={codeScore}
                      pointsPerReq={codePointsPerReq}
                      items={feedback.codeEvaluation}
                      isExpanded={expandedSections.codebase}
                      onToggle={() => onToggleSection('codebase')}
                    />
                  )}

                  {/* VISUAL OUTPUT SECTION */}
                  {feedback.visualEvaluation?.length > 0 && (
                    <EvaluationSection
                      title="Visual Requirements"
                      score={visualScore}
                      pointsPerReq={visualPointsPerReq}
                      items={feedback.visualEvaluation}
                      isExpanded={expandedSections.visual}
                      onToggle={() => onToggleSection('visual')}
                    />
                  )}
                </div>

                {/* SCREENSHOT REFERENCE */}
                {feedback.screenshot && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">
                      Screenshot Reference
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-800 shadow-lg bg-black">
                      <img
                        src={`data:image/png;base64,${feedback.screenshot}`}
                        alt="Code preview"
                        className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <p>Click submit to evaluate your code.</p>
          </div>
        )}
      </div>

      {/* RESUBMIT BUTTON */}
      {feedback && !isEvaluating && (
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <button
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors shadow-lg border border-gray-700 flex items-center justify-center gap-2"
            onClick={onResubmit}
          >
            <span>🔄</span> RESUBMIT
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Collapsible section showing a list of pass/fail evaluation requirements.
 */
function EvaluationSection({ title, score, pointsPerReq, items, isExpanded, onToggle }) {
  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden bg-gray-900/50">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors"
        onClick={onToggle}
      >
        <span className="font-semibold text-gray-200">{title}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
            {Math.round(score)}/50
          </span>
          <span className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-800 divide-y divide-gray-800/50 bg-gray-950/50">
          {items.map((item, idx) => {
            const earned = item.passed ? Math.round(pointsPerReq) : 0;
            const max = Math.round(pointsPerReq);
            return (
              <div
                key={item.id ?? idx}
                className="p-4 flex gap-4"
              >
                <div className="shrink-0 mt-0.5">
                  {item.passed ? (
                    <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs border border-green-500/50">
                      ✓
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs border border-red-500/50">
                      ✕
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm ${item.passed ? 'text-gray-300' : 'text-gray-400'}`}>
                    {item.requirement}
                  </p>
                  <div className="text-xs font-medium text-gray-500">
                    Score: {earned}/{max} points
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
