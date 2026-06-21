import { useState } from 'react';
import { joinGroupByCode } from '../../../services/groupService';

export default function JoinGroupModal({ onClose, onJoined }) {
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await joinGroupByCode(joinCode.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
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
          <h2 className="text-lg font-bold text-white">Join Group by Code</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Request Sent!</h3>
                <p className="text-slate-400 text-sm">
                  Your join request is pending. The group owner will approve or deny it.
                </p>
              </div>
              <button
                onClick={() => { onJoined(); onClose(); }}
                className="w-full py-2.5 bg-[#22D3EE] text-slate-900 font-bold rounded-lg hover:bg-cyan-300 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="join-code" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Join Code <span className="text-red-400">*</span>
                </label>
                <input
                  id="join-code"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]/50 focus:ring-1 focus:ring-[#22D3EE]/30 transition-colors text-center text-2xl font-mono tracking-[0.3em] font-bold"
                  required
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1.5">Ask your group owner for the code.</p>
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
                  disabled={isSubmitting || joinCode.length < 6}
                  className="flex-1 py-2.5 bg-[#22D3EE] text-slate-900 font-bold rounded-lg hover:bg-cyan-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Joining...' : 'Request to Join'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
