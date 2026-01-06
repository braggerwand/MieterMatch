import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onClose: () => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ onClose }) => {
  return (
    <div className="pt-24 px-8 pb-16 max-w-4xl mx-auto">
      <button 
        onClick={onClose}
        className="mb-8 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <ArrowLeft size={20} /> Zurück zur Startseite
      </button>

      <div className="glass-card p-12 rounded-3xl space-y-16">
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
      </div>
    </div>
  );
};

export default LegalPage;