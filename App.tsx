
import React, { useState, useEffect } from 'react';
import { UserRole, LandlordData, TenantData, Stats } from './types';
import { DEFAULT_STATS } from './constants';
import LandingPage from './components/LandingPage';
import ChatAssistant from './components/ChatAssistant';
import Workbench from './components/Workbench';
import LegalPage from './components/LegalPage';
import MietinteressentenProfil from './components/MietinteressentenProfil';
import VermieterObjektProfil from './components/VermieterObjektProfil';
import TenantSelectionPage from './components/TenantSelectionPage';
import SuccessPage from './components/SuccessPage';
import VerificationDialog from './components/VerificationDialog';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { sendOfferNotification, sendVerificationCode } from './services/brevoService';
import { fetchLandlords, fetchTenants, saveLandlordToDb, saveTenantToDb, fetchSystemStatus, getBaseUrl } from './services/apiService';
import { AlertCircle, RefreshCw, Terminal, Globe, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.NONE);
  const [showWorkbench, setShowWorkbench] = useState(false);
  const [showLegal, setShowLegal] = useState<boolean>(false);
  const [showTenantProfile, setShowTenantProfile] = useState<boolean>(false);
  const [showLandlordProfile, setShowLandlordProfile] = useState<boolean>(false);
  const [showTenantSelection, setShowTenantSelection] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successType, setSuccessType] = useState<'profile' | 'offer'>('profile');
  
  const [showVerification, setShowVerification] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [verificationError, setVerificationError] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [pendingData, setPendingData] = useState<any>(null);

  const [tempTenantData, setTempTenantData] = useState<any>(null);
  const [tempLandlordData, setTempLandlordData] = useState<any>(null);
  const [activeLandlord, setActiveLandlord] = useState<LandlordData | null>(null);
  
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [editIndices, setEditIndices] = useState<number[] | undefined>(undefined);

  const [landlords, setLandlords] = useState<LandlordData[]>([]);
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Zentrale Daten vom Server laden
  const loadDataFromServer = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      console.log("[App] Starte Initialisierung...");
      await fetchSystemStatus();
      
      const [lData, tData] = await Promise.all([fetchLandlords(), fetchTenants()]);
      setLandlords(lData);
      setTenants(tData);
      
      setStats(prev => ({
        ...prev,
        currentProfiles: tData.filter((t: any) => t.isVerified).length,
        totalProfiles: Math.max(DEFAULT_STATS.totalProfiles, tData.length + 800),
        totalProperties: Math.max(DEFAULT_STATS.totalProperties, lData.length + 100)
      }));
    } catch (err) {
      console.error("Verbindungsfehler zum Backend:", err);
      setConnectionError("Backend nicht erreichbar.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromServer();
  }, []);

  const isMixedContent = window.location.protocol === 'https:' && getBaseUrl().startsWith('http:');

  const handleResetToLanding = () => {
    setCurrentRole(UserRole.NONE);
    setShowWorkbench(false);
    setShowLegal(false);
    setShowTenantProfile(false);
    setShowLandlordProfile(false);
    setShowTenantSelection(false);
    setShowSuccess(false);
    setTempTenantData(null);
    setTempLandlordData(null);
    setActiveLandlord(null);
    setShowVerification(false);
    loadDataFromServer();
  };

  const startAssistant = (role: UserRole) => {
    setCurrentRole(role);
    setEditIndices(undefined);
  };

  const handleFinishChat = (data: any) => {
    if (currentRole === UserRole.TENANT) {
      setTempTenantData(data);
      setShowTenantProfile(true);
    } else if (currentRole === UserRole.LANDLORD) {
      setTempLandlordData(data);
      setShowLandlordProfile(true);
    }
    setCurrentRole(UserRole.NONE);
  };

  // FIX: Finalisierung der Mieter-Daten und Start der Verifizierung
  const finalizeTenant = async (data: Partial<TenantData>) => {
    initiateVerification(data, 'profile');
  };

  // FIX: Finalisierung der Vermieter-Review und Wechsel zur Mieter-Auswahl
  const finalizeLandlordReview = async (data: Partial<LandlordData>) => {
    setTempLandlordData(data);
    setActiveLandlord(data as LandlordData);
    setShowLandlordProfile(false);
    setShowTenantSelection(true);
  };

  // FIX: Verifizierung starten, nachdem Mieter für ein Angebot ausgewählt wurden
  const handleOfferProperty = async (selectedTenantIds: string[]) => {
    initiateVerification({ ...tempLandlordData, selectedTenants: selectedTenantIds }, 'offer');
  };

  const initiateVerification = (data: any, type: 'profile' | 'offer') => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setPendingData({ data, type });
    setShowVerification(true);
    
    sendVerificationCode(data.email, data.phone, code).then(res => {
      if (!res.success) {
        setIsDemoMode(true);
        setVerificationError({ type: res.errorType, message: res.details });
      }
    });
  };

  const handleVerify = async (code: string) => {
    if (code === generatedCode) {
      if (pendingData.type === 'profile') {
        await saveTenantToDb({ ...pendingData.data, isVerified: true, status: 'Profil aktiv' });
        setSuccessType('profile');
        setShowTenantProfile(false);
      } else {
        await saveLandlordToDb({ ...pendingData.data, isVerified: true });
        setSuccessType('offer');
        setShowTenantSelection(false);
      }
      await loadDataFromServer(); 
      setShowSuccess(true);
      setShowVerification(false);
    } else {
      alert("Falscher Code.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05070a] text-white overflow-x-hidden">
      <Navbar onHome={handleResetToLanding} onWorkbench={() => setShowWorkbench(true)} />
      
      <main className="flex-grow">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <RefreshCw className="text-indigo-500 animate-spin mb-4" size={48} />
            <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Initialisierung...</p>
          </div>
        ) : connectionError ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-fade-in">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20 shadow-2xl shadow-red-500/5">
              <AlertCircle className="text-red-500" size={40} />
            </div>
            <h2 className="text-3xl font-black mb-4">Verbindung zum Backend fehlgeschlagen</h2>
            
            <div className="max-w-2xl w-full space-y-4 mb-8">
              <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/40 text-left">
                <div className="flex items-center gap-3 mb-4 text-indigo-400">
                  <Globe size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Analyse der Anfrage</span>
                </div>
                <div className="space-y-2 font-mono text-[11px]">
                  <p className="text-gray-500">Ziel-URL:</p>
                  <p className="p-2 bg-white/5 rounded border border-white/10 text-white break-all">{getBaseUrl()}</p>
                  
                  {isMixedContent && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                      <Lock className="text-amber-500 shrink-0" size={16} />
                      <div className="text-amber-500 text-[10px] leading-relaxed uppercase font-bold">
                        Achtung: Mixed Content Blockade! Du nutzt HTTPS, aber das Backend ist HTTP. 
                        Bitte rufe die Seite über <span className="underline">http://</span> (ohne S) auf.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/40 text-left">
                <div className="flex items-center gap-3 mb-4 text-gray-500">
                  <Terminal size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Lösungsschritte (VM)</span>
                </div>
                <ol className="list-decimal list-inside text-xs text-gray-400 space-y-2">
                  <li>Prüfe, ob <code className="text-white px-1 bg-white/5 rounded">python3 main.py</code> läuft.</li>
                  <li>Prüfe die Firewall (GCP) für Port <code className="text-white">5000</code>.</li>
                  <li>Nutze die IP deiner VM direkt im Browser mit <code className="text-white">http://...</code></li>
                </ol>
              </div>
            </div>

            <button 
              onClick={loadDataFromServer}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
            >
              <RefreshCw size={16} /> Erneut versuchen
            </button>
          </div>
        ) : (
          <>
            {showVerification && (
              <VerificationDialog 
                email={pendingData?.data?.email} 
                onVerify={handleVerify} 
                onCancel={() => setShowVerification(false)} 
                demoCode={isDemoMode ? generatedCode : undefined}
                errorDetails={verificationError}
              />
            )}
            {showLegal ? (
              <LegalPage onClose={() => setShowLegal(false)} />
            ) : showSuccess ? (
              <SuccessPage onFinish={handleResetToLanding} type={successType} />
            ) : showTenantSelection && activeLandlord ? (
              <TenantSelectionPage 
                landlord={activeLandlord}
                tenants={tenants}
                onConfirm={handleOfferProperty}
                onCancel={() => setShowTenantSelection(false)}
              />
            ) : showTenantProfile ? (
              <MietinteressentenProfil 
                data={tempTenantData} 
                onConfirm={finalizeTenant} 
                onCancel={() => setShowTenantProfile(false)} 
                onEdit={(idx) => { setEditIndices(idx.map(i => i-1)); setShowTenantProfile(false); setCurrentRole(UserRole.TENANT); }}
              />
            ) : showLandlordProfile ? (
              <VermieterObjektProfil 
                data={tempLandlordData} 
                onConfirm={finalizeLandlordReview} 
                onCancel={() => setShowLandlordProfile(false)} 
                onEdit={(idx) => { setEditIndices(idx.map(i => i-1)); setShowLandlordProfile(false); setCurrentRole(UserRole.LANDLORD); }}
              />
            ) : showWorkbench ? (
              <Workbench 
                landlords={landlords} 
                tenants={tenants} 
                stats={stats}
                onAddProperty={() => startAssistant(UserRole.LANDLORD)}
                onClose={() => setShowWorkbench(false)}
              />
            ) : currentRole !== UserRole.NONE ? (
              <ChatAssistant 
                role={currentRole} 
                onCancel={() => setCurrentRole(UserRole.NONE)} 
                onFinish={handleFinishChat}
                editIndices={editIndices}
                initialData={currentRole === UserRole.TENANT ? tempTenantData : tempLandlordData}
              />
            ) : (
              <LandingPage onStart={startAssistant} stats={stats} />
            )}
          </>
        )}
      </main>
      
      <Footer onLegal={() => setShowLegal(true)} />
    </div>
  );
};

export default App;
