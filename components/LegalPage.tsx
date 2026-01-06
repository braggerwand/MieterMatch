import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe, Info, Activity } from 'lucide-react';

interface LegalPageProps {
  onClose: () => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ onClose }) => {
  const [ipAddress, setIpAddress] = useState<string>('Lade...');

  useEffect(() => {
    // Abrufen der öffentlichen IP-Adresse beim Laden der Seite
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        setIpAddress('Nicht ermittelbar');
      }
    };
    fetchIp();
  }, []);

  return (
    <div className="pt-24 px-8 pb-16 max-w-4xl mx-auto">
      <button 
        onClick={onClose}
        className="mb-8 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Zurück zur Startseite
      </button>

      <div className="glass-card p-12 rounded-3xl space-y-16 animate-fade-in shadow-2xl">
        {/* Impressum Section */}
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Impressum</h1>
          <div className="grid md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-xl font-bold mb-4 text-indigo-400">Angaben gemäß § 5 TMG</h2>
              <p className="text-gray-400 leading-relaxed">
                Kiefer & Kollegen<br />
                Kanzlei für Immobilienbewertung<br />
                Musterstraße 123<br />
                10115 Berlin
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold mb-4 text-indigo-400">Kontakt</h2>
              <p className="text-gray-400 leading-relaxed">
                Telefon: +49 (0) 30 12345678<br />
                E-Mail: kontakt@property-mind.online
              </p>
            </section>
          </div>
          <section className="mt-8 pt-8 border-t border-white/5">
            <h2 className="text-xl font-bold mb-4 text-indigo-400">Redaktionell verantwortlich</h2>
            <p className="text-gray-400">Dipl.-Kfm. Thomas Kiefer</p>
          </section>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 w-full"></div>

        {/* Datenschutz Section */}
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Datenschutz</h1>
          <p className="mb-8 text-gray-300 text-lg">
            Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Bei PropertyMind.online speichern wir standardmäßig keine Namen.
          </p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 text-indigo-400">1. Datenerhebung</h2>
              <p className="text-gray-400 leading-relaxed">
                Wir erheben ausschließlich Daten, die für das Matching relevant sind (Einkommen, Personenanzahl, Objektmerkmale). 
                E-Mail und Telefonnummer dienen ausschließlich dem direkten Erstkontakt über gesicherte Kanäle.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4 text-indigo-400">2. KI-Matching</h2>
              <p className="text-gray-400 leading-relaxed">
                Ihre Daten werden anonymisiert verarbeitet, um die Passgenauigkeit zu bewerten. Eine Weitergabe an Dritte zu Werbezwecken findet nicht statt. Unser System nutzt modernste Verschlüsselungstechnologien.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4 text-indigo-400">3. Ihre Rechte</h2>
              <p className="text-gray-400 leading-relaxed">
                Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten. Sie können jederzeit die Löschung Ihres Profils verlangen. Kontaktieren Sie uns hierzu einfach per E-Mail.
              </p>
            </section>
          </div>
        </div>

        {/* IP-Adresse / System-Transparenz Section */}
        <div className="h-px bg-white/5 w-full"></div>

        <div className="prose prose-invert max-w-none">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
              <Globe className="text-indigo-400" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1">System-Transparenz</h1>
              <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                <Activity size={12} className="animate-pulse" /> Echtzeit-Diagnose
              </div>
            </div>
          </div>

          <section className="glass-card p-8 rounded-[2rem] border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold mb-4 text-indigo-400">Ihre aktuelle IP-Adresse</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Aus Gründen der Sicherheit, zur Verhinderung von Missbrauch und zur Protokollierung von Verifizierungen wird Ihre IP-Adresse bei Zugriff auf unsere Systeme temporär erfasst.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-black/40 rounded-2xl border border-white/10 group hover:border-indigo-500/30 transition-all gap-4">
              <div className="flex items-center gap-3">
                <Info size={16} className="text-indigo-400/50" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Erkannte IP-Adresse</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl md:text-3xl font-mono text-indigo-400 font-black tracking-wider select-all">
                  {ipAddress}
                </span>
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;