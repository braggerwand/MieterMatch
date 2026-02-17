
import React, { useState, useRef } from 'react';
import { TenantData } from '../types';
import { 
  CheckCircle, ArrowLeft, Mail, Smartphone, Euro, Home, UserCheck, 
  User, Image as ImageIcon, Quote, Upload, Sparkles, X, Loader2, Info, Edit3
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface MietinteressentenProfilProps {
  data: Partial<TenantData>;
  onConfirm: (updatedData: Partial<TenantData>) => Promise<void>;
  onCancel: () => void;
  onEdit: (indices: number[]) => void;
}

const AVATAR_TYPES = [
  { id: 'single_man', label: 'Single (Mann)', prompt: 'Modern minimalist 3D avatar of a single man, professional and friendly, clean background, soft lighting' },
  { id: 'single_woman', label: 'Single (Frau)', prompt: 'Modern minimalist 3D avatar of a single woman, professional and friendly, clean background, soft lighting' },
  { id: 'couple_fm', label: 'Paar (Frau & Mann)', prompt: 'Modern minimalist 3D avatar of a diverse couple (woman and man), happy and professional, clean background' },
  { id: 'couple_ff', label: 'Paar (Frau & Frau)', prompt: 'Modern minimalist 3D avatar of a female couple, happy and professional, clean background' },
  { id: 'couple_mm', label: 'Paar (Mann & Mann)', prompt: 'Modern minimalist 3D avatar of a male couple, happy and professional, clean background' },
  { id: 'family_fm_kids', label: 'Familie (F+M+Kinder)', prompt: 'Modern minimalist 3D avatar of a family (man, woman and children), warm and happy, clean background' },
  { id: 'family_ff_kids_mult', label: 'Familie (F+F+viele Kinder)', prompt: 'Modern minimalist 3D avatar of two women with several children, warm family atmosphere, clean background' },
  { id: 'family_mm_kid', label: 'Familie (M+M+Kind)', prompt: 'Modern minimalist 3D avatar of two men with one child, warm family atmosphere, clean background' },
  { id: 'family_mm_kids', label: 'Familie (M+M+Kinder)', prompt: 'Modern minimalist 3D avatar of two men with children, warm family atmosphere, clean background' },
  { id: 'family_ff_kid', label: 'Familie (F+F+Kind)', prompt: 'Modern minimalist 3D avatar of two women with one child, warm family atmosphere, clean background' },
  { id: 'family_ff_kids', label: 'Familie (F+F+Kinder)', prompt: 'Modern minimalist 3D avatar of two women with children, warm family atmosphere, clean background' },
  { id: 'wg_m', label: 'WG (nur Männer)', prompt: 'Modern minimalist 3D avatar representation of a group of diverse men living together, friendship, clean background' },
  { id: 'wg_f', label: 'WG (nur Frauen)', prompt: 'Modern minimalist 3D avatar representation of a group of diverse women living together, friendship, clean background' },
  { id: 'wg_mixed', label: 'WG (Gemischt)', prompt: 'Modern minimalist 3D avatar representation of a mixed group of men and women living together, friendship, clean background' }
];

const MietinteressentenProfil: React.FC<MietinteressentenProfilProps> = ({ data, onConfirm, onCancel, onEdit }) => {
  const [profileImage, setProfileImage] = useState<string | undefined>(data.profileImage);
  const [personalIntro, setPersonalIntro] = useState<string>(data.personalIntro || "");
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null || num === '') return '—';
    const cleanNum = typeof num === 'string' ? num.replace(/[^0-9.-]+/g, "") : num.toString();
    const n = parseFloat(cleanNum);
    if (isNaN(n)) return num;
    return new Intl.NumberFormat('de-DE').format(n);
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

  const sections = [
    {
      title: "Wohnwünsche",
      icon: <Home className="text-indigo-400" size={20} />,
      items: [
        { label: "Wunschort", value: data.desiredLocation, qNum: 1 },
        { label: "Mindestgröße", value: `${formatNumber(data.minSqm)} m²`, qNum: 2 },
        { label: "Zimmeranzahl", value: `${formatNumber(data.minRooms)} Zimmer`, qNum: 3 },
        { label: "Stockwerk", value: data.preferredFloor, qNum: 4 },
        { label: "Garten/Balkon", value: data.gardenOrBalcony, qNum: 5 },
        { label: "Garage/Stellplatz", value: data.parkingNeeded, qNum: 6 },
        { label: "Einbauküche", value: data.kitchenIncluded, qNum: 7 },
        { label: "Zustand der Immobilie", value: data.buildingCondition, qNum: 8 },
      ]
    },
    {
      title: "Finanzen & Beruf",
      icon: <Euro className="text-indigo-400" size={20} />,
      items: [
        { label: "Max. monatliche Miete", value: `${formatNumber(data.maxRent)} €`, qNum: 9 },
        { label: "Netto Haushaltseinkommen", value: `${formatNumber(data.householdIncome)} €`, qNum: 10 },
        { label: "Einkommensart", value: data.incomeType, qNum: 11 },
        { label: "Berufliche Details", value: data.incomeDetails, qNum: 12 },
      ]
    },
    {
      title: "Erreichbarkeit",
      icon: <UserCheck className="text-indigo-400" size={20} />,
      items: [
        { label: "E-Mailadresse", value: data.email?.toLowerCase().trim(), icon: <Mail size={14} />, qNum: 13 },
        { label: "Telefon/SMS", value: formatPhone(data.phone), icon: <Smartphone size={14} />, qNum: 14 },
      ]
    }
  ];

  const directEdit = (qNum: number) => {
    onEdit([qNum]);
  };

  const processImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setShowModal(false);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Bitte wählen Sie eine gültige Bilddatei aus.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const generateAIAvatar = async (prompt: string) => {
    setIsGenerating(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64EncodeString}`;
          setProfileImage(imageUrl);
          setShowModal(false);
          break;
        }
      }
    } catch (error) {
      console.error("Fehler bei Bildgenerierung:", error);
      alert("Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm({
        ...data,
        profileImage,
        personalIntro
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-6 bg-[#05070a] animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
            Review-Modus
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
            Ihr Mieterprofil
          </h1>
          
          <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4 items-center animate-fade-in shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Info size={20} className="text-indigo-400" />
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Prüfen Sie Ihre Angaben. Jedes Feld kann durch <span className="text-indigo-400 font-bold underline decoration-indigo-500/30 underline-offset-4">Klick auf die Fragenummer</span> geändert werden.
            </p>
          </div>
        </div>

        {/* Profilbild & Intro Sektion */}
        <div className="flex flex-col gap-8 mb-12">
          <div className="grid md:grid-cols-[280px_1fr] gap-8">
            <div 
              onClick={() => setShowModal(true)}
              className="glass-card p-6 rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group cursor-pointer transition-all hover:border-indigo-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-40 h-40 rounded-full bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center mb-4 relative z-10 overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <User size={80} className="text-indigo-400/50" />
                )}
              </div>
              <div className="text-center relative z-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-1 flex items-center justify-center gap-2">
                  {profileImage ? 'Foto ändern' : 'Foto hinzufügen'}
                  <Sparkles size={14} className="animate-pulse" />
                </h3>
                <p className="text-xs text-gray-500 italic">KI oder Upload</p>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Quote className="text-indigo-400" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-200">Persönliche Vorstellung</h2>
              </div>
              <div className="flex-grow mb-6">
                <textarea
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-gray-300 leading-relaxed text-lg italic focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
                  placeholder="Schreiben Sie etwas über sich:"
                  value={personalIntro}
                  onChange={(e) => setPersonalIntro(e.target.value)}
                />
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <Info size={16} className="text-indigo-400" />
                </div>
                <div className="text-xs text-gray-400 leading-relaxed">
                  <span className="text-indigo-400 font-bold block mb-0.5 uppercase tracking-wider text-[10px]">Hinweis</span>
                  Nutzen Sie die Möglichkeit sich beim Anbieter persönlich vorzustellen. Diese wird als Intro im Matching angezeigt.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail-Sektionen */}
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="glass-card p-8 rounded-[2.5rem] border-white/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-200">{section.title}</h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => directEdit(item.qNum)}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-indigo-400 transition-colors">
                          {item.label}
                        </span>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          Frage {item.qNum} <Edit3 size={8} />
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-white flex items-center gap-2">
                        {item.icon && <span className="text-indigo-400/50">{item.icon}</span>}
                        {item.value || '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
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
            className="w-full sm:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-white shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                Wird verarbeitet...
              </>
            ) : (
              <>
                Profil bestätigen & speichern
                <CheckCircle size={22} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal für Profilbild */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-6 pb-6 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="glass-card w-full max-w-4xl rounded-[3rem] p-10 pt-8 border-white/10 relative shadow-2xl">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-black mb-2">Profilbild wählen</h2>
              <p className="text-gray-400 text-sm">Laden Sie ein eigenes Foto hoch oder lassen Sie die KI eine passende Grafik erstellen.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Upload size={18} className="text-indigo-400" />
                  Eigenes Foto hochladen
                </h3>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center group cursor-pointer transition-all border-white/10 bg-white/5 hover:border-indigo-500/50`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-indigo-600/10 group-hover:scale-110 transition-all`}>
                    <ImageIcon className='text-indigo-400' size={28} />
                  </div>
                  <span className={`font-bold text-sm text-white`}>
                    Datei auswählen
                  </span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-400" />
                  KI-Grafik generieren
                </h3>
                
                {isGenerating ? (
                  <div className="aspect-square rounded-[2rem] bg-indigo-600/5 border border-indigo-500/20 flex flex-col items-center justify-center animate-pulse">
                    <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
                    <span className="text-indigo-400 font-bold text-sm">Generiere Grafik...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                    {AVATAR_TYPES.map((type) => (
                      <button 
                        key={type.id}
                        onClick={() => generateAIAvatar(type.prompt)}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-left hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all active:scale-95 leading-tight"
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MietinteressentenProfil;
