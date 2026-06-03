import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full py-8 px-8 border-t border-white/5 bg-[#020617]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] tracking-widest uppercase font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-[#22D3EE] font-black text-xs">DEV DIVE</span>
          <span>© 2026 DEV DIVE. LEARN. BUILD. DIVE IN.</span>
        </div>

        <div className="flex items-center gap-8">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
