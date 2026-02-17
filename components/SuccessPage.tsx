import React from 'react';
import { CheckCircle, ArrowRight, PartyPopper, Info } from 'lucide-react';

interface SuccessPageProps {
  onFinish: () => void;
  type?: 'profile' | 'offer';
}

const SuccessPage: React.FC<SuccessPageProps> = ({ onFinish, type = 'profile' }) => {
  const isOffer = type === 'offer';

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 bg-[#05070a] flex items-center justify-center animate-fade-in">
      <div className="max-w-3xl w-full text-center">
        <div className="glass-card p-12 md:p-16 rounded-[3.5rem] border-indigo-500/20 relative overflow-hidden shadow-2xl shadow-indigo-600/10">
          {/* Dekorative Elemente */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/20 blur-[100px] -z-10 rounded-full"></div>
          
          <div className="mb-10 relative">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/20 relative z-10">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-500/40 blur-2xl opacity-50"></div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Glückwunsch!
          </h1>
          
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-indigo-400">
              {isOffer ? "Ihr Angebot wurde gespeichert" : "Ihr Profil wurde gespeichert"}
            </h2>
            
            <h2 className="text-xl md:text-2xl font-medium text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Sie erhalten jetzt eine Email und, soweit angegeben, eine SMS um Ihre Kontaktdaten zu bestätigen.
            </h2>
          </div>

          <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
              {isOffer 
                ? "Ihr Mietangebot ist dann aktiv und wird dem Mietinteressenten zur Bestätigung übermittele. Er wird sich dann bei Ihnen melden wenn er Interesse an Ihrer Immobilie hat um einen Besichtigungstermin zu vereinbaren."
                : "Ihr Profil für die Objektsuche ist dann aktiv und wird dem Anbieter zur Auswahl angezeigt, sobald ein Objekt eingestellt wird, das Ihren Vorgaben entspricht."
              }
            </h1>
          </div>

          <p className="text-gray-400 text-sm mb-12 flex items-center justify-center gap-2 italic">
            <Info size={14} className="text-indigo-400" />
            {isOffer ? "Sie können Ihre Daten jederzeit ändern oder löschen." : "Sie können Ihr Mieterprofil jederzeit ändern oder löschen"}
          </p>

          <button 
            onClick={onFinish}
            className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-white shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            {isOffer 
              ? "Beenden und Angebot per EMail oder SMS zum Versand an den Mietinteressenten bestätigen"
              : "Beenden und Profil per EMail oder SMS zur Aktivierung bestätigen"
            }
            <ArrowRight size={20} />
          </button>
        </div>
        
        <p className="mt-8 text-gray-500 text-sm flex items-center justify-center gap-2">
          <PartyPopper size={16} /> 
          {isOffer ? "Viel Erfolg bei Ihrer Mietersuche!" : "Viel Erfolg bei Ihrer Wohnungssuche!"}
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;