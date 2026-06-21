import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ showSidebarToggle = false, onToggleSidebar, showBackButton = false, children }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="relative flex items-center justify-between py-4 px-8 border-b border-white/5 bg-[#0B1326] w-full z-50 overflow-hidden">
      {/* SVG Wave Background Overlay */}
      <div className="absolute top-0 left-0 h-full w-[280px] sm:w-[360px] md:w-[440px] -z-10 pointer-events-none select-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 520 72"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Deep Blue/Cyan Base Gradient */}
            <linearGradient id="blue-base" x1="0" y1="0" x2="440" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B1326" />
              <stop offset="25%" stopColor="#0F2C59" />
              <stop offset="70%" stopColor="#1E3A8A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
            </linearGradient>

            {/* Semi-transparent White Highlight Gradient */}
            <linearGradient id="white-mid" x1="0" y1="0" x2="440" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Metallic Grey Accent Gradient */}
            <linearGradient id="grey-accent" x1="0" y1="0" x2="440" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#475569" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#334155" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1E293B" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Layer 1: Metallic Grey Accent Layer */}
          <path d="M0 0 H 520 C 410 0, 290 72, 180 72 H 0 Z" fill="url(#grey-accent)" />
          <path d="M520 0 C 410 0, 290 72, 180 72 H 0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {/* Layer 2: Deep Blue/Cyan Base Layer */}
          <path d="M0 0 H 480 C 380 0, 260 72, 160 72 H 0 Z" fill="url(#blue-base)" />
          <path d="M480 0 C 380 0, 260 72, 160 72 H 0" stroke="rgba(34,211,238,0.25)" strokeWidth="1.5" />

          {/* Layer 3: Semi-transparent White Highlight Layer */}
          <path d="M0 0 H 440 C 350 0, 230 72, 140 72 H 0 Z" fill="url(#white-mid)" />
          <path d="M440 0 C 350 0, 230 72, 140 72 H 0" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        </svg>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 active:bg-slate-900 transition-all focus:outline-none flex items-center justify-center mr-1"
            title="Go Back"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {showSidebarToggle && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 active:bg-slate-900 transition-all focus:outline-none"
            title="Toggle Sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl font-black tracking-tighter text-[#22D3EE] hover:opacity-90 transition-opacity">
            DevDive
          </Link>
          {children}
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        {/* Moon Button, Commented Out for Now */}
        {/* <button className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button> */}
        {user ? (
          <Link
            to="/profile"
            className="w-10 h-10 bg-slate-800/80 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors border border-slate-700 hover:border-[#22D3EE]/50 group"
            title="Profile"
          >
            <svg className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        ) : (
          <Link
            to="/login"
            className="bg-[#22D3EE] text-slate-900 font-bold text-sm px-6 py-2 rounded-full hover:bg-cyan-300 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
