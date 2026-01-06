import React, { useState, useEffect, useRef } from 'react';
import { UserRole } from '../types';
import { 
  Send, ArrowLeft, Bot, Sparkles, Loader2, 
  MapPin, Maximize, Layout, Layers, Leaf, Car, Utensils, 
  Construction, Banknote, Wallet, Briefcase, FileText, Mail, Smartphone,
  Info, ChevronRight, CheckCircle, Lightbulb, Home as HomeIcon, Coins
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    { 
      question: "Wo befindet sich Ihre Immobilie?", 
      hint: "Geben Sie die Adresse Ihrer Immobilie ein.", 
      placeholder: "z.B. Schlossstraße 1, 12163 Berlin", 
      field: "address",
      category: "Lage & Größe",
      icon: <MapPin size={24} className="text-blue-400" />
    },
    { 
      question: "Wie groß ist die Immobilie?", 
      hint: "Geben Sie die Wohnfläche ihrer Immobilien an.", 
      placeholder: "z.B. 85", 
      field: "sqm",
      category: "Lage & Größe",
      icon: <Maximize size={24} className="text-blue-400" />
    },
    { 
      question: "Wie viele Zimmer hat Ihre Immobilie?", 
      hint: "Geben Sie an, wie viel Wohn-, und Schlafzimmer (ohne Küche und Bäder) Ihre Immobilie hat.", 
      placeholder: "z.B. 3.5", 
      field: "rooms",
      category: "Lage & Größe",
      icon: <Layout size={24} className="text-blue-400" />
    },
    { 
      question: "In welchem Stockwerk befindet sich die Wohnung?", 
      hint: "Zum Beispiel: Erdgeschoss, Dachgeschoss oder Zwischengeschoss.", 
      placeholder: "z.B. 2. Obergeschoss", 
      field: "floor",
      category: "Details",
      icon: <Layers size={24} className="text-blue-400" />
    },
    { 
      question: "Hat Ihre Immobilie einen Garten oder Balkon?", 
      hint: "Geben Sie an welche dieser Flächen für den Mieter zur Verfügung stehen.", 
      placeholder: "z.B. Balkon und Mitbenutzung Garten", 
      field: "gardenOrBalcony",
      category: "Details",
      icon: <Leaf size={24} className="text-blue-400" />
    },
    { 
      question: "Verfügt Ihre Immobilie über eine Garage/Stellplatz?", 
      hint: "Geben Sie an um welche Art von Stellplatz es sich handelt (z.B. Duplex-Parker).", 
      placeholder: "z.B. Tiefgaragen-Stellplatz", 
      field: "parkingDetails",
      category: "Details",
      icon: <Car size={24} className="text-blue-400" />
    },
    { 
      question: "Verfügt die Immobilie über eine Einbauküche?", 
      hint: "Wenn ja, beschreiben Sie die Einbauküche.", 
      placeholder: "z.B. Ja, voll ausgestattet mit Markengeräten", 
      field: "kitchenDetails",
      category: "Ausstattung",
      icon: <Utensils size={24} className="text-blue-400" />
    },
    { 
      question: "Wie alt ist Ihre Immobilie?", 
      hint: "z.B. Neubau, hochwertig modernisierter Altbau etc.", 
      placeholder: "z.B. Erstbezug nach Sanierung", 
      field: "buildingAge",
      category: "Ausstattung",
      icon: <Construction size={24} className="text-blue-400" />
    },
    { 
      question: "Wie hoch ist die monatliche Kaltmiete?", 
      hint: "Geben Sie hier die Summe der monatlichen Kaltmiete für Ihr Objekt an.", 
      placeholder: "z.B. 950", 
      field: "rentCold",
      category: "Kosten",
      icon: <Banknote size={24} className="text-blue-400" />
    },
    { 
      question: "Wie hoch sind die Nebenkosten?", 
      hint: "Geben Sie hier die Summe der monatlichen Nebenkostenvorauszahlung für Ihr Objekt an.", 
      placeholder: "z.B. 180", 
      field: "serviceCharges",
      category: "Kosten",
      icon: <Coins size={24} className="text-blue-400" />
    },
    { 
      question: "Wie hoch ist die Stellplatzmiete?", 
      hint: "Geben Sie hier die Summe der monatlichen Stellplatzmiete für Ihr Objekt an.", 
      placeholder: "z.B. 60", 
      field: "parkingRent",
      category: "Kosten",
      icon: <Car size={24} className="text-blue-400" />
    },
    { 
      question: "Gibt es weitere Kosten?", 
      hint: "Geben Sie hier die Summe der monatlichen sonstigen Kosten an und beschreiben Sie wofür diese sind. Wenn nicht, 'keine sonstigen Kosten'.", 
      placeholder: "z.B. keine sonstigen Kosten", 
      field: "otherCosts",
      category: "Kosten",
      icon: <Wallet size={24} className="text-blue-400" />
    },
    { 
      question: "E-Mailadresse für die Kontaktaufnahme?", 
      hint: "Dies ist eine Pflichtangabe. Achten Sie auf das richtige Format.", 
      placeholder: "ihre-mail@anbieter.de", 
      field: "email",
      category: "Kontakt",
      icon: <Mail size={24} className="text-blue-400" />
    },
    { 
      question: "Wollen Sie auch eine SMS erhalten?", 
      hint: "Geben Sie Ihre Mobilfunknummer im Format +49 170 123456 ein oder 'Nein'.", 
      placeholder: "+49 171 9876543 oder Nein", 
      field: "phone",
      category: "Kontakt",
      icon: <Smartphone size={24} className="text-blue-400" />
    }
  ];

  const allQuestions = role === UserRole.LANDLORD ? landlordQuestions : tenantQuestions;
  const activeQuestionIndices = editIndices || allQuestions.map((_, i) => i);
  const totalSteps = activeQuestionIndices.length;

  const [collectedData, setCollectedData] = useState<any>(initialData || {});
  const [messages, setMessages] = useState<{sender: 'bot' | 'user', text: string, hint?: string, icon?: React.ReactNode, qNum?: number, category?: string}[]>([]);

  // Automatischer Fokus auf das Eingabefeld
  useEffect(() => {
    if (!isTyping && !isAutoFilling && inputRef.current) {
      inputRef.current.focus();
    }
  }, [stepIndex, isTyping, isAutoFilling, messages]);

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
    if (isAutoFilling) return;
    setIsAutoFilling(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key fehlt.");

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = role === UserRole.TENANT 
        ? "Generiere ein realistisches deutsches Mieterprofil als JSON für alle 14 Felder. Nutze echte deutsche Orte und realistische Gehälter. Felder: desiredLocation, minSqm, minRooms, preferredFloor, gardenOrBalcony, parkingNeeded, kitchenIncluded, buildingCondition, maxRent, householdIncome, incomeType, incomeDetails, email, phone. personalIntro='Schreiben Sie etwas über sich'."
        : "Generiere ein realistisches deutsches Immobilienobjekt (Vermieter) als JSON. Felder: address, sqm, rooms, floor, gardenOrBalcony, parkingDetails, kitchenDetails, buildingAge, rentCold, serviceCharges, parkingRent, otherCosts, email, phone.";

      const schema = role === UserRole.TENANT 
        ? {
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
            },
            required: ["desiredLocation", "minSqm", "minRooms", "preferredFloor", "gardenOrBalcony", "parkingNeeded", "kitchenIncluded", "buildingCondition", "maxRent", "householdIncome", "incomeType", "incomeDetails", "email", "phone"]
          }
        : {
            type: Type.OBJECT,
            properties: {
              address: { type: Type.STRING },
              sqm: { type: Type.NUMBER },
              rooms: { type: Type.NUMBER },
              floor: { type: Type.STRING },
              gardenOrBalcony: { type: Type.STRING },
              parkingDetails: { type: Type.STRING },
              kitchenDetails: { type: Type.STRING },
              buildingAge: { type: Type.STRING },
              rentCold: { type: Type.NUMBER },
              serviceCharges: { type: Type.NUMBER },
              parkingRent: { type: Type.NUMBER },
              otherCosts: { type: Type.NUMBER },
              email: { type: Type.STRING },
              phone: { type: Type.STRING }
            },
            required: ["address", "sqm", "rooms", "floor", "gardenOrBalcony", "parkingDetails", "kitchenDetails", "buildingAge", "rentCold", "serviceCharges", "parkingRent", "otherCosts", "email", "phone"]
          };

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      
      const text = result.text;
      if (!text) throw new Error("Keine Antwort von der KI erhalten.");

      const cleanJson = text.replace(/```json\n?|```/g, "").trim();
      const autoData = JSON.parse(cleanJson);
      
      onFinish(autoData);
    } catch (error) {
      console.error("Auto-Fill Error:", error);
      alert("Fehler beim Auto-Fill. Bitte stellen Sie sicher, dass Ihr API-Key gültig ist und versuchen Sie es erneut.");
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
      <div className="h-24 border-b border-white/5 flex items-center px-8 justify-between bg-black/40 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role === UserRole.LANDLORD ? 'from-blue-500 to-blue-700' : 'from-indigo-500 to-indigo-700'} flex items-center justify-center shrink-0 shadow-lg`}>
            <Bot size={30} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className={`font-black text-[10px] uppercase tracking-[0.3em] ${role === UserRole.LANDLORD ? 'text-blue-400' : 'text-indigo-400'} mb-1`}>
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
                className={`h-full ${role === UserRole.LANDLORD ? 'bg-blue-500' : 'bg-indigo-500'} transition-all duration-700 ease-in-out shadow-lg`}
                style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!editIndices && (
            <button 
              onClick={handleAutoFill} 
              disabled={isAutoFilling} 
              className={`hidden lg:flex px-6 py-3 ${role === UserRole.LANDLORD ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-400'} border rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] items-center gap-3 transition-all active:scale-95 shadow-sm min-w-[140px] justify-center`}
            >
              {isAutoFilling ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Auto-Fill
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

      <div className="flex-grow overflow-y-auto p-6 scroll-smooth custom-scrollbar" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-12 py-10">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {m.sender === 'bot' ? (
                <div className="max-w-[95%] w-full">
                  <div className={`glass-card ${role === UserRole.LANDLORD ? 'border-blue-500/20 hover:border-blue-500/40' : 'border-indigo-500/20 hover:border-indigo-500/40'} rounded-[3rem] rounded-tl-none p-10 relative overflow-hidden shadow-2xl transition-all`}>
                    <div className="flex flex-col md:flex-row items-start gap-8">
                      <div className={`w-16 h-16 rounded-[1.25rem] ${role === UserRole.LANDLORD ? 'bg-blue-500/10 border-blue-500/20' : 'bg-indigo-500/10 border-indigo-500/20'} flex items-center justify-center shrink-0 border shadow-inner group`}>
                        <div className="transition-transform duration-500 group-hover:scale-110">
                          {m.icon || <Bot size={32} className={role === UserRole.LANDLORD ? "text-blue-400" : "text-indigo-400"} />}
                        </div>
                      </div>
                      
                      <div className="flex-grow space-y-5">
                        <div className="flex items-center gap-3">
                           <div className={`px-3 py-1 rounded-lg ${role === UserRole.LANDLORD ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'} text-[9px] font-black uppercase tracking-[0.2em]`}>
                             {m.category || "Allgemein"}
                           </div>
                           <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-[0.2em]">
                             Frage {m.qNum}
                           </div>
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl font-black text-white leading-[1.2] tracking-tight">
                          {m.text}
                        </h3>
                        
                        {m.hint && (
                          <div className={`flex gap-4 p-5 rounded-3xl ${role === UserRole.LANDLORD ? 'bg-blue-500/[0.03] border-blue-500/10' : 'bg-indigo-500/[0.03] border-indigo-500/10'} border items-start group/hint`}>
                            <div className="mt-1">
                              <Lightbulb size={18} className={`${role === UserRole.LANDLORD ? 'text-blue-400/70' : 'text-indigo-400/70'} transition-colors`} />
                            </div>
                            <p className="text-sm md:text-base text-gray-400 italic leading-relaxed">
                              <span className={`${role === UserRole.LANDLORD ? 'text-blue-400/60' : 'text-indigo-400/60'} font-black uppercase tracking-tighter text-[10px] block mb-1 not-italic`}>Tipp vom Assistenten</span>
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
                  <div className={`bg-gradient-to-br ${role === UserRole.LANDLORD ? 'from-blue-600 to-blue-700' : 'from-indigo-600 to-indigo-700'} text-white p-6 px-8 rounded-[2.5rem] rounded-tr-none shadow-xl border border-white/10`}>
                    <p className="text-lg md:text-xl font-bold tracking-tight">{m.text}</p>
                    <div className="flex justify-end mt-2 opacity-60">
                       <CheckCircle size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-pulse">
              <div className={`glass-card px-6 py-4 rounded-3xl rounded-tl-none flex gap-2 ${role === UserRole.LANDLORD ? 'border-blue-500/20' : 'border-indigo-500/20'}`}>
                <div className={`w-2.5 h-2.5 ${role === UserRole.LANDLORD ? 'bg-blue-500' : 'bg-indigo-500'} rounded-full animate-bounce`}></div>
                <div className={`w-2.5 h-2.5 ${role === UserRole.LANDLORD ? 'bg-blue-500' : 'bg-indigo-500'} rounded-full animate-bounce [animation-delay:0.2s]`}></div>
                <div className={`w-2.5 h-2.5 ${role === UserRole.LANDLORD ? 'bg-blue-500' : 'bg-indigo-500'} rounded-full animate-bounce [animation-delay:0.4s]`}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 bg-gradient-to-t from-black via-black/80 to-transparent pt-12 relative z-10">
        <div className="max-w-4xl mx-auto relative">
          <div className={`absolute -inset-1 bg-gradient-to-r ${role === UserRole.LANDLORD ? 'from-blue-500/20 to-indigo-500/20' : 'from-indigo-500/20 to-blue-500/20'} rounded-[2.5rem] blur opacity-50`}></div>
          <div className="relative group">
            <input 
              ref={inputRef}
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
              className={`absolute right-4 top-4 bottom-4 w-16 ${role === UserRole.LANDLORD ? 'bg-blue-600 hover:bg-blue-500' : 'bg-indigo-600 hover:bg-indigo-500'} disabled:opacity-20 disabled:grayscale rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 group overflow-hidden`}
            >
              <Send size={28} className="text-white relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-5 px-6">
             <div className="flex items-center gap-3">
               <span className={`w-2 h-2 rounded-full ${role === UserRole.LANDLORD ? 'bg-blue-500' : 'bg-indigo-500'} animate-pulse`}></span>
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

export default ChatAssistant;