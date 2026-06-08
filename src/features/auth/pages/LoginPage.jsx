import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import Header from '../../../core/components/Header';
import Footer from '../../../core/components/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/course-map');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col selection:bg-[#22D3EE]/30">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22D3EE]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-[#131A2B] rounded-2xl border border-white/10 p-8 relative z-10 shadow-2xl">
          <h2 className="text-3xl font-bold mb-2 text-center text-white">Welcome Back</h2>
          <p className="text-slate-400 text-center mb-8">Sign in to continue your journey</p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#22D3EE] transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#22D3EE] transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22D3EE] text-[#003546] font-bold py-3 rounded-lg mt-6 hover:bg-cyan-300 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account? <Link to="/signup" className="text-[#22D3EE] hover:underline">Sign up</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
