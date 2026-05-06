export function DeleteFileModal({ fileName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-800 bg-gray-900/50">
          <h3 className="text-lg font-bold text-red-400 tracking-tight flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Delete File
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-gray-300 leading-relaxed text-sm">
            Are you sure you want to delete <strong className="text-white font-semibold">"{fileName}"</strong>?{' '}
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={onConfirm} 
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all shadow-lg shadow-red-500/20 text-sm font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
