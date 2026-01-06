
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

const MOCK_TENANTS: TenantData[] = [
  {
    id: "M-7241",
    desiredLocation: "Berlin Mitte, Prenzlauer Berg",
    minSqm: 65,
    minRooms: 2,
    preferredFloor: "Zwischengeschoss",
    gardenOrBalcony: "Balkon bevorzugt",
    parkingNeeded: "Egal",
    kitchenIncluded: "Ja",
    buildingCondition: "Altbau saniert",
    maxRent: 1600,
    householdIncome: 4800,
    incomeType: "Gehalt (unbefristet)",
    incomeDetails: "Senior Software Engineer bei TechCorp",
    email: "berlin-living@example.com",
    phone: "+49 176 1234567",
    personalIntro: "Ruhiger Mieter, Nichtraucher, keine Haustiere. Suche langfristiges Zuhause nahe der Arbeit.",
    status: "Profil aktiv",
    createdAt: new Date().toISOString(),
    isVerified: true
  }
];

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

  const [landlords, setLandlords] = useState<LandlordData[]>(() => {
    const saved = localStorage.getItem('mm_landlords');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [tenants, setTenants] = useState<TenantData[]>(() => {
    const saved = localStorage.getItem('mm_tenants');
    return saved ? JSON.parse(saved) : MOCK_TENANTS;
  });

  useEffect(() => {
    localStorage.setItem('mm_landlords', JSON.stringify(landlords));
  }, [landlords]);

  useEffect(() => {
    localStorage.setItem('mm_tenants', JSON.stringify(tenants));
    setStats(prev => ({
      ...prev,
      currentProfiles: tenants.filter(t => t.isVerified).length,
      totalProfiles: Math.max(prev.totalProfiles, tenants.length + 800)
    }));
  }, [tenants]);

  const startAssistant = (role: UserRole) => {
    setCurrentRole(role);
    setEditIndices(undefined);
    setShowWorkbench(false);
    setShowLegal(false);
    setShowTenantProfile(false);
    setShowLandlordProfile(false);
    setShowTenantSelection(false);
    setShowSuccess(false);
  };

  const startEditMode = (indices: number[]) => {
    const zeroBasedIndices = indices.map(i => i - 1);
    setEditIndices(zeroBasedIndices);
    if (showTenantProfile) setCurrentRole(UserRole.TENANT);
    if (showLandlordProfile) setCurrentRole(UserRole.LANDLORD);
    setShowTenantProfile(false);
    setShowLandlordProfile(false);
  };

  const handleFinishChat = (data: any) => {
    if (currentRole === UserRole.TENANT) {
      const mergedData = editIndices ? { ...tempTenantData, ...data } : data;
      setTempTenantData(mergedData);
      setShowTenantProfile(true);
      setCurrentRole(UserRole.NONE);
    } else if (currentRole === UserRole.LANDLORD) {
      const mergedData = editIndices ? { ...tempLandlordData, ...data } : data;
      setTempLandlordData(mergedData);
      setShowLandlordProfile(true);
      setCurrentRole(UserRole.NONE);
    }
    setEditIndices(undefined);
  };

  /**
   * REFI-Korrektur: Nicht-blockierende Verifizierung
   * Öffnet sofort den Dialog und startet den Versand im Hintergrund.
   */
  const initiateVerification = (data: any, type: 'profile' | 'offer') => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setPendingData({ data, type });
    setVerificationError(null);
    setIsDemoMode(false);
    
    // 1. Dialog SOFORT öffnen, um den Ladezustand im Profil-Screen zu beenden
    setShowVerification(true);
    
    // 2. Netzwerk-Aufruf im Hintergrund starten (kein 'await' hier!)
    sendVerificationCode(data.email, data.phone, code).then(res => {
      if (!res.success) {
        console.warn("Echtzeit-Versand fehlgeschlagen, wechsle in Diagnose-Modus.");
        setIsDemoMode(true);
        setVerificationError({ type: res.errorType, message: res.details });
      }
    }).catch(err => {
      console.error("Kritischer Backend-Fehler:", err);
      setIsDemoMode(true);
      setVerificationError({ type: 'NETWORK_ERROR', message: 'Backend nicht erreichbar.' });
    });
  };

  const handleVerify = (code: string) => {
    if (code === generatedCode) {
      if (pendingData.type === 'profile') {
        const newData = { ...pendingData.data, isVerified: true, status: 'Profil aktiv' };
        setTenants(prev => [...prev, newData]);
        setSuccessType('profile');
        setShowTenantProfile(false);
      } else {
        const newData = { ...pendingData.data, isVerified: true };
        setLandlords(prev => [...prev, newData]);
        setSuccessType('offer');
        setShowTenantSelection(false);
      }
      setShowVerification(false);
      setShowSuccess(true);
    } else {
      alert("Falscher Code. Bitte prüfen Sie Ihre E-Mails.");
    }
  };

  const finalizeLandlordReview = async (updatedData: Partial<LandlordData>) => {
    const timestamp = new Date().toISOString();
    const randomId = Math.floor(1000 + Math.random() * 9000);
    
    const cold = Number(updatedData.rentCold) || 0;
    const extra = Number(updatedData.serviceCharges) || 0;
    const park = Number(updatedData.parkingRent) || 0;
    const other = Number(updatedData.otherCosts) || 0;
    const rentWarm = cold + extra + park + other;

    const zipCodeMatch = (updatedData.address || '').match(/\b\d{5}\b/);
    const zipCode = zipCodeMatch ? zipCodeMatch[0] : 'unbekannt';

    const newData: LandlordData = {
      ...updatedData as any,
      rentWarm,
      zipCode,
      id: `V-${randomId}`,
      propertyTitle: updatedData.address ? updatedData.address.split(',')[0] : 'Mietobjekt',
      status: 'aktiv',
      createdAt: timestamp,
    };
    
    setActiveLandlord(newData);
    setShowLandlordProfile(false);
    setShowTenantSelection(true);
  };

  const handleOfferProperty = async (selectedTenantIds: string[]) => {
    if (!activeLandlord) return;

    for (const tenantId of selectedTenantIds) {
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
        sendOfferNotification(tenant.email, tenant.phone, activeLandlord.propertyTitle || 'Objekt');
      }
    }

    initiateVerification(activeLandlord, 'offer');
  };

  const finalizeTenant = async (updatedData: Partial<TenantData>) => {
    const timestamp = new Date().toISOString();
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newData: TenantData = {
      ...updatedData as any,
      id: `M-${randomId}`,
      status: 'Profil nicht bestätigt', 
      createdAt: timestamp
    };
    
    initiateVerification(newData, 'profile');
  };

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
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05070a] text-white overflow-x-hidden">
      <Navbar onHome={handleResetToLanding} onWorkbench={() => setShowWorkbench(true)} />

      <main className="flex-grow">
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
            onEdit={startEditMode}
          />
        ) : showLandlordProfile ? (
          <VermieterObjektProfil 
            data={tempLandlordData} 
            onConfirm={finalizeLandlordReview} 
            onCancel={() => setShowLandlordProfile(false)} 
            onEdit={startEditMode}
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
            onCancel={() => {
              if (editIndices) {
                if (currentRole === UserRole.TENANT) setShowTenantProfile(true);
                if (currentRole === UserRole.LANDLORD) setShowLandlordProfile(true);
                setCurrentRole(UserRole.NONE);
              } else {
                setCurrentRole(UserRole.NONE);
              }
            }} 
            onFinish={handleFinishChat}
            editIndices={editIndices}
            initialData={currentRole === UserRole.TENANT ? tempTenantData : tempLandlordData}
          />
        ) : (
          <LandingPage onStart={startAssistant} stats={stats} />
        )}
      </main>

      <Footer onLegal={() => setShowLegal(true)} />
    </div>
  );
};

export default App;
