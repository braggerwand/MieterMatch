
import React, { useState, useEffect } from 'react';
import { UserRole, LandlordData, TenantData, Stats } from './types';
import { DEFAULT_STATS } from './constants';
import LandingPage from './components/LandingPage';
import ChatAssistant from './components/ChatAssistant';
import LegalPage from './components/LegalPage';
import MietinteressentenProfil from './components/MietinteressentenProfil';
import VermieterObjektProfil from './components/VermieterObjektProfil';
import TenantSelectionPage from './components/TenantSelectionPage';
import SuccessPage from './components/SuccessPage';
import VerificationDialog from './components/VerificationDialog';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { sendOfferNotification, sendVerificationCode } from './services/brevoService';
import { fetchProfiles, saveProfileToDb } from './services/profileService';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.NONE);
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

  // Initiales Laden aus der Cloud-DB
  useEffect(() => {
    const loadData = async () => {
      const dbTenants = await fetchProfiles('TENANT');
      const dbLandlords = await fetchProfiles('LANDLORD');
      
      // Migration: Falls noch lokale Daten existieren, diese hochladen
      const localTenants = JSON.parse(localStorage.getItem('mm_tenants') || '[]');
      const localLandlords = JSON.parse(localStorage.getItem('mm_landlords') || '[]');
      
      if (localTenants.length > 0 && dbTenants.length === 0) {
        for (const t of localTenants) await saveProfileToDb(t);
        setTenants(localTenants);
        localStorage.removeItem('mm_tenants');
      } else {
        setTenants(dbTenants.length > 0 ? dbTenants : []);
      }

      if (localLandlords.length > 0 && dbLandlords.length === 0) {
        for (const l of localLandlords) await saveProfileToDb(l);
        setLandlords(localLandlords);
        localStorage.removeItem('mm_landlords');
      } else {
        setLandlords(dbLandlords.length > 0 ? dbLandlords : []);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      currentProfiles: tenants.filter(t => t.isVerified).length,
      totalProfiles: Math.max(800, tenants.length + 800)
    }));
  }, [tenants]);

  const startAssistant = (role: UserRole) => {
    setCurrentRole(role);
    setEditIndices(undefined);
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

  const initiateVerification = (data: any, type: 'profile' | 'offer') => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setPendingData({ data, type });
    setVerificationError(null);
    setIsDemoMode(false);
    
    setShowVerification(true);
    
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

  const handleVerify = async (code: string) => {
    if (code === generatedCode) {
      if (pendingData.type === 'profile') {
        const newData = { ...pendingData.data, isVerified: true, status: 'Profil aktiv' };
        await saveProfileToDb(newData); // Cloud Save
        setTenants(prev => [...prev, newData]);
        setSuccessType('profile');
        setShowTenantProfile(false);
      } else {
        const newData = { ...pendingData.data, isVerified: true };
        await saveProfileToDb(newData); // Cloud Save
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
      <Navbar onHome={handleResetToLanding} />

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
