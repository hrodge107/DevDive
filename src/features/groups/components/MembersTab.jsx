import { useEffect, useState } from 'react';
import { fetchMembers, updateMemberStatus, removeMember } from '../../../services/groupService';
import RemoveMemberModal from './RemoveMemberModal';

export default function MembersTab({ groupId, ownerId }) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);

  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMembers(groupId);
        setMembers(data);
      } catch (e) {
        setError('Failed to load members.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadMembers();
  }, [groupId]);

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      await updateMemberStatus(groupId, userId, 'active');
      setMembers(prev => prev.map(m =>
        m.user_id === userId ? { ...m, status: 'active' } : m
      ));
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    try {
      await updateMemberStatus(groupId, userId, 'removed');
      setMembers(prev => prev.filter(m => m.user_id !== userId));
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    const userId = memberToRemove.user_id;
    setMemberToRemove(null);
    setActionLoading(userId);
    try {
      await removeMember(groupId, userId);
      setMembers(prev => prev.filter(m => m.user_id !== userId));
    } catch (err) {
      console.error('Failed to remove:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingMembers = members.filter(m => m.status === 'pending');
  const activeMembers = members.filter(m => m.status === 'active');

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#22D3EE]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-center py-16">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Pending Requests */}
      {pendingMembers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            Pending Requests ({pendingMembers.length})
          </h3>
          <div className="space-y-2">
            {pendingMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between bg-slate-900/40 border border-amber-500/20 rounded-xl px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 font-bold text-sm">
                    {(member.profiles?.username || member.profiles?.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {member.profiles?.username || member.profiles?.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500">{member.profiles?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(member.user_id)}
                    disabled={actionLoading === member.user_id}
                    className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(member.user_id)}
                    disabled={actionLoading === member.user_id}
                    className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Members */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Active Members ({activeMembers.length})
        </h3>
        {activeMembers.length === 0 ? (
          <p className="text-slate-500 text-sm py-8 text-center">No active members yet.</p>
        ) : (
          <div className="space-y-2">
            {activeMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-xl px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#22D3EE]/10 rounded-full flex items-center justify-center text-[#22D3EE] font-bold text-sm">
                    {(member.profiles?.username || member.profiles?.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {member.profiles?.username || member.profiles?.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500">{member.profiles?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMemberToRemove(member)}
                  disabled={actionLoading === member.user_id}
                  className="px-3 py-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 border border-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {memberToRemove && (
        <RemoveMemberModal
          member={memberToRemove}
          isOwner={memberToRemove.user_id === ownerId}
          onConfirm={handleConfirmRemove}
          onCancel={() => setMemberToRemove(null)}
        />
      )}
    </div>
  );
}
