import React, { useState } from 'react';
import { LandlordData, TenantData, Stats, MatchResult } from '../types';
import { getAUMatching } from '../services/geminiService';
import { sendOfferNotification } from '../services/brevoService';
import { 
  Sparkles, Mail, Phone, Trash2, Home, Users, ArrowRight, 
  CheckCircle, Search, LayoutDashboard, User, MapPin, Euro, Info, X
} from 'lucide-react';

interface WorkbenchProps {
  landlords: LandlordData[];
  tenants: TenantData[];
  stats: Stats;
  onAddProperty: () => void;
  onClose: () => void;
}

const Workbench: React.FC<WorkbenchProps> = ({ landlords, tenants, stats, onAddProperty, onClose }) => {
  const [activeTab, setActiveTab] = useState<'landlords' | 'tenants'>('landlords');
  const [selectedProperty, setSelectedProperty] = useState<LandlordData | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifiedTenants, setNotifiedTenants] = useState<string[]>([]);

  const runMatching = async (property: LandlordData) => {
    setLoading(true);
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
  };

  return (
    <div className="pt-24 px-8 pb-16 grid lg:grid-cols-[380px_1fr] gap-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Sidebar */}
      <div className="flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
           <h2 className="text-xl font-black uppercase tracking-widest text-indigo-400 flex items-center gap-3">
             <LayoutDashboard size={20} />
             Cockpit
           </h2>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>

        {/* Tab-Switcher */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
          <button 
            onClick={() => setActiveTab('landlords')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'landlords' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Home size={14} /> Objekte
          </button>
          <button 
            onClick={() => setActiveTab('tenants')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'tenants' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Users size={14} /> Profile
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {activeTab === 'landlords' ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Meine Objekte</span>
                <button onClick={onAddProperty} className="text-indigo-400 hover:text-white transition-colors">
                  <Sparkles size={16} />
                </button>
              </div>
              {landlords.length === 0 ? (
                <div className="p-8 text-center glass-card rounded-2xl text-gray-500 text-sm italic">Keine Objekte angelegt.</div>
              ) : landlords.map(l => (
                <div 
                  key={l.id}
                  onClick={() => { setSelectedProperty(l); setSelectedTenant(null); runMatching(l); }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedProperty?.id === l.id ? 'bg-indigo-600/20 border-indigo-500 shadow-lg' : 'glass-card border-white/5 hover:border-white/20'}`}
                >
                  <div className="text-[10px] text-indigo-400 font-black mb-1">{l.id}</div>
                  <h3 className="font-bold truncate text-gray-200">{l.propertyTitle}</h3>
                  <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wider">{l.rentWarm}€ Warm • {l.sqm}m²</p>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Gespeicherte Profile</span>
                <span className="text-indigo-400 font-bold text-[10px]">{tenants.length} Gesamt</span>
              </div>
              {tenants.map(t => (
                <div 
                  key={t.id}
                  onClick={() => { setSelectedTenant(t); setSelectedProperty(null); }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedTenant?.id === t.id ? 'bg-indigo-600/20 border-indigo-500 shadow-lg' : 'glass-card border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-indigo-400 font-black">{t.id}</span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded border border-green-500/20">Aktiv</span>
                  </div>
                  <h3 className="font-bold truncate text-gray-200">Mietinteressent</h3>
                  <p className="text-[10px] text-gray-500 mt-2 line-clamp-1">{t.desiredLocation}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Stats Summary */}
        <div className="pt-6 border-t border-white/5 space-y-2">
           <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
             <span>System Status</span>
             <span className="text-green-500">Online</span>
           </div>
           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
             <div className="w-[85%] h-full bg-indigo-500"></div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-6 overflow-hidden">
        {!selectedProperty && !selectedTenant ? (
          <div className="flex-grow flex items-center justify-center glass-card rounded-[3rem] border-white/5">
            <div className="text-center space-y-6 max-w-md px-8">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-indigo-500/20">
                <LayoutDashboard className="text-indigo-400" size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-3">Willkommen im Cockpit</h3>
                <p className="text-gray-400 leading-relaxed">Wählen Sie ein Objekt für das KI-Matching oder einen Interessenten aus der Liste links aus, um Details anzuzeigen.</p>
              </div>
            </div>
          </div>
        ) : selectedTenant ? (
          /* Detailansicht Mietinteressent */
          <div className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar space-y-8 animate-fade-in">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-3xl font-black text-white">Profil: {selectedTenant.id}</h2>
                   <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase rounded-lg border border-indigo-500/20 tracking-widest">Mietinteressent</span>
                      <span className="text-gray-500 text-xs italic">Registriert am: {new Date(selectedTenant.createdAt).toLocaleDateString('de-DE')}</span>
                   </div>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
                   <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                     <MapPin size={16} /> Wohnwünsche
                   </h4>
                   <div className="space-y-4">
                      <div>
                         <span className="text-[10px] text-gray-500 uppercase font-black">Wunschort</span>
                         <p className="text-gray-200 font-bold">{selectedTenant.desiredLocation}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <span className="text-[10px] text-gray-500 uppercase font-black">Größe</span>
                            <p className="text-gray-200 font-bold">{selectedTenant.minSqm} m²</p>
                         </div>
                         <div>
                            <span className="text-[10px] text-gray-500 uppercase font-black">Zimmer</span>
                            <p className="text-gray-200 font-bold">{selectedTenant.minRooms}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
                   <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                     <Euro size={16} /> Finanzen & Beruf
                   </h4>
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <span className="text-[10px] text-gray-500 uppercase font-black">Netto-Einkommen</span>
                            <p className="text-gray-200 font-bold">{new Intl.NumberFormat('de-DE', {style:'currency', currency:'EUR'}).format(selectedTenant.householdIncome)}</p>
                         </div>
                         <div>
                            <span className="text-[10px] text-gray-500 uppercase font-black">Max. Budget</span>
                            <p className="text-gray-200 font-bold">{selectedTenant.maxRent} €</p>
                         </div>
                      </div>
                      <div>
                         <span className="text-[10px] text-gray-500 uppercase font-black">Berufliche Details</span>
                         <p className="text-gray-200 font-medium italic">"{selectedTenant.incomeDetails}"</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="glass-card p-8 rounded-[3rem] border-white/5">
                <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 mb-6">
                  <User size={16} /> Persönliche Vorstellung
                </h4>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 italic text-gray-300 leading-relaxed">
                   "{selectedTenant.personalIntro || 'Keine Vorstellung hinterlegt.'}"
                </div>
             </div>

             <div className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-wrap gap-12">
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">E-Mail Adresse</h4>
                   <div className="flex items-center gap-2 text-indigo-400 font-bold">
                      <Mail size={16} /> {selectedTenant.email}
                   </div>
                </div>
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Telefonnummer</h4>
                   <div className="flex items-center gap-2 text-indigo-400 font-bold">
                      <Phone size={16} /> {selectedTenant.phone}
                   </div>
                </div>
             </div>
          </div>
        ) : (
          /* Matching Ansicht für ausgewählte Immobilie (bestehende Logik) */
          <div className="flex flex-col h-full overflow-hidden animate-fade-in">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-white">{selectedProperty?.propertyTitle}</h2>
                <p className="text-indigo-400 text-sm font-bold uppercase tracking-wider mt-1">{selectedProperty?.zipCode} • {selectedProperty?.rooms} Zimmer • {selectedProperty?.rentWarm}€ Warm</p>
              </div>
              <button 
                onClick={() => runMatching(selectedProperty!)}
                className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                <Sparkles size={18} /> Match berechnen
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-lg"></div>
                  <p className="text-indigo-400 font-black uppercase tracking-widest animate-pulse">KI-Analyse läuft...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="p-16 text-center glass-card rounded-[3rem] border-dashed border-2 border-white/10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Users className="text-gray-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-300 mb-2">Bereit für Analyse</h3>
                  <p className="text-gray-500 text-sm max-w-xs">Starten Sie die Analyse, um die besten Mieter für dieses Objekt zu finden.</p>
                </div>
              ) : (
                matches.map((m) => (
                  <div key={m.tenant.id} className="glass-card p-6 rounded-[2.5rem] border-l-8 border-l-indigo-600 flex items-center gap-8 group hover:border-white/20 transition-all">
                    <div className="flex flex-col items-center justify-center w-24 h-24 bg-indigo-600/10 rounded-[2rem] border border-indigo-500/20 shadow-inner">
                      <span className="text-[10px] text-indigo-400 font-black uppercase mb-1">Score</span>
                      <span className="text-3xl font-black text-indigo-400">{m.score}%</span>
                    </div>

                    <div className="flex-grow space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-600 font-black tracking-widest">{m.tenant.id}</span>
                        <h4 className="font-black text-white uppercase tracking-tight">Mietinteressent</h4>
                      </div>
                      <p className="text-sm text-gray-300 italic line-clamp-2">"{m.tenant.personalIntro || m.tenant.incomeDetails}"</p>
                      <div className="flex gap-6">
                        <div className="flex flex-col">
                           <span className="text-[9px] text-gray-500 uppercase font-black">Einkommen</span>
                           <span className="text-sm font-bold text-gray-200">{new Intl.NumberFormat('de-DE').format(m.tenant.householdIncome)}€</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] text-gray-500 uppercase font-black">Einkommensart</span>
                           <span className="text-sm font-bold text-gray-200">{m.tenant.incomeType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleNotify(m)}
                        disabled={notifiedTenants.includes(m.tenant.id)}
                        className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          notifiedTenants.includes(m.tenant.id) 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:scale-95'
                        }`}
                      >
                        {notifiedTenants.includes(m.tenant.id) ? "Gesendet" : "Angebot senden"}
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