import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { 
  Send, ArrowLeft, Bot, Sparkles, Loader2, 
  MapPin, Maximize, Layout, Layers, Leaf, Car, Utensils, 
  Construction, Banknote, Wallet, Briefcase, FileText, Mail, Smartphone,
  Info, ChevronRight, CheckCircle, Lightbulb
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface QuestionConfig {
  question: string;
  hint: string;
  placeholder: string;
  field: string;
  category: string;
  icon?: React.ReactNode;
}

interface ChatAssistantProps {
  role: UserRole;
  onCancel: () => void;
  onFinish: (data: any) => void;
  editIndices?: number[]; 
  initialData?: any;      
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ role, onCancel, onFinish, editIndices, initialData }) => {
  const [stepIndex, setStepIndex] = useState(0); 
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tenantQuestions: QuestionConfig[] = [
    { 
      question: "Wo möchten Sie wohnen?", 
      hint: "Geben Sie eine oder mehrere Orte oder Ortsteile an.", 
      placeholder: "z.B. Berlin Mitte, Charlottenburg", 
      field: "desiredLocation",
      category: "Wohnwünsche",
      icon: <MapPin size={24} className="text-indigo-400" />
    },
    { 
      question: "Wie viel m² benötigen Sie mindestens?", 
      hint: "Geben Sie die gewünschte Mindestgröße der Wohnfläche an.", 
      placeholder: "z.B. 65", 
      field: "minSqm",
      category: "Wohnwünsche",
      icon: <Maximize size={24} className="text-indigo-400" />
    },
    { 
      question: "Wie viele Zimmer benötigen Sie?", 
      hint: "Anzahl Wohn- und Schlafzimmer (ohne Küche/Bad).", 
      placeholder: "z.B. 3", 
      field: "minRooms",
      category: "Wohnwünsche",
      icon: <Layout size={24} className="text-indigo-400" />
    },
    { 
      question: "Bevorzugtes Stockwerk?", 
      hint: "Erdgeschoss, Dachgeschoss, Zwischengeschoss oder 'egal'.", 
      placeholder: "z.B. Zwischengeschoss", 
      field: "preferredFloor",
      category: "Wohnwünsche",
      icon: <Layers size={24} className="text-indigo-400" />
    },
    { 
      question: "Garten oder Balkon erwünscht?", 
      hint: "Geben Sie Ihre Präferenz an oder schreiben Sie 'egal'.", 
      placeholder: "z.B. Balkon erwünscht", 
      field: "gardenOrBalcony",
      category: "Wohnwünsche",
      icon: <Leaf size={24} className="text-indigo-400" />
    },
    { 
      question: "Garage oder Stellplatz benötigt?", 
      hint: "Wichtig für Autobesitzer. Falls nicht nötig: 'egal'.", 
      placeholder: "z.B. Garage oder egal", 
      field: "parkingNeeded",
      category: "Wohnwünsche",
      icon: <Car size={24} className="text-indigo-400" />
    },
    { 
      question: "Soll eine Einbauküche (EBK) vorhanden sein?", 
      hint: "Antworten Sie mit 'Ja', 'Nein' oder 'egal'.", 
      placeholder: "z.B. Ja", 
      field: "kitchenIncluded",
      category: "Wohnwünsche",
      icon: <Utensils size={24} className="text-indigo-400" />
    },
    { 
      question: "Welchen Bauzustand bevorzugen Sie?", 
      hint: "Neubau, Altbau (gepflegt), Altbau (einfach) oder 'egal'.", 
      placeholder: "z.B. Neubau", 
      field: "buildingCondition",
      category: "Wohnwünsche",
      icon: <Construction size={24} className="text-indigo-400" />
    },
    { 
      question: "Maximale monatliche Gesamtmiete?", 
      hint: "Warmmiete inkl. aller Nebenkosten (Heizung, etc.).", 
      placeholder: "z.B. 1400", 
      field: "maxRent",
      category: "Finanzen",
      icon: <Banknote size={24} className="text-indigo-400" />
    },
    { 
      question: "Monatliches Netto Haushaltseinkommen?", 
      hint: "Summe aller Nettoeinkünfte des Haushalts.", 
      placeholder: "z.B. 4500", 
      field: "householdIncome",
      category: "Finanzen",
      icon: <Wallet size={24} className="text-indigo-400" />
    },
    { 
      question: "Art Ihres Einkommens?", 
      hint: "Lohn/Gehalt, Selbstständig, Rente, Sozialleistung etc.", 
      placeholder: "z.B. Lohn/Gehalt", 
      field: "incomeType",
      category: "Finanzen",
      icon: <Briefcase size={24} className="text-indigo-400" />
    },
    { 
      question: "Details zu Ihrem Beruf/Einkommen?", 
      hint: "z.B. 'Angestellt bei Siemens' oder 'Softwareentwickler'.", 
      placeholder: "z.B. Angestellt bei Siemens AG", 
      field: "incomeDetails",
      category: "Finanzen",
      icon: <FileText size={24} className="text-indigo-400" />
    },
    { 
      question: "Ihre E-Mailadresse für Angebote?", 
      hint: "Hierhin senden wir passende Immobilien-Matches.", 
      placeholder: "name@beispiel.de", 
      field: "email",
      category: "Erreichbarkeit",
      icon: <Mail size={24} className="text-indigo-400" />
    },
    { 
      question: "Wollen Sie SMS-Benachrichtigungen?", 
      hint: "Geben Sie Ihre Nummer an (+49...) oder schreiben Sie 'Nein'.", 
      placeholder: "+49 170 1234567 oder Nein", 
      field: "phone",
      category: "Erreichbarkeit",
      icon: <Smartphone size={24} className="text-indigo-400" />
    }
  ];

  const landlordQuestions: QuestionConfig[] = [
    { question: "Ihre E-Mail-Adresse?", hint: "Für wichtige Benachrichtigungen.", placeholder: "beispiel@mail.de", field: "email", category: "Kontakt", icon: <Mail size={24} className="text-blue-400" /> },
    { question: "Mobilfunknummer?", hint: "Für SMS-Benachrichtigungen.", placeholder: "+49 123...", field: "phone", category: "Kontakt", icon: <Smartphone size={24} className="text-blue-400" /> },
    { question: "Titel Ihres Mietobjekts?", hint: "Ein ansprechender Name.", placeholder: "z.B. Modernes Loft", field: "propertyTitle", category: "Objekt", icon: <HomeIcon size={24} className="text-blue-400" /> },
    { question: "In welcher PLZ liegt die Immobilie?", hint: "Wichtig für das Matching.", placeholder: "z.B. 10115", field: "zipCode", category: "Objekt", icon: <MapPin size={24} className="text-blue-400" /> },
    { question: "Wie hoch ist die Warmmiete?", hint: "Monatlicher Gesamtbetrag.", placeholder: "z.B. 1200", field: "rentWarm", category: "Finanzen", icon: <Banknote size={24} className="text-blue-400" /> },
    { question: "Wohnfläche in qm?", hint: "Die Größe des Objekts.", placeholder: "z.B. 80", field: "sqm", category: "Objekt", icon: <Maximize size={24} className="text-blue-400" /> },
    { question: "Zimmeranzahl?", hint: "Ohne Küche/Bad.", placeholder: "z.B. 3", field: "rooms", category: "Objekt", icon: <Layout size={24} className="text-blue-400" /> },
    { question: "Kurze Beschreibung?", hint: "Besonderheiten des Objekts.", placeholder: "Beschreibung hier...", field: "description", category: "Objekt", icon: <FileText size={24} className="text-blue-400" /> }
  ];

  const allQuestions = role === UserRole.LANDLORD ? landlordQuestions : tenantQuestions;
  const activeQuestionIndices = editIndices || allQuestions.map((_, i) => i);
  const totalSteps = activeQuestionIndices.length;

  const [collectedData, setCollectedData] = useState<any>(initialData || {});
  const [messages, setMessages] = useState<{sender: 'bot' | 'user', text: string, hint?: string, icon?: React.ReactNode, qNum?: number, category?: string}[]>([]);

  useEffect(() => {
    const firstQIndex = activeQuestionIndices[0];
    const firstQ = allQuestions[firstQIndex];
    setMessages([
      { 
        sender: 'bot', 
        text: (editIndices ? `Bearbeitung: ${firstQ.question}` : firstQ.question), 
        hint: firstQ.hint,
        icon: firstQ.icon,
        category: firstQ.category,
        qNum: firstQIndex + 1
      }
    ]);
    
    if (initialData && initialData[firstQ.field]) {
      setUserInput(String(initialData[firstQ.field]));
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, isTyping]);

  const handleAutoFill = async () => {
    if (role !== UserRole.TENANT || editIndices) return;
    setIsAutoFilling(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generiere ein realistisches deutsches Mieterprofil als JSON für alle 14 Felder inkl. personalIntro='Schreiben Sie etwas über sich:'.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              desiredLocation: { type: Type.STRING },
              minSqm: { type: Type.NUMBER },
              minRooms: { type: Type.NUMBER },
              preferredFloor: { type: Type.STRING },
              gardenOrBalcony: { type: Type.STRING },
              parkingNeeded: { type: Type.STRING },
              kitchenIncluded: { type: Type.STRING },
              buildingCondition: { type: Type.STRING },
              maxRent: { type: Type.NUMBER },
              householdIncome: { type: Type.NUMBER },
              incomeType: { type: Type.STRING },
              incomeDetails: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              personalIntro: { type: Type.STRING },
            }
          }
        }
      });
      const autoData = JSON.parse(response.text);
      onFinish(autoData);
    } catch (error) {
      alert("Fehler beim Auto-Fill.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSend = () => {
    if (!userInput.trim()) return;
    
    const currentQIndex = activeQuestionIndices[stepIndex];
    const currentQuestion = allQuestions[currentQIndex];
    
    const newMessages = [...messages, { sender: 'user' as const, text: userInput }];
    setMessages(newMessages);
    
    const updatedData = { ...collectedData, [currentQuestion.field]: userInput };
    setCollectedData(updatedData);
    setUserInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (stepIndex < totalSteps - 1) {
        const nextQIndex = activeQuestionIndices[stepIndex + 1];
        const nextQ = allQuestions[nextQIndex];
        setMessages([...newMessages, { 
          sender: 'bot', 
          text: (editIndices ? `Bearbeitung: ${nextQ.question}` : nextQ.question), 
          hint: nextQ.hint,
          icon: nextQ.icon,
          category: nextQ.category,
          qNum: nextQIndex + 1
        }]);
        setStepIndex(stepIndex + 1);
        
        if (initialData && initialData[nextQ.field]) {
          setUserInput(String(initialData[nextQ.field]));
        }
      } else {
        onFinish(updatedData);
      }
    }, 600);
  };

  const currentCategory = allQuestions[activeQuestionIndices[stepIndex]]?.category || "Prozess";

  return (
    <div className="fixed inset-0 z-[60] bg-[#05070a] flex flex-col font-sans">
      {/* Header mit erweitertem Fortschritt */}
      <div className="h-24 border-b border-white/5 flex items-center px-8 justify-between bg-black/40 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
            <Bot size={30} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-1">
              {role === UserRole.LANDLORD ? "Vermieter-Assistent" : (editIndices ? "Profil-Update" : "Mieter-Assistent")}
            </h2>
            <div className="flex items-center gap-3">
               <span className="text-lg font-bold text-white tracking-tight">{currentCategory}</span>
               <span className="text-[10px] font-black text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">
                {stepIndex + 1} von {totalSteps}
               </span>
            </div>
            <div className="h-1.5 w-48 bg-white/5 rounded-full overflow-hidden mt-2 border border-white/5">
              <div 
                className="h-full bg-indigo-500 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {role === UserRole.TENANT && !editIndices && (
            <button 
              onClick={handleAutoFill} 
              disabled={isAutoFilling} 
              className="hidden lg:flex px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400 text-[11px] font-black uppercase tracking-[0.15em] items-center gap-3 transition-all active:scale-95 shadow-sm"
            >
              {isAutoFilling ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              KI-Entwurf erstellen
            </button>
          )}
          <button 
            onClick={onCancel} 
            className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-red-500/10 border border-white/5 rounded-2xl transition-all group active:scale-90"
          >
            <ArrowLeft size={24} className="text-gray-500 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Chat Area - Dynamischere Messages */}
      <div className="flex-grow overflow-y-auto p-6 scroll-smooth custom-scrollbar" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-12 py-10">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {m.sender === 'bot' ? (
                <div className="max-w-[95%] w-full">
                  <div className="glass-card border-indigo-500/20 rounded-[3rem] rounded-tl-none p-10 relative overflow-hidden shadow-2xl transition-all hover:border-indigo-500/40">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/5 blur-[60px] pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row items-start gap-8">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-inner group">
                        <div className="transition-transform duration-500 group-hover:scale-110">
                          {m.icon || <Bot size={32} className="text-indigo-400" />}
                        </div>
                      </div>
                      
                      <div className="flex-grow space-y-5">
                        <div className="flex items-center gap-3">
                           <div className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">
                             {m.category || "Allgemein"}
                           </div>
                           <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-[0.2em]">
                             Schritt {m.qNum}
                           </div>
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl font-black text-white leading-[1.2] tracking-tight">
                          {m.text}
                        </h3>
                        
                        {m.hint && (
                          <div className="flex gap-4 p-5 rounded-3xl bg-indigo-500/[0.03] border border-indigo-500/10 items-start group/hint">
                            <div className="mt-1">
                              <Lightbulb size={18} className="text-indigo-400/70 group-hover/hint:text-indigo-400 transition-colors" />
                            </div>
                            <p className="text-sm md:text-base text-gray-400 italic leading-relaxed">
                              <span className="text-indigo-400/60 font-black uppercase tracking-tighter text-[10px] block mb-1 not-italic">Tipp vom Assistenten</span>
                              {m.hint}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-[70%] transform translate-y-[-10px]">
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 px-8 rounded-[2.5rem] rounded-tr-none shadow-xl shadow-indigo-600/10 border border-indigo-400/20">
                    <p className="text-lg md:text-xl font-bold tracking-tight">{m.text}</p>
                    <div className="flex justify-end mt-2 opacity-60">
                       <CheckCircle size={14} className="text-indigo-100" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-pulse">
              <div className="glass-card px-6 py-4 rounded-3xl rounded-tl-none flex gap-2 border-indigo-500/20">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Schwebendes Design */}
      <div className="p-8 bg-gradient-to-t from-black via-black/80 to-transparent pt-12 relative z-10">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-[2.5rem] blur opacity-50"></div>
          <div className="relative group">
            <input 
              type="text"
              className="w-full bg-[#0d1117] border border-white/10 rounded-[2.5rem] py-8 pl-10 pr-24 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-2xl font-bold transition-all placeholder:text-gray-700 shadow-2xl text-white"
              placeholder={allQuestions[activeQuestionIndices[stepIndex]]?.placeholder || "Ihre Antwort..."}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              autoFocus
            />
            <button 
              onClick={handleSend} 
              disabled={!userInput.trim()} 
              className="absolute right-4 top-4 bottom-4 w-16 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 disabled:grayscale rounded-full flex items-center justify-center transition-all shadow-lg shadow-indigo-600/30 active:scale-90 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Send size={28} className="text-white relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-5 px-6">
             <div className="flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
               <p className="text-[10px] text-gray-500 uppercase tracking-[0.25em] font-black">
                 Drücken Sie Enter zum Senden
               </p>
             </div>
             {editIndices && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                  <span className="text-[9px] text-yellow-500 font-black uppercase tracking-widest">
                    Bearbeitungsmodus
                  </span>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

export default ChatAssistant;