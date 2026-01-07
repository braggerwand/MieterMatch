
import React from 'react';
import { Home } from 'lucide-react';

interface NavbarProps {
  onHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onHome }) => {
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
    </nav>
  );
};

export default Navbar;
