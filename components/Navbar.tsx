
import React from 'react';
import { Home, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  onHome: () => void;
  onWorkbench: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onHome, onWorkbench }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#05070a]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center px-8 justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={onHome}
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
          <Home className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight">MieterMatch</span>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onWorkbench}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-600/30 rounded-xl transition-all group"
        >
          <LayoutDashboard size={18} className="text-indigo-400 group-hover:text-white" />
          <span className="text-sm font-bold text-indigo-400 group-hover:text-white">Cockpit</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
