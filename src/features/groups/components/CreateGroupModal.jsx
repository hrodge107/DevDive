import { useState } from 'react';
import { createGroup } from '../../../services/groupService';

export default function CreateGroupModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdGroup, setCreatedGroup] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const group = await createGroup(name, description);
      setCreatedGroup(group);
      onCreated(group);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (createdGroup?.join_code) {
      navigator.clipboard.writeText(createdGroup.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0E1726] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            {createdGroup ? 'Group Created!' : 'Create Group'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {createdGroup ? (
            /* Success state — show join code */
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-slate-300 text-sm mb-4">
                  Share this code with members so they can join:
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-mono font-bold text-[#22D3EE] tracking-[0.3em] bg-slate-900/60 px-6 py-3 rounded-xl border border-slate-700">
                    {createdGroup.join_code}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
                    title="Copy code"
                  >
                    {copied ? (
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#22D3EE] text-slate-900 font-bold rounded-lg hover:bg-cyan-300 transition-colors mt-4"
              >
                Done
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="group-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Group Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="group-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Web Dev Study Group"
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]/50 focus:ring-1 focus:ring-[#22D3EE]/30 transition-colors text-sm"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="group-desc" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Description <span className="text-slate-500">(optional)</span>
                </label>
                <textarea
                  id="group-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this group about?"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]/50 focus:ring-1 focus:ring-[#22D3EE]/30 transition-colors text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex-1 py-2.5 bg-[#22D3EE] text-slate-900 font-bold rounded-lg hover:bg-cyan-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
