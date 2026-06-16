import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/contexts/AuthContext';
import Header from '../../../core/components/Header';
import Footer from '../../../core/components/Footer';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col selection:bg-[#22D3EE]/30">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22D3EE]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-[#131A2B] rounded-2xl border border-white/10 p-8 relative z-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-[#0F172A] border-2 border-[#22D3EE] rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-[#22D3EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-center text-white">
              {user.user_metadata?.username || 'User'}
            </h2>
            <p className="text-slate-400 text-center mt-1">{user.email}</p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full bg-slate-800 text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
          >
            Sign Out
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
