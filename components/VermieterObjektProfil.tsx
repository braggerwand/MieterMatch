
import React, { useState, useRef } from 'react';
import { LandlordData, PropertyImage } from '../types';
import { 
  CheckCircle, ArrowLeft, Mail, Smartphone, Euro, Home, 
  MapPin, Maximize, Layout, Layers, Leaf, Car, Utensils, 
  Construction, Banknote, Wallet, Info, Edit3, Coins, ClipboardList,
  Image as ImageIcon, Upload, X, FileText, Loader2
} from 'lucide-react';

interface VermieterObjektProfilProps {
  data: Partial<LandlordData>;
  onConfirm: (updatedData: Partial<LandlordData>) => Promise<void>;
  onCancel: () => void;
  onEdit: (indices: number[]) => void;
}

const VermieterObjektProfil: React.FC<VermieterObjektProfilProps> = ({ data, onConfirm, onCancel, onEdit }) => {
  const [propertyImages, setPropertyImages] = useState<(PropertyImage | null)[]>(() => {
    const initial = Array(6).fill(null);
    if (data.images && data.images.length > 0) {
      data.images.forEach((img, i) => { if (i < 6) initial[i] = img; });
    }
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActiveIdx, setDragActiveIdx] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    newData[index] = { data: currentData, description: desc };
    setPropertyImages(newData);
  };

  const clearSlot = (index: number) => {
    const newData = [...propertyImages];
    newData[index] = null;
    setPropertyImages(newData);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  const handleFinalConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const finalImages = propertyImages.filter(img => img !== null && (img.data !== '' || img.description !== '')) as PropertyImage[];
      await onConfirm({ ...data, images: finalImages });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
        // Fix: Typ-Vergleich korrigiert durch explizites Casting auf any, da der Chat-Assistent initial Strings liefert
        { label: "Weitere Kosten", value: data.otherCosts === 0 || data.otherCosts === undefined || (data.otherCosts as any) === 'keine sonstigen Kosten' ? "Keine" : `${formatNumber(data.otherCosts)} €`, qNum: 12 },
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
          
          <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4 items-center shadow-lg">
            <ClipboardList size={20} className="text-blue-400" />
            <p className="text-gray-300 text-lg leading-relaxed">
              Bitte prüfen Sie alle Angaben Ihres Mietobjekts.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="glass-card p-8 rounded-[2.5rem] border-white/5">
              <div className="flex items-center gap-3 mb-8">
                {section.icon}
                <h2 className="text-xl font-bold text-gray-200">{section.title}</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {section.items.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => onEdit([item.qNum])}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-blue-400">
                        {item.label}
                      </span>
                      <div className="text-lg font-semibold text-white">
                        {item.value || '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <ArrowLeft size={20} />
            Abbrechen
          </button>
          <button 
            onClick={handleFinalConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                Verarbeite...
              </>
            ) : (
              <>
                Passende Mietinteressenten anzeigen
                <CheckCircle size={22} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VermieterObjektProfil;
