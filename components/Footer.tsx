import React from 'react';

interface FooterProps {
  onLegal: () => void;
}

const Footer: React.FC<FooterProps> = ({ onLegal }) => {
  return (
    <footer className="bg-black/60 border-t border-white/5 py-8 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-gray-500 text-xs tracking-[0.2em] uppercase">
          © 2026 PropertyMind.online · Future Real Estate Intelligence
        </div>

        <div className="flex gap-6 text-xs text-gray-500 tracking-wider">
          <button 
            onClick={onLegal} 
            className="hover:text-white transition-colors uppercase"
          >
            Impressum & Datenschutz
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;