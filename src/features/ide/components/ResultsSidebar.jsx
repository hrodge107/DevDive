export function ResultsSidebar({
  feedback,
  isEvaluating,
  cooldownRemaining,
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
    <div className="w-[400px] shrink-0 flex flex-col bg-slate-950/95 backdrop-blur-md border-l border-slate-800/80 shadow-[0_0_50px_rgba(0,0,0,0.6)] transition-all h-full z-20 absolute right-0 top-0">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          {/* Bar chart SVG */}
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Evaluation Results
        </h2>
        <button
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/75 border border-transparent hover:border-slate-700/50 transition-colors"
          onClick={onClose}
          title="Close results"
        >
          {/* Close X SVG */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {isEvaluating ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
            <div className="w-10 h-10 border-4 border-slate-800 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="font-semibold text-sm animate-pulse tracking-wide">Evaluating your code...</p>
          </div>
        ) : feedback ? (
          <>
            {feedback.error && (
              <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-rose-200 text-sm font-semibold">Submission failed. Please resubmit again.</p>
              </div>
            )}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* SCORE HEADER */}
              <div
                className={`p-6 rounded-xl border flex items-center justify-between shadow-lg backdrop-blur-sm ${feedback.error
                    ? 'bg-slate-900/40 border-slate-700/50 border-l-4 border-l-slate-500'
                    : feedback.score >= 90
                      ? 'bg-emerald-950/10 border-emerald-500/20 border-l-4 border-l-emerald-500'
                      : feedback.score >= 60
                        ? 'bg-amber-950/10 border-amber-500/20 border-l-4 border-l-amber-500'
                        : 'bg-rose-950/10 border-rose-500/20 border-l-4 border-l-rose-500'
                  }`}
              >
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-black tracking-tighter ${feedback.error
                        ? 'text-slate-500'
                        : feedback.score >= 90
                          ? 'text-emerald-400'
                          : feedback.score >= 60
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                  >
                    {feedback.error ? '-' : feedback.score}
                  </span>
                  <span className="text-slate-500 font-medium">/100</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border flex items-center gap-1.5 ${feedback.error
                      ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                      : feedback.score >= 90
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : feedback.score >= 60
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                >
                  {feedback.error ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      ERROR
                    </>
                  ) : feedback.score >= 90 ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      PASS
                    </>
                  ) : feedback.score >= 60 ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      INCOMPLETE
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      FAIL
                    </>
                  )}
                </span>
              </div>

              {/* OVERALL FEEDBACK */}
              {feedback.overallHint && (
                <div className="bg-cyan-950/10 border border-cyan-500/20 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-cyan-950/30 px-4 py-2 border-b border-cyan-500/10 flex items-center gap-2">
                    {/* Lightbulb SVG */}
                    <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .4 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                      <line x1="9" y1="18" x2="15" y2="18" />
                      <line x1="10" y1="22" x2="14" y2="22" />
                    </svg>
                    <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">Feedback</span>
                  </div>
                  <p className="p-4 text-slate-300 text-sm leading-relaxed">
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
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                    Screenshot Reference
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-black">
                    <img
                      src={`data:image/png;base64,${feedback.screenshot}`}
                      alt="Code preview"
                      className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <p className="text-sm font-medium">Click submit to evaluate your code.</p>
          </div>
        )}
      </div>

      {/* RESUBMIT BUTTON */}
      {feedback && !isEvaluating && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
          <button
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900/40 disabled:text-slate-600 disabled:cursor-not-allowed disabled:border-slate-800/50 text-white font-semibold rounded-lg transition-all shadow-md border border-slate-700/60 flex items-center justify-center gap-2 text-sm"
            onClick={onResubmit}
            disabled={cooldownRemaining > 0}
          >
            {cooldownRemaining > 0 ? (
              <>
                {/* Clock SVG */}
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                COOLDOWN ({cooldownRemaining}s)
              </>
            ) : (
              <>
                {/* Refresh Cw SVG */}
                <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                RESUBMIT
              </>
            )}
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
    <div className="rounded-xl border border-slate-800/80 overflow-hidden bg-slate-900/30 backdrop-blur-sm hover:border-slate-700/50 transition-colors">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
        onClick={onToggle}
      >
        <span className="font-semibold text-slate-200 text-sm">{title}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700/50 px-2.5 py-1 rounded-full">
            {Math.round(score)}/50
          </span>
          {/* Chevron SVG with rotation styling */}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-800/80 divide-y divide-slate-800/50 bg-slate-950/40">
          {items.map((item, idx) => {
            const earned = item.passed ? Math.round(pointsPerReq) : 0;
            const max = Math.round(pointsPerReq);
            return (
              <div
                key={item.id ?? idx}
                className="p-4 flex gap-4 animate-in fade-in duration-300"
              >
                <div className="shrink-0 mt-0.5">
                  {item.passed ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      {/* Check SVG */}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                      {/* X SVG */}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm ${item.passed ? 'text-slate-200' : 'text-slate-400'}`}>
                    {item.requirement}
                  </p>
                  <div className="text-xs font-semibold text-slate-500">
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
