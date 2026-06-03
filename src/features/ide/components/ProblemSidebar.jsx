
export function ProblemSidebar({
  exerciseConfig,
  isSidebarOpen,
  sidebarWidth,
  isResizing,
  onResizeStart,
}) {
  return (
    <div
      className={`relative flex flex-col bg-gray-900 border-r border-gray-800 ${!isSidebarOpen ? 'w-0 overflow-hidden border-none' : ''}`}
      style={{ width: isSidebarOpen ? sidebarWidth : 0 }}
    >
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700">
        {exerciseConfig && (
          <>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-400 bg-blue-900/30 rounded-full uppercase">
              {exerciseConfig.category}
            </span>
            <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
              {exerciseConfig.title}
            </h1>
            <p className="text-gray-300 leading-relaxed mb-6">
              {exerciseConfig.description}
            </p>

            <hr className="border-gray-800 my-8" />

            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-yellow-400">💡</span> The Goal
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              {exerciseConfig.goal}
            </p>

            <hr className="border-gray-800 my-8" />

            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-green-400">☑️</span> Instructions
            </h2>
            
            <div className="space-y-4">
              {exerciseConfig.instructions.map((instruction, idx) => (
                <div key={idx} className="flex gap-3 text-gray-300">
                  <span className="text-green-500 font-bold shrink-0 mt-1">✓</span>
                  <div 
                    className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-blue-400 prose-code:text-pink-400 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
                    dangerouslySetInnerHTML={{ __html: instruction }} 
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {isSidebarOpen && (
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize z-10`}
          onMouseDown={onResizeStart}
        />
      )}
    </div>
  );
}
