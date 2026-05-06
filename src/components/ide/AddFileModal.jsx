import { useState } from 'react';

const EXTENSION_MAP = { html: '.html', css: '.css', javascript: '.js' };

export function AddFileModal({ files, onConfirm, onCancel }) {
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('css');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!newFileName.trim()) {
      setError('File name cannot be empty.');
      return;
    }

    let finalFileName = newFileName.trim();
    const requiredExt = EXTENSION_MAP[newFileType];

    if (!finalFileName.endsWith(requiredExt)) {
      finalFileName += requiredExt;
    }

    if (files.some((f) => f.name === finalFileName)) {
      setError('A file with this name already exists.');
      return;
    }

    onConfirm(finalFileName, newFileType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-800 bg-gray-900/50">
          <h3 className="text-lg font-bold text-white tracking-tight">Create New File</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">File Type</label>
            <select
              value={newFileType}
              onChange={(e) => setNewFileType(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
            >
              <option value="css">CSS</option>
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">File Name</label>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g., script"
              autoFocus
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors placeholder:text-gray-600"
            />
          </div>
          {error && <div className="text-red-400 text-sm font-medium">{error}</div>}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 text-sm font-semibold"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
