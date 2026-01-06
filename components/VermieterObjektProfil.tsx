import React, { useState, useRef } from 'react';
import { LandlordData, PropertyImage } from '../types';
import { 
  CheckCircle, ArrowLeft, Mail, Smartphone, Euro, Home, 
  MapPin, Maximize, Layout, Layers, Leaf, Car, Utensils, 
  Construction, Banknote, Wallet, Info, Edit3, Coins, ClipboardList,
  Image as ImageIcon, Upload, X, FileText
} from 'lucide-react';

interface VermieterObjektProfilProps {
  data: Partial<LandlordData>;
  onConfirm: (updatedData: Partial<LandlordData>) => void;
  onCancel: () => void;
  onEdit: (indices: number[]) => void;
}

const VermieterObjektProfil: React.FC<VermieterObjektProfilProps> = ({ data, onConfirm, onCancel, onEdit }) => {
  // Initialisierung von 6 Slots. Wir laden vorhandene Bilder aus den Daten, falls diese bereits existieren (z.B. beim Zurückkehren).
  const [propertyImages, setPropertyImages] = useState<(PropertyImage | null)[]>(() => {
    const initial = Array(6).fill(null);
    if (data.images && data.images.length > 0) {
      data.images.forEach((img, i) => { if (i < 6) initial[i] = img; });
    }
    return initial;
  });

  const [dragActiveIdx, setDragActiveIdx] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * Formatiert Zahlen mit Tausenderpunkt und 2 Dezimalstellen
   */
  const formatNumber = (num: number | string | undefined): string => {
    if (num === undefined || num === null || num === '') return '0,00';
    const cleanNum = typeof num === 'string' ? num.replace(/[^0-9.-]+/g, "") : num.toString();
    const n = parseFloat(cleanNum);
    if (isNaN(n)) return String(num);
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(n);
  };

  /**
   * Formatiert die Telefonnummer nach Vorgabe
   */
  const formatPhone = (phone: string | undefined) => {
    if (!phone || phone.toLowerCase() === 'nein') return phone || '—';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0049')) cleaned = cleaned.substring(4);
    else if (cleaned.startsWith('49')) cleaned = cleaned.substring(2);
    else if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);

    if (cleaned.length >= 3) {
      const prefix = cleaned.substring(0, 3);
      const rest = cleaned.substring(3);
      return `+49 ${prefix} ${rest}`;
    }
    return phone.trim();
  };

  const handleFile = (file: File, index: number) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newData = [...propertyImages];
        const currentDesc = newData[index]?.description || '';
        newData[index] = {
          data: e.target?.result as string,
          description: currentDesc
        };
        setPropertyImages(newData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionChange = (index: number, desc: string) => {
    const newData = [...propertyImages];
    const currentData = newData[index]?.data || '';
    newData[index] = { 
      data: currentData, 
      description: desc 
    };
    setPropertyImages(newData);
  };

  /**
   * Setzt den kompletten Slot (Bild & Text) zurück
   */
  const clearSlot = (index: number) => {
    const newData = [...propertyImages];
    newData[index] = null;
    setPropertyImages(newData);
    // Browser-Dateipfad zurücksetzen
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragActiveIdx(index);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActiveIdx(null);
  };

  const onDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragActiveIdx(null);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, index);
  };

  const sections = [
    {
      title: "Lage & Größe",
      icon: <MapPin className="text-blue-400" size={20} />,
      items: [
        { label: "Adresse", value: data.address, qNum: 1 },
        { label: "Wohnfläche", value: `${formatNumber(data.sqm).split(',')[0]} m²`, qNum: 2 },
        { label: "Zimmeranzahl", value: `${data.rooms} Zimmer`, qNum: 3 },
      ]
    },
    {
      title: "Objekt-Details",
      icon: <Layers className="text-blue-400" size={20} />,
      items: [
        { label: "Stockwerk", value: data.floor, qNum: 4 },
        { label: "Garten/Balkon", value: data.gardenOrBalcony, qNum: 5 },
        { label: "Garage/Stellplatz", value: data.parkingDetails, qNum: 6 },
      ]
    },
    {
      title: "Ausstattung",
      icon: <Utensils className="text-blue-400" size={20} />,
      items: [
        { label: "Einbauküche", value: data.kitchenDetails, qNum: 7 },
        { label: "Baujahr/Zustand", value: data.buildingAge, qNum: 8 },
      ]
    },
    {
      title: "Kosten (monatlich)",
      icon: <Coins className="text-blue-400" size={20} />,
      items: [
        { label: "Kaltmiete", value: `${formatNumber(data.rentCold)} €`, qNum: 9 },
        { label: "Nebenkosten", value: `${formatNumber(data.serviceCharges)} €`, qNum: 10 },
        { label: "Stellplatzmiete", value: `${formatNumber(data.parkingRent)} €`, qNum: 11 },
        { label: "Weitere Kosten", value: data.otherCosts === 0 || data.otherCosts === undefined || data.otherCosts === 'keine sonstigen Kosten' ? "Keine" : `${formatNumber(data.otherCosts)} €`, qNum: 12 },
      ]
    },
    {
      title: "Kontakt",
      icon: <Mail className="text-blue-400" size={20} />,
      items: [
        { label: "E-Mailadresse", value: data.email?.toLowerCase(), qNum: 13 },
        { label: "Mobilfunk/SMS)", value: formatPhone(data.phone), qNum: 14 },
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-6 bg-[#05070a] animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
            Objekt-Review
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
            Objektprofil prüfen
          </h1>
          
          <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4 items-center animate-fade-in shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
              <ClipboardList size={20} className="text-blue-400" />
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Bitte prüfen Sie alle Angaben Ihres Mietobjekts. Ein Klick auf die <span className="text-blue-400 font-bold">Frage-Box</span> erlaubt die sofortige Bearbeitung.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="glass-card p-8 rounded-[2.5rem] border-white/5 shadow-xl transition-all hover:border-blue-500/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-200">{section.title}</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {section.items.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => onEdit([item.qNum])}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-blue-400 transition-colors">
                          {item.label}
                        </span>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold group-hover:bg-blue-500 group-hover:text-white transition-all">
                          Frage {item.qNum} <Edit3 size={8} />
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {item.value || '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Upgrade Hinweis */}
          <div className="p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 flex gap-6 items-start animate-fade-in shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 mt-1">
              <ImageIcon size={24} className="text-blue-400" />
            </div>
            <div className="space-y-2">
              <span className="text-blue-400 font-black uppercase tracking-widest text-[10px]">Optionales Upgrade</span>
              <p className="text-gray-300 text-lg leading-relaxed">
                Sie haben die Möglichkeit Ihr Objektprofil mit Grundrisse und Bildern zu ergänzen. Sie verbessern damit die Qualität Ihres Angebots und bekommen mehr positive Rückmeldungen von den von Ihnen ausgewählten Mietinteressenten.
              </p>
            </div>
          </div>

          {/* Upload Bereich für 6 Bilder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertyImages.map((img, idx) => (
              <div key={idx} className="glass-card p-6 rounded-[2.5rem] border-white/5 flex flex-col gap-4 group transition-all hover:border-blue-500/20 relative">
                
                {/* LÖSCH-BUTTON (X): Erscheint oben rechts, wenn Inhalt (Bild oder Text) vorhanden ist */}
                {img && (img.data || img.description) && (
                  <button 
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); 
                      clearSlot(idx); 
                    }}
                    className="absolute top-2 right-2 w-9 h-9 bg-white/20 hover:bg-red-500 text-white rounded-full flex items-center justify-center border border-white/20 transition-all z-[60] shadow-2xl group/delete"
                    title="Diesen Slot komplett leeren"
                  >
                    <X size={18} className="group-hover/delete:scale-125 transition-transform" />
                  </button>
                )}

                {/* Grafik Upload Area */}
                <div 
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, idx)}
                  onClick={() => fileInputRefs.current[idx]?.click()}
                  className={`relative aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                    dragActiveIdx === idx 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-white/10 hover:border-blue-500/30 bg-white/5'
                  }`}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={el => fileInputRefs.current[idx] = el}
                    onChange={(e) => e.target.files && handleFile(e.target.files[0], idx)}
                  />
                  
                  {img?.data ? (
                    <img src={img.data} alt={`Objektbild ${idx + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <Upload size={20} className="text-blue-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center px-4">
                        Bild {idx + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Beschreibung Input Area */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/50">
                    <FileText size={14} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Beschreibung..."
                    value={img?.description || ''}
                    onChange={(e) => handleDescriptionChange(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors shadow-inner"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onCancel}
            className="w-full sm:w-auto px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft size={20} />
            Abbrechen
          </button>
          <button 
            onClick={() => {
              const finalImages = propertyImages.filter(img => img !== null && (img.data !== '' || img.description !== '')) as PropertyImage[];
              onConfirm({ ...data, images: finalImages });
            }}
            className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-white shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            Passende Mietinteressenten anzeigen & auswählen
            <CheckCircle size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VermieterObjektProfil;