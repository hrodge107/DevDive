import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../core/components/Header';
import Sidebar from '../../course/components/Sidebar';
import { useAuth } from '../../../core/contexts/AuthContext';
import { fetchGroup, deleteGroup as deleteGroupApi } from '../../../services/groupService';
import MembersTab from '../components/MembersTab';
import TasksTab from '../components/TasksTab';
import ReportDashboard from '../components/ReportDashboard';
import MemberTasksView from '../components/MemberTasksView';

export default function RoomPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Role determination
  const isOwner = group?.owner_id === user?.id;

  // Tab state
  const [ownerTab, setOwnerTab] = useState('members');
  const [memberTab, setMemberTab] = useState('ongoing');

  useEffect(() => {
    if (!user || !groupId) return;
    const loadGroup = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchGroup(groupId);
        setGroup(data);
      } catch (e) {
        console.error('Failed to load group:', e);
        setError('Group not found or access denied.');
      } finally {
        setIsLoading(false);
      }
    };
    loadGroup();
  }, [user, groupId]);

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    try {
      await deleteGroupApi(groupId);
      navigate('/groups');
    } catch (err) {
      console.error('Failed to delete group:', err);
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Sign in to access this group.</p>
        </div>
      </div>
    );
  }

  const ownerTabs = [
    { id: 'members', label: 'Members' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'report', label: 'Report' },
  ];

  const memberTabs = [
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' },
  ];

  const activeTabs = isOwner ? ownerTabs : memberTabs;
  const activeTab = isOwner ? ownerTab : memberTab;
  const setActiveTab = isOwner ? setOwnerTab : setMemberTab;

  return (
    <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col overflow-hidden selection:bg-[#22D3EE]/30">
      <Header
        showSidebarToggle={true}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />

      <div className="flex flex-1 relative w-full overflow-hidden">
        <Sidebar isExpanded={isSidebarExpanded} />

        <main className="flex-1 relative overflow-y-auto h-[calc(100vh-64px)]">
          {isLoading ? (
            <div className="flex justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => navigate('/groups')}
                className="text-sm text-[#22D3EE] hover:underline"
              >
                ← Back to Groups
              </button>
            </div>
          ) : group ? (
            <div className="pb-24">
              {/* Room Header */}
              <section className="pt-10 pb-6 px-4 sm:px-8 max-w-5xl mx-auto">
                <button
                  onClick={() => navigate('/groups')}
                  className="text-sm text-slate-400 hover:text-[#22D3EE] transition-colors mb-4 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Groups
                </button>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">{group.name}</h1>
                    {group.description && (
                      <p className="text-slate-400 text-sm">{group.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {group.member_count} members
                      </span>
                      {isOwner && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded-full">
                          Owner
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Owner actions */}
                  {isOwner && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-500 bg-slate-900/60 border border-slate-700 px-3 py-1.5 rounded-lg font-mono tracking-wider">
                        Code: {group.join_code}
                      </span>
                      <button
                        onClick={handleDeleteGroup}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete Group"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Tab Navigation */}
              <section className="px-4 sm:px-8 max-w-5xl mx-auto mb-6">
                <div className="flex gap-1 bg-slate-900/40 p-1 rounded-xl border border-slate-800 w-fit">
                  {activeTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-[#22D3EE]/10 text-[#22D3EE] shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Tab Content */}
              <section className="px-4 sm:px-8 max-w-5xl mx-auto">
                {isOwner ? (
                  <>
                    {ownerTab === 'members' && <MembersTab groupId={groupId} ownerId={group?.owner_id} />}
                    {ownerTab === 'tasks' && <TasksTab groupId={groupId} />}
                    {ownerTab === 'report' && <ReportDashboard groupId={groupId} />}
                  </>
                ) : (
                  <MemberTasksView groupId={groupId} activeTab={memberTab} />
                )}
              </section>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
