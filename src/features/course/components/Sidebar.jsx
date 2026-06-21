import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ isExpanded }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/groups' && location.pathname.startsWith('/groups')) return true;
    return location.pathname === path;
  };

  const navItems = [
    {
      name: 'Curriculum',
      path: '/course-map',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      name: 'Playground',
      path: '/playground',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )
    },
    {
      name: 'Groups',
      path: '/groups',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
  ];

  return (
    <aside
      className={`h-[calc(100vh-64px)] bg-[#0E1726]/90 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between py-4 transition-all duration-300 ease-in-out select-none flex-shrink-0 z-40 ${isExpanded ? 'w-60' : 'w-16'
        }`}
    >
      <div className="flex flex-col gap-6">
        {/* NAVIGATION ITEMS */}
        <nav className="flex flex-col gap-1.5 px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 py-3 px-3 rounded-lg font-medium text-sm transition-all duration-200 relative group overflow-hidden ${active
                  ? 'bg-[#22D3EE]/10 text-[#22D3EE]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
              >
                {/* Left Active Border indicator */}
                {active && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#22D3EE] rounded-r" />
                )}

                {/* Icon */}
                <div className={`transition-colors duration-200 ${active ? 'text-[#22D3EE]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </div>

                {/* Text Label */}
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${isExpanded
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-4 pointer-events-none absolute'
                    }`}
                >
                  {item.name}
                </span>

                {/* Collapsed Tooltip helper */}
                {!isExpanded && (
                  <div className="absolute left-16 bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-slate-800 whitespace-nowrap shadow-xl">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER BADGE / LABELS */}
      {isExpanded && (
        <div className="px-6 text-center text-[10px] text-slate-500 font-medium tracking-wider uppercase">
          Hello, World!
        </div>
      )}
    </aside>
  );
}
