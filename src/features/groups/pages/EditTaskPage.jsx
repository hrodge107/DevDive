import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../core/components/Header';
import { useAuth } from '../../../core/contexts/AuthContext';
import { fetchExercise, updateExercise } from '../../../services/groupService';

export default function EditTaskPage() {
  const { groupId, exId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [starterFiles, setStarterFiles] = useState([]);
  const [codeRequirements, setCodeRequirements] = useState(['']);
  const [visualRequirements, setVisualRequirements] = useState(['']);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExercise = async () => {
      setIsLoading(true);
      try {
        const ex = await fetchExercise(groupId, exId);
        setTitle(ex.title || '');
        setTaskDescription(ex.task_description || '');
        // Format deadline for datetime-local input
        if (ex.deadline) {
          const d = new Date(ex.deadline);
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setDeadline(local);
        }
        setStarterFiles(Array.isArray(ex.starter_files) ? ex.starter_files : []);
        // Note: ai_rubric is not returned from the API for security.
        // The owner can update it here, but existing values won't be pre-populated.
      } catch (err) {
        setError('Failed to load exercise.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadExercise();
  }, [groupId, exId]);

  // --- Starter Files Handlers ---
  const addFile = () => setStarterFiles(prev => [...prev, { name: '', language: 'html', content: '' }]);
  const removeFile = (idx) => setStarterFiles(prev => prev.filter((_, i) => i !== idx));
  const updateFile = (idx, field, value) => {
    setStarterFiles(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f));
  };

  // --- Requirements Handlers ---
  const addRequirement = (setter) => setter(prev => [...prev, '']);
  const removeRequirement = (setter, idx) => setter(prev => prev.filter((_, i) => i !== idx));
  const updateRequirement = (setter, idx, value) => {
    setter(prev => prev.map((r, i) => i === idx ? value : r));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const updates = {
        title: title.trim(),
        task_description: taskDescription.trim(),
        deadline: new Date(deadline).toISOString(),
        starter_files: starterFiles.filter(f => f.name.trim()),
      };

      // Only include rubric if requirements were provided
      const codeReqs = codeRequirements.filter(r => r.trim());
      const visualReqs = visualRequirements.filter(r => r.trim());
      if (codeReqs.length > 0 || visualReqs.length > 0) {
        updates.ai_rubric = {
          codeRequirements: codeReqs,
          visualRequirements: visualReqs,
        };
      }

      await updateExercise(groupId, exId, updates);
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Sign in required.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22D3EE]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="text-sm text-slate-400 hover:text-[#22D3EE] transition-colors mb-6 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Group
          </button>

          <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Task</h1>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]/50 focus:ring-1 focus:ring-[#22D3EE]/30 transition-colors text-sm"
                required
              />
            </div>

            {/* Task Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Task Description</label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]/50 focus:ring-1 focus:ring-[#22D3EE]/30 transition-colors text-sm resize-none"
                required
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#22D3EE]/50 focus:ring-1 focus:ring-[#22D3EE]/30 transition-colors text-sm [color-scheme:dark]"
                required
              />
            </div>

            {/* Starter Files */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-300">Starter Files</label>
                <button
                  type="button"
                  onClick={addFile}
                  className="text-xs text-[#22D3EE] hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                  </svg>
                  Add File
                </button>
              </div>
              <div className="space-y-4">
                {starterFiles.map((file, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={file.name}
                        onChange={(e) => updateFile(idx, 'name', e.target.value)}
                        placeholder="File name"
                        className="flex-1 px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#22D3EE]/50"
                      />
                      <select
                        value={file.language}
                        onChange={(e) => updateFile(idx, 'language', e.target.value)}
                        className="px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#22D3EE]/50 [color-scheme:dark]"
                      >
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="javascript">JS</option>
                      </select>
                      {starterFiles.length > 1 && (
                        <button type="button" onClick={() => removeFile(idx)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <textarea
                      value={file.content}
                      onChange={(e) => updateFile(idx, 'content', e.target.value)}
                      placeholder="File contents..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-[#22D3EE]/50 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Rubric — Code Requirements */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-300">
                  Code Requirements
                  <span className="text-xs text-slate-500 ml-2">(leave empty to keep existing)</span>
                </label>
                <button
                  type="button"
                  onClick={() => addRequirement(setCodeRequirements)}
                  className="text-xs text-[#22D3EE] hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                  </svg>
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {codeRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateRequirement(setCodeRequirements, idx, e.target.value)}
                      placeholder="e.g., Uses flexbox for layout"
                      className="flex-1 px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#22D3EE]/50"
                    />
                    {codeRequirements.length > 1 && (
                      <button type="button" onClick={() => removeRequirement(setCodeRequirements, idx)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Rubric — Visual Requirements */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-300">
                  Visual Requirements
                  <span className="text-xs text-slate-500 ml-2">(leave empty to keep existing)</span>
                </label>
                <button
                  type="button"
                  onClick={() => addRequirement(setVisualRequirements)}
                  className="text-xs text-[#22D3EE] hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                  </svg>
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {visualRequirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateRequirement(setVisualRequirements, idx, e.target.value)}
                      placeholder="e.g., Cards are centered on the page"
                      className="flex-1 px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#22D3EE]/50"
                    />
                    {visualRequirements.length > 1 && (
                      <button type="button" onClick={() => removeRequirement(setVisualRequirements, idx)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => navigate(`/groups/${groupId}`)}
                className="px-6 py-2.5 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#22D3EE] text-slate-900 font-bold rounded-lg hover:bg-cyan-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
