import { Link } from 'react-router-dom';
import { useAuth } from '../../../core/contexts/AuthContext';
import { PlaygroundContainer } from '../components/PlaygroundContainer';

export default function PlaygroundPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-950">
      {/* Minimalist Playground Header */}
      <header className="flex items-center justify-between py-4 px-6 border-b border-gray-800 bg-gray-900 w-full z-50">
        <div className="flex items-center gap-4">
          <Link
            to="/course-map"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group"
            title="Back to Curriculum"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Exit</span>
          </Link>
          <div className="h-4 w-px bg-gray-800" />
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter text-[#22D3EE]">
              DevDive
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              Playground
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/profile"
              className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors border border-slate-700 hover:border-[#22D3EE]/50 group"
              title="Profile"
            >
              <svg className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Playground Editor Container */}
      <PlaygroundContainer />
    </div>
  );
}
