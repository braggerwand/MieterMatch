
import React, { useState, useMemo, useEffect } from 'react';
import { LandlordData, TenantData } from '../types';
import { CheckCircle, Info, User, CheckSquare, Square, ArrowLeft } from 'lucide-react';

interface TenantSelectionPageProps {
  landlord: LandlordData;
  tenants: TenantData[];
  onConfirm: (selectedTenantIds: string[]) => void;
  onCancel: () => void;
}

const TenantSelectionPage: React.FC<TenantSelectionPageProps> = ({ landlord, tenants, onConfirm, onCancel }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sicherstellen, dass die Seite beim Laden ganz oben beginnt
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Matching-Logik (Optimiert nach PO-Vorgaben)
  const scoredTenants = useMemo(() => {
    const landlordZip = landlord.zipCode?.toLowerCase() || "";
    const landlordAddr = landlord.address?.toLowerCase() || "";

    return tenants
      .filter(t => {
        if (t.status !== 'Profil aktiv') return false;

        // REGEL 1 (Priorität 1): Lage
        // Die Region muss übereinstimmen (PLZ im Wunschort oder Wunschort in Adresse)
        const tenantLoc = t.desiredLocation.toLowerCase();
        const locationMatch = (landlordZip !== "unbekannt" && tenantLoc.includes(landlordZip)) || 
                             landlordAddr.includes(tenantLoc) ||
                             tenantLoc.split(',').some(part => landlordAddr.includes(part.trim()));
        
        if (!locationMatch) return false;

        // REGEL 2 (Priorität 2): Gesamtmiete (Max 10% über Budget)
        const maxRentAllowed = t.maxRent * 1.1;
        if (landlord.rentWarm > maxRentAllowed) return false;

        // REGEL 3 (Priorität 3): Wohnfläche (Max 10% unter Mindestmaß)
        const minSqmAllowed = t.minSqm * 0.9;
        if (landlord.sqm < minSqmAllowed) return false;

        // REGEL 4 (Priorität 4): Zimmer (Mindestanzahl)
        if (landlord.rooms < t.minRooms) return false;

        return true;
      })
      .map(tenant => {
        let score = 60; // Basis-Score für erfüllte harte Kriterien

        // Fein-Scoring (Einfluss auf die Sortierung)
        
        // Bonus für Miete innerhalb oder unter Budget
        if (landlord.rentWarm <= tenant.maxRent) score += 10;
        
        // Bonus für Fläche über Mindestmaß
        if (landlord.sqm >= tenant.minSqm) score += 5;

        // Bonus für zusätzliche Zimmer
        if (landlord.rooms > tenant.minRooms) score += 5;

        // Weitere Angaben (Regel 5: Unwichtig für Filter, aber relevant für Score)
        // EBK Abgleich
        const landlordHasKitchen = landlord.kitchenDetails.toLowerCase().includes('ja');
        const tenantWantsKitchen = tenant.kitchenIncluded.toLowerCase().includes('ja');
        if (landlordHasKitchen === tenantWantsKitchen) score += 5;

        // Balkon/Garten Abgleich
        const landlordHasOutdoor = landlord.gardenOrBalcony.toLowerCase() !== 'nein';
        const tenantWantsOutdoor = tenant.gardenOrBalcony.toLowerCase() !== 'nein' && tenant.gardenOrBalcony.toLowerCase() !== 'egal';
        if (landlordHasOutdoor && tenantWantsOutdoor) score += 10;

        // Parkplatz Abgleich
        const landlordHasParking = landlord.parkingDetails.toLowerCase() !== 'nein';
        const tenantNeedsParking = tenant.parkingNeeded.toLowerCase() !== 'nein' && tenant.parkingNeeded.toLowerCase() !== 'egal';
        if (landlordHasParking && tenantNeedsParking) score += 5;

        return { tenant, score: Math.min(score, 100) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 25);
  }, [landlord, tenants]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 10) {
        alert("Sie können maximal 10 Mietinteressenten auswählen.");
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 bg-[#05070a] animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          {/* Optimierte Navigations-Zeile oben rechts */}
          <div className="flex justify-end mb-6">
            <button 
              onClick={onCancel}
              className="group flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all shadow-xl hover:shadow-indigo-500/5 active:scale-95"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">
                Zurück
              </span>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                <ArrowLeft size={18} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </button>
          </div>

          <div className="text-center">
            <br />
            <h1 className="text-4xl md:text-5xl font-black text-blue-500 mb-4 tracking-tight">
              Mietinteressenten für Ihre Immobilie
            </h1>
            <h2 className="text-xl text-gray-400 font-medium px-12">
              Wählen Sie jetzt die Mietinteressenten aus denen Sie Ihre Immobilie zum mieten anbieten wollen:
            </h2>
          </div>
        </header>

        <div className="space-y-6">
          {scoredTenants.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-[2.5rem] border-dashed border-2 border-white/10">
              <p className="text-gray-500">Aktuell keine passenden aktiven Profile gefunden, die Ihren Kriterien (Lage, Miete, Fläche, Zimmer) entsprechen.</p>
            </div>
          ) : (
            scoredTenants.map(({ tenant, score }) => {
              const isSelected = selectedIds.includes(tenant.id);
              return (
                <div key={tenant.id} className="flex gap-0 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                  
                  {/* Linke Spalte: Profilfoto */}
                  <div className="w-[180px] bg-white/5 flex-shrink-0 relative group">
                    {tenant.profileImage ? (
                      <img src={tenant.profileImage} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-500/10">
                        <User size={60} className="text-indigo-400/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-indigo-600 rounded-lg text-[10px] font-black text-white shadow-lg">
                      {score}% Match
                    </div>
                  </div>

                  {/* Mittlere Spalte: Details */}
                  <div className={`flex-grow grid grid-rows-[3fr_1fr_1fr] transition-colors duration-300 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}>
                    {/* Zeile 1: Vorstellung */}
                    <div className="p-6 border-b border-gray-100 overflow-hidden">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Persönliche Vorstellung</span>
                      <p className="text-gray-800 text-sm italic line-clamp-4 leading-relaxed">
                        "{tenant.personalIntro || 'Keine Vorstellung hinterlegt.'}"
                      </p>
                    </div>
                    {/* Zeile 2: Einkommen & Art */}
                    <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-gray-400">Netto-Einkommen</span>
                        <span className="text-sm font-bold text-gray-900">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(tenant.householdIncome)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-gray-400">Einkommensart</span>
                        <span className="text-sm font-medium text-gray-700">{tenant.incomeType}</span>
                      </div>
                    </div>
                    {/* Zeile 3: Details */}
                    <div className="px-6 py-2 flex items-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-gray-400">Berufliche Details</span>
                        <span className="text-sm text-gray-600 truncate max-w-md">{tenant.incomeDetails}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rechte Spalte: Checkbox */}
                  <div 
                    onClick={() => toggleSelection(tenant.id)}
                    className={`w-[100px] flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors duration-300 border-l border-gray-100 ${isSelected ? 'bg-blue-100' : 'bg-white hover:bg-gray-50'}`}
                  >
                    {isSelected ? (
                      <CheckSquare size={32} className="text-blue-600" />
                    ) : (
                      <Square size={32} className="text-gray-200" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-16 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Info size={18} className="text-indigo-400" />
            <span className="text-lg font-bold text-white">
              Sie haben <span className="text-indigo-400 text-2xl px-1">{selectedIds.length}</span> Mietinteressenten ausgewählt.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onCancel}
              className="px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all"
            >
              Abbrechen
            </button>
            <button 
              onClick={() => onConfirm(selectedIds)}
              disabled={selectedIds.length === 0}
              className="px-12 py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-bold text-white shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              Mietinteressenten jetzt meine Immobilie anbieten
              <CheckCircle size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSelectionPage;
