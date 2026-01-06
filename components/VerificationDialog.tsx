
import React, { useState } from 'react';
import { ShieldCheck, Loader2, ArrowRight, X, AlertTriangle, Info, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

interface VerificationDialogProps {
  onVerify: (code: string) => void;
  onCancel: () => void;
  email: string;
  demoCode?: string;
  errorDetails?: {
    type?: string;
    message?: string;
  };
}

const VerificationDialog: React.FC<VerificationDialogProps> = ({ onVerify, onCancel, email, demoCode, errorDetails }) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      setIsVerifying(true);
      setTimeout(() => {
        onVerify(code);
        setIsVerifying(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="glass-card w-full max-w-md rounded-[3rem] p-10 border-indigo-500/20 relative shadow-2xl">
        <button onClick={onCancel} className="absolute top-6 right-6 text-gray-500 hover:text-white">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
            <ShieldCheck className={`text-indigo-400 ${demoCode ? 'animate-pulse' : ''}`} size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2">Code bestätigen</h2>
          
          {demoCode && (
            <div className="mb-4 text-left">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                    <AlertTriangle size={14} /> Demo-Modus aktiv
                  </div>
                  <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-amber-500/60 hover:text-amber-500 flex items-center gap-1 text-[9px] font-bold uppercase transition-colors"
                  >
                    {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    Details
                  </button>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  E-Mail Versand simulierte. Bitte nutzen Sie:
                </p>
                <div className="text-3xl font-black text-white text-center tracking-[0.4em] bg-black/30 py-3 rounded-xl border border-white/5 shadow-inner">
                  {demoCode}
                </div>

                {showDetails && (
                  <div className="mt-4 pt-4 border-t border-amber-500/10 animate-fade-in">
                    <div className="flex items-center gap-2 text-[9px] font-black text-amber-500/70 uppercase mb-2">
                      <Terminal size={12} /> Diagnose für Lead Developer
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-amber-200/80 space-y-1">
                      <p><span className="text-amber-500">Status:</span> 403 / CORS_BLOCKED</p>
                      <p><span className="text-amber-500">Grund:</span> Browser-Sicherheit blockiert Brevo API direkt.</p>
                      <p><span className="text-amber-500">Lösung:</span> Backend-Integration (Python) erforderlich.</p>
                      {errorDetails?.message && <p className="mt-2 text-white italic">Info: {errorDetails.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!demoCode && (
            <p className="text-gray-400 text-sm leading-relaxed">
              Wir haben einen 6-stelligen Code an <br />
              <span className="text-indigo-400 font-bold">{email}</span> gesendet.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="text"
            maxLength={6}
            placeholder="000000"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-4xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-800 text-white"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />

          <button 
            type="submit"
            disabled={code.length !== 6 || isVerifying}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 rounded-2xl font-black text-white shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            {isVerifying ? <Loader2 className="animate-spin" /> : <>Code bestätigen <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-gray-500 uppercase tracking-widest font-black">
          {demoCode ? "Produktive E-Mails nur via Backend" : "Nichts erhalten? Bitte Spam-Ordner prüfen."}
        </p>
      </div>
    </div>
  );
};

export default VerificationDialog;
