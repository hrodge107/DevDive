import Editor from '@monaco-editor/react';
import { useAuth } from '../../../core/contexts/AuthContext';

export function CodeEditor({
  files,
  activeFileName,
  activeFile,
  onTabChange,
  onEditorChange,
  onAddFile,
  onDeleteClick,
  onPreview,
  onSubmit,
  isEvaluating,
  isSidebarOpen,
  onToggleSidebar,
  showSidebarToggle = true,
  showSubmit = true,
}) {
  const { user } = useAuth();
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 overflow-hidden">
      {/* TAB BAR */}
      <div className="flex items-center bg-gray-900 border-b border-gray-800 overflow-x-auto scrollbar-hide">
        {showSidebarToggle && (
          <button
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors border-r border-gray-800"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        )}

        <div className="flex flex-1">
          {files.map((file) => (
            <div key={file.name} className="flex group">
              <button
                onClick={() => onTabChange(file.name)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-r border-gray-800 flex items-center gap-2 ${
                  activeFileName === file.name
                    ? 'bg-gray-800 text-blue-400 border-b-2 border-b-blue-500'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border-b-2 border-b-transparent'
                }`}
              >
                {/* File Icon based on extension */}
                {file.name.endsWith('.html') && <span className="text-orange-500">{"<>"}</span>}
                {file.name.endsWith('.css') && <span className="text-blue-500">{"#"}</span>}
                {file.name.endsWith('.js') && <span className="text-yellow-400">{"{ }"}</span>}
                {file.name}
              </button>
              
              {/* Delete button: hidden on active tab and index.html */}
              {files.length > 1 &&
                activeFileName !== file.name &&
                file.name !== 'index.html' && (
                  <button
                    className="px-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 border-r border-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(file.name);
                    }}
                    title="Delete file"
                  >
                    ✕
                  </button>
              )}
            </div>
          ))}
          <button 
            onClick={onAddFile} 
            className="px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center justify-center font-bold"
            title="Create new file"
          >
            +
          </button>
        </div>
      </div>

      {/* MONACO EDITOR */}
      <div className="flex-1 relative min-h-0 min-w-0">
        {activeFile ? (
          <Editor
            height="100%"
            language={activeFile.language}
            theme="vs-dark"
            value={activeFile.content}
            onChange={onEditorChange}
            options={{
              readOnly: !user,
              minimap: { enabled: false },
              fontSize: 15,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              wordWrap: 'on',
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoClosingOvertype: 'always',
              autoSurround: 'languageDefined',
              formatOnPaste: true,
              scrollBeyondLastLine: false,
              padding: { top: 16 },
            }}
            loading={<div className="flex h-full items-center justify-center text-gray-500">Loading editor...</div>}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p>No file selected.</p>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center justify-end gap-3 p-4 bg-gray-900 border-t border-gray-800">
        <button 
          className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-950 border border-gray-700 text-gray-200 font-medium rounded-lg transition-all flex items-center gap-2 text-sm shadow-sm"
          onClick={onPreview}
        >
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          RUN PREVIEW
        </button>
        {showSubmit && (
          <button 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-400 disabled:shadow-none disabled:border-transparent text-white font-semibold rounded-lg transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 text-sm border border-blue-500/50 hover:border-blue-400/50"
            onClick={onSubmit} 
            disabled={isEvaluating}
          >
            {isEvaluating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                EVALUATING...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                SUBMIT FOR REVIEW
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
