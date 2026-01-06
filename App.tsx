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
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { sendOfferNotification } from './services/brevoService';

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
    createdAt: new Date().toISOString()
  },
  {
    id: "M-3892",
    desiredLocation: "Hamburg Altona, Eimsbüttel",
    minSqm: 85,
    minRooms: 3,
    preferredFloor: "Egal",
    gardenOrBalcony: "Garten oder Balkon",
    parkingNeeded: "Stellplatz benötigt",
    kitchenIncluded: "Ja",
    buildingCondition: "Neubau",
    maxRent: 2200,
    householdIncome: 6200,
    incomeType: "Selbstständig / Gehalt",
    incomeDetails: "Marketing Leitung & Freiberuflicher Designer",
    email: "hamburg-family@example.com",
    phone: "+49 151 9876543",
    personalIntro: "Junges Paar mit Kleinkind. Wir legen Wert auf eine grüne Umgebung und gute Nachbarschaft.",
    status: "Profil aktiv",
    createdAt: new Date().toISOString()
  },
  {
    id: "M-1055",
    desiredLocation: "München, Schwabing",
    minSqm: 40,
    minRooms: 1,
    preferredFloor: "Dachgeschoss",
    gardenOrBalcony: "Egal",
    parkingNeeded: "Nein",
    kitchenIncluded: "Ja",
    buildingCondition: "Gepflegter Altbau",
    maxRent: 1100,
    householdIncome: 3100,
    incomeType: "Rente",
    incomeDetails: "Pensionierte Lehrerin",
    email: "m-schwabing@example.com",
    phone: "+49 160 5556667",
    personalIntro: "Suche kleine, charmante Wohnung in zentraler Lage. Sehr zuverlässig und ordnungsliebend.",
    status: "Profil aktiv",
    createdAt: new Date().toISOString()
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
  
  const [tempTenantData, setTempTenantData] = useState<any>(null);
  const [tempLandlordData, setTempLandlordData] = useState<any>(null);
  const [activeLandlord, setActiveLandlord] = useState<LandlordData | null>(null);
  
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [editIndices, setEditIndices] = useState<number[] | undefined>(undefined);

  // Initialisierung aus LocalStorage
  const [landlords, setLandlords] = useState<LandlordData[]>(() => {
    const saved = localStorage.getItem('mm_landlords');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [tenants, setTenants] = useState<TenantData[]>(() => {
    const saved = localStorage.getItem('mm_tenants');
    return saved ? JSON.parse(saved) : MOCK_TENANTS;
  });

  // Effekt zur automatischen Speicherung bei Änderungen
  useEffect(() => {
    localStorage.setItem('mm_landlords', JSON.stringify(landlords));
  }, [landlords]);

  useEffect(() => {
    localStorage.setItem('mm_tenants', JSON.stringify(tenants));
    // Update Stats basierend auf tatsächlichen Daten
    setStats(prev => ({
      ...prev,
      currentProfiles: tenants.length,
      totalProfiles: Math.max(prev.totalProfiles, tenants.length + 800) // Dummy Offset für die Optik
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

  const finalizeLandlordReview = (updatedData: Partial<LandlordData>) => {
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
      address: updatedData.address || '',
      sqm: Number(updatedData.sqm) || 0,
      rooms: Number(updatedData.rooms) || 0,
      floor: updatedData.floor || '',
      gardenOrBalcony: updatedData.gardenOrBalcony || '',
      parkingDetails: updatedData.parkingDetails || '',
      kitchenDetails: updatedData.kitchenDetails || '',
      buildingAge: updatedData.buildingAge || '',
      rentCold: cold,
      serviceCharges: extra,
      parkingRent: park,
      otherCosts: other,
      rentWarm: rentWarm,
      zipCode: zipCode,
      email: updatedData.email || '',
      phone: updatedData.phone || '',
      id: `V-${randomId}`,
      propertyTitle: updatedData.address ? updatedData.address.split(',')[0] : 'Mietobjekt',
      status: 'aktiv',
      createdAt: timestamp,
      images: updatedData.images
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
        await sendOfferNotification(tenant.email, tenant.phone, activeLandlord.propertyTitle || 'Objekt');
      }
    }

    setLandlords(prev => [...prev, activeLandlord]);
    setStats(prev => ({ 
      ...prev, 
      totalProperties: prev.totalProperties + 1, 
      currentProperties: prev.currentProperties + 1,
      offersSent: prev.offersSent + selectedTenantIds.length
    }));

    setSuccessType('offer');
    setShowTenantSelection(false);
    setShowSuccess(true);
  };

  const finalizeTenant = (updatedData: Partial<TenantData>) => {
    const timestamp = new Date().toISOString();
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newData: TenantData = {
      desiredLocation: updatedData.desiredLocation || '',
      minSqm: Number(updatedData.minSqm) || 0,
      minRooms: Number(updatedData.minRooms) || 0,
      preferredFloor: updatedData.preferredFloor || '',
      gardenOrBalcony: updatedData.gardenOrBalcony || '',
      parkingNeeded: updatedData.parkingNeeded || '',
      kitchenIncluded: updatedData.kitchenIncluded || '',
      buildingCondition: updatedData.buildingCondition || '',
      maxRent: Number(updatedData.maxRent) || 0,
      householdIncome: Number(updatedData.householdIncome) || 0,
      incomeType: updatedData.incomeType || '',
      incomeDetails: updatedData.incomeDetails || '',
      email: updatedData.email || '',
      phone: updatedData.phone || '',
      personalIntro: updatedData.personalIntro,
      profileImage: updatedData.profileImage,
      id: `M-${randomId}`,
      status: 'Profil aktiv', 
      createdAt: timestamp
    };
    
    setTenants(prev => [...prev, newData]);
    setSuccessType('profile');
    setShowTenantProfile(false);
    setShowSuccess(true);
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05070a] text-white overflow-x-hidden">
      <Navbar 
        onHome={handleResetToLanding} 
        onWorkbench={() => setShowWorkbench(true)}
      />

      <main className="flex-grow">
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