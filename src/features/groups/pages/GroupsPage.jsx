import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../core/components/Header';
import Sidebar from '../../course/components/Sidebar';
import { useAuth } from '../../../core/contexts/AuthContext';
import { fetchGroups } from '../../../services/groupService';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const loadGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchGroups();
        setGroups(data);
      } catch (e) {
        console.error('Failed to load groups:', e);
        setError('Failed to load groups. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadGroups();
  }, [user]);

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    setShowCreateModal(false);
  };

  const handleJoinSuccess = () => {
    setShowJoinModal(false);
    // Refresh groups list
    fetchGroups().then(setGroups).catch(console.error);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[#22D3EE]/10 rounded-2xl flex items-center justify-center mx-auto text-[#22D3EE]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Sign in to access Groups</h2>
            <p className="text-slate-400 text-sm">Create or join study groups after signing in.</p>
            <a href="/login" className="inline-block mt-2 px-6 py-2.5 bg-[#22D3EE] text-slate-900 font-bold rounded-lg hover:bg-cyan-300 transition-colors">
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col overflow-hidden selection:bg-[#22D3EE]/30">
      <Header
        showSidebarToggle={true}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />

      <div className="flex flex-1 relative w-full overflow-hidden">
        <Sidebar isExpanded={isSidebarExpanded} />

        <main className="flex-1 relative overflow-y-auto h-[calc(100vh-64px)]">
          <div className="pb-24">
            {/* Header Section */}
            <section className="pt-16 pb-8 px-4 text-center relative z-10">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 font-serif">
                Groups
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto font-light leading-relaxed">
                Collaborate with peers. Create a group to assign tasks, or join one to sharpen your skills.
              </p>
            </section>

            {/* Content */}
            <section className="px-4 sm:px-8 max-w-5xl mx-auto relative z-10">
              {isLoading ? (
                <div className="flex justify-center py-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                </div>
              ) : error ? (
                <div className="flex justify-center py-32 text-red-400">
                  <p>{error}</p>
                </div>
              ) : (
                <>
                  {/* Existing Groups */}
                  {groups.length > 0 && (
                    <div className="mb-10">
                      <h2 className="text-lg font-semibold text-slate-300 mb-4">Your Groups</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groups.map(group => (
                          <button
                            key={group.id}
                            onClick={() => navigate(`/groups/${group.id}`)}
                            className="group relative bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-left hover:border-[#22D3EE]/40 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer"
                          >
                            {/* Owner badge */}
                            {group.owner_id === user.id && (
                              <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded-full">
                                Owner
                              </span>
                            )}

                            <h3 className="text-white font-semibold text-base mb-1 pr-16 group-hover:text-[#22D3EE] transition-colors">
                              {group.name}
                            </h3>

                            {group.description && (
                              <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                                {group.description}
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {group.member_count} members
                              </span>
                            </div>

                            {/* Hover arrow */}
                            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#22D3EE]">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Create Group Card */}
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-[#22D3EE]/50 hover:from-slate-900/90 hover:to-[#22D3EE]/5 transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-14 h-14 bg-[#22D3EE]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#22D3EE]/20 transition-colors">
                        <svg className="w-7 h-7 text-[#22D3EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1">Create Group</h3>
                      <p className="text-slate-400 text-sm">Start a new group and invite members with a join code.</p>
                    </button>

                    {/* Join Group Card */}
                    <button
                      onClick={() => setShowJoinModal(true)}
                      className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/40 border border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-[#22D3EE]/50 hover:from-slate-900/90 hover:to-[#22D3EE]/5 transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-14 h-14 bg-[#22D3EE]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#22D3EE]/20 transition-colors">
                        <svg className="w-7 h-7 text-[#22D3EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-1">Join Group by Code</h3>
                      <p className="text-slate-400 text-sm">Enter a 6-digit code to request membership.</p>
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleGroupCreated}
        />
      )}
      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onJoined={handleJoinSuccess}
        />
      )}
    </div>
  );
}
