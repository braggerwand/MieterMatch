import React from 'react';
import { UserRole, Stats } from '../types';
import { ShieldCheck, Users, Search, Mail, Smartphone, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onStart: (role: UserRole) => void;
  stats: Stats;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, stats }) => {
  return (
    <div className="pt-24 pb-16 px-4">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center mb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] -z-10 rounded-full"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-semibold mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          KI-Unterstützung für Dateneingabe und Matching
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
          Wir bringen <br />
          <span className="text-indigo-500">Mietinteressent</span> & <span className="text-blue-500">Vermieter</span> <br />
          zusammen!
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Lassen Sie Ihre Mietangebote zu sich kommen. <br /><br />
          oder <br /><br />
          Wählen Sie Ihren passenden Mieter.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={() => onStart(UserRole.TENANT)}
            className="w-full sm:min-w-[240px] px-8 py-4 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-center"
          >
            Mietinteressent
          </button>
          <button 
            onClick={() => onStart(UserRole.LANDLORD)}
            className="w-full sm:min-w-[240px] px-8 py-4 bg-blue-500 hover:bg-blue-400 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-center"
          >
            Vermieter
          </button>
        </div>
      </div>

      {/* Feature Section */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
        {/* Mieter Vorteile */}
        <div className="glass-card p-10 rounded-3xl border-indigo-500/20">
          <h3 className="text-2xl font-bold mb-6 text-indigo-400">Vorteile für Mietinteressenten</h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Sparen Sie sich den Aufwand und den Ärger mit der traditionellen Objektsuche. Erhöhen Sie Ihre Chancen auf ein neues Zuhause.
          </p>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
              <span>Exklusiver Kontakt (max. 5 Interessenten pro Objekt)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
              <span>Top-aktuelle Angebote vor Veröffentlichung</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
              <span>Keine Massenbesichtigungen</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
              <span>Schneller, direkter Kontakt zum Ansprechpartner</span>
            </li>
          </ul>
        </div>

        {/* Vermieter Vorteile */}
        <div className="glass-card p-10 rounded-3xl border-blue-500/20">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <h3 className="text-2xl font-bold text-blue-400">Vorteile für Vermieter</h3>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
              Kostenlos
            </span>
          </div>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Sparen Sie sich den Aufwand und den Ärger mit der traditionellen Mietersuche. Keine TOP-Mieter mehr verpassen.
          </p>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
              <span>Sie wählen vorab schon Ihren Wunschmieter aus</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
              <span>Keine unübersichtliche Bewerberflut</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
              <span>Keine Portal- oder Maklerkosten</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
              <span>Einfach und schnell den passenden Mieter finden</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Proof of Concept Stats Grid */}
      <div className="max-w-7xl mx-auto mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Kachel 1: Anzahl angebotener Objekte */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-600/20 to-violet-900/40 border border-violet-500/30 backdrop-blur-md">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-violet-300 mb-4 opacity-70">Anzahl angebotener Objekte</h5>
            <div className="text-4xl font-black text-white">{stats.totalProperties}</div>
          </div>
          {/* Kachel 2: Anzahl versendete Angebote */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-600/20 to-cyan-900/40 border border-cyan-500/30 backdrop-blur-md">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-cyan-300 mb-4 opacity-70">Anzahl versendete Angebote</h5>
            <div className="text-4xl font-black text-white">{stats.offersSent}</div>
          </div>
          {/* Kachel 3: Anzahl Mieterprofile */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 to-blue-900/40 border border-blue-500/30 backdrop-blur-md">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-4 opacity-70">Anzahl Mieterprofile</h5>
            <div className="text-4xl font-black text-white">{stats.totalProfiles}</div>
          </div>
          {/* Kachel 4: Aktuelle Mieterprofile */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-indigo-900/40 border border-indigo-500/30 backdrop-blur-md">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-4 opacity-70">Aktuelle Mieterprofile</h5>
            <div className="text-4xl font-black text-white">{stats.currentProfiles}</div>
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <ShieldCheck className="mx-auto text-indigo-500" size={48} />
          <h3 className="text-3xl font-bold">Schutz Ihrer persönlichen Daten</h3>
          <p className="text-gray-400 leading-relaxed">
            Wir speichern keine unnötiger persönlicher Daten wie z.B. den Namen. Es geht bei uns nur um die "HardFacts".
            <br /><br />
            Sie können Ihr Profil jederzeit abbestellen und alle Daten löschen.
          </p>
        </div>

        <div className="space-y-4">
          <Users className="mx-auto text-indigo-500" size={48} />
          <h3 className="text-3xl font-bold">Keine Diskriminierung</h3>
          <p className="text-gray-400 leading-relaxed">
            Auf Grund der Massen an Bewerbungen (teilweise über 100 in wenigen Stunden) sortieren Vermieter oft erst einmal nach dem Namen aus und lassen sich dadurch die Chance auf einen TOP-Mieter entgehen.
            <br /><br />
            Bei uns sind keine Namen gespeichert. Wir fördern Chancengleichheit durch faktenbasiertes Matching.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;