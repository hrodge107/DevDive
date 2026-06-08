import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="flex items-center justify-between py-4 px-8 border-b border-white/5 bg-transparent w-full z-50">
      <div className="flex items-center gap-12">
        <Link to="/" className="text-2xl font-black tracking-tighter text-[#22D3EE]">
          DevDive
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link
            to="/course-map"
            className={`hover:text-white transition-colors relative ${currentPath === '/course-map' ? 'text-white' : ''
              }`}
          >
            Curriculum
            {currentPath === '/course-map' && (
              <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#22D3EE]" />
            )}
          </Link>
          <Link to="/about" className="hover:text-white transition-colors">
            About
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* Moon Button, Commented Out for Now */}
        {/* <button className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button> */}
        {user ? (
          <button
            onClick={handleSignOut}
            className="bg-slate-800 text-slate-300 font-bold text-sm px-6 py-2 rounded-full hover:bg-slate-700 transition-colors"
          >
            Sign Out
          </button>
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
