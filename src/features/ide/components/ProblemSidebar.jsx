
import ReactMarkdown from 'react-markdown';

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
            <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
              {exerciseConfig.title}
            </h1>
            <div className="text-gray-300 leading-relaxed mb-6 prose prose-invert prose-cyan prose-sm max-w-none prose-p:leading-relaxed prose-a:text-blue-400 prose-code:text-pink-400 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-h3:text-white prose-h3:mt-8 prose-h3:mb-4">
              <ReactMarkdown>{exerciseConfig.description}</ReactMarkdown>
            </div>
          </>
        )}
      </div>

      {isSidebarOpen && (
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize z-10 hover:bg-blue-500/50`}
          onMouseDown={onResizeStart}
        />
      )}
    </div>
  );
}
