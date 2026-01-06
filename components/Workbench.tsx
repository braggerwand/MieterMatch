import React, { useState } from 'react';
import { LandlordData, TenantData, Stats, MatchResult } from '../types';
import { getAUMatching } from '../services/geminiService';
import { sendOfferNotification } from '../services/brevoService';
import { Sparkles, Mail, Phone, Trash2, Home, Users, ArrowRight, CheckCircle, Search } from 'lucide-react';

interface WorkbenchProps {
  landlords: LandlordData[];
  tenants: TenantData[];
  stats: Stats;
  onAddProperty: () => void;
}

const Workbench: React.FC<WorkbenchProps> = ({ landlords, tenants, stats, onAddProperty }) => {
  const [selectedProperty, setSelectedProperty] = useState<LandlordData | null>(landlords[0] || null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifiedTenants, setNotifiedTenants] = useState<string[]>([]);

  const runMatching = async (property: LandlordData) => {
    setLoading(true);
    
    // Nur Profile mit dem Status "Profil aktiv" zur Auswahl anzeigen
    const activeTenants = tenants.filter(t => t.status === 'Profil aktiv');
    
    const results = await Promise.all(
      activeTenants.map(t => getAUMatching(property, t))
    );
    
    setMatches(results.sort((a, b) => b.score - a.score));
    setLoading(false);
  };

  const handleNotify = async (match: MatchResult) => {
    await sendOfferNotification(match.tenant.email, match.tenant.phone, selectedProperty?.propertyTitle || "");
    setNotifiedTenants(prev => [...prev, match.tenant.id]);
    alert("Angebot wurde per E-Mail und SMS via Brevo versendet!");
  };

  return (
    <div className="pt-24 px-8 pb-16 grid lg:grid-cols-[350px_1fr] gap-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Sidebar: Properties */}
      <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Home size={20} className="text-indigo-400" />
            Meine Objekte
          </h2>
          <button 
            onClick={onAddProperty}
            className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            <Sparkles size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {landlords.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-2xl text-gray-500 text-sm">
              Keine Objekte angelegt. Starten Sie eine Analyse.
            </div>
          ) : landlords.map(l => (
            <div 
              key={l.id}
              onClick={() => { setSelectedProperty(l); runMatching(l); }}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                selectedProperty?.id === l.id 
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-600/10' 
                  : 'glass-card border-white/5 hover:border-white/20'
              }`}
            >
              <div className="text-xs text-indigo-400 font-bold mb-1">{l.id}</div>
              <h3 className="font-semibold truncate">{l.propertyTitle}</h3>
              <p className="text-xs text-gray-400 mt-2">{l.rentWarm}€ Warm • {l.sqm}m²</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Aktuelle Mietobjekte:</span>
            <span className="text-white font-bold">{stats.currentProperties}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Mieterprofile gesamt:</span>
            <span className="text-white font-bold">{stats.totalProfiles}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Versendete Angebote:</span>
            <span className="text-white font-bold">{stats.offersSent}</span>
          </div>
        </div>
      </div>

      {/* Main Content: Matching Area */}
      <div className="flex flex-col gap-6 overflow-hidden">
        {!selectedProperty ? (
          <div className="flex-grow flex items-center justify-center glass-card rounded-3xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Search className="text-gray-500" />
              </div>
              <p className="text-gray-400">Wählen Sie ein Objekt aus, um das KI-Matching zu starten.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">{selectedProperty.propertyTitle}</h2>
                <p className="text-gray-400 text-sm">{selectedProperty.zipCode} • {selectedProperty.rooms} Zimmer</p>
              </div>
              <button 
                onClick={() => runMatching(selectedProperty)}
                className="px-6 py-2.5 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-all"
              >
                <Sparkles size={18} />
                Match berechnen
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-400 animate-pulse">KI-Analyse läuft...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="p-12 text-center glass-card rounded-3xl border-dashed border-2 border-white/5">
                  <Users className="mx-auto text-gray-600 mb-4" size={40} />
                  <p className="text-gray-400">Keine aktiven Mieterprofile gefunden, die den Suchkriterien entsprechen.</p>
                  <p className="text-xs text-gray-500 mt-2 italic">Hinweis: Nur Profile mit Status "Profil aktiv" werden hier angezeigt.</p>
                </div>
              ) : (
                matches.map((m, idx) => (
                  <div key={m.tenant.id} className="glass-card p-6 rounded-3xl border-l-4 border-l-indigo-500 flex items-center gap-6 animate-fade-in">
                    <div className="flex flex-col items-center justify-center w-20 h-20 bg-indigo-600/10 rounded-2xl border border-indigo-500/20">
                      <span className="text-xs text-indigo-400 font-bold">MATCH</span>
                      <span className="text-2xl font-black text-indigo-400">{m.score}%</span>
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-white/5 text-gray-400 text-[10px] rounded font-mono">{m.tenant.id}</span>
                        <h4 className="font-bold text-lg">Mietinteressent</h4>
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-tighter rounded-full border border-green-500/20">
                          Aktiv
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2 italic mb-3">
                        "{m.tenant.incomeDetails || 'Keine weiteren Details'}"
                      </p>
                      <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1 text-gray-400">
                          <CheckCircle size={14} className="text-green-500" />
                          Einkommen: {new Intl.NumberFormat('de-DE').format(m.tenant.householdIncome)}€ Netto
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Users size={14} className="text-blue-400" />
                          Mind. {m.tenant.minRooms} Zimmer
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleNotify(m)}
                        disabled={notifiedTenants.includes(m.tenant.id)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                          notifiedTenants.includes(m.tenant.id) 
                            ? 'bg-green-600/20 text-green-500 border border-green-500/30' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                        }`}
                      >
                        {notifiedTenants.includes(m.tenant.id) ? (
                          <>Angebot gesendet <CheckCircle size={16}/></>
                        ) : (
                          <>Angebot versenden <ArrowRight size={16}/></>
                        )}
                      </button>
                      <button className="text-[10px] text-gray-500 hover:text-red-400 transition-colors flex items-center justify-center gap-1">
                        <Trash2 size={12} /> Profil ignorieren
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workbench;