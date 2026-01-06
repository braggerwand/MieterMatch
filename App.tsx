import React, { useState } from 'react';
import { UserRole, LandlordData, TenantData, Stats } from './types';
import { DEFAULT_STATS } from './constants';
import LandingPage from './components/LandingPage';
import ChatAssistant from './components/ChatAssistant';
import Workbench from './components/Workbench';
import LegalPage from './components/LegalPage';
import MietinteressentenProfil from './components/MietinteressentenProfil';
import SuccessPage from './components/SuccessPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.NONE);
  const [showWorkbench, setShowWorkbench] = useState(false);
  const [showLegal, setShowLegal] = useState<boolean>(false);
  const [showTenantProfile, setShowTenantProfile] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [tempTenantData, setTempTenantData] = useState<any>(null);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

  // Bearbeitungs-Status
  const [editIndices, setEditIndices] = useState<number[] | undefined>(undefined);

  const [landlords, setLandlords] = useState<LandlordData[]>([]);
  const [tenants, setTenants] = useState<TenantData[]>([]);

  const startAssistant = (role: UserRole) => {
    setCurrentRole(role);
    setEditIndices(undefined);
    setShowWorkbench(false);
    setShowLegal(false);
    setShowTenantProfile(false);
    setShowSuccess(false);
  };

  const startEditMode = (indices: number[]) => {
    // Indices im Code sind 0-basiert, die Anzeige im UI 1-basiert
    const zeroBasedIndices = indices.map(i => i - 1);
    setEditIndices(zeroBasedIndices);
    setCurrentRole(UserRole.TENANT);
    setShowTenantProfile(false);
  };

  const handleFinishChat = (data: any) => {
    if (currentRole === UserRole.TENANT) {
      // Wenn wir im Edit-Modus waren, mergen wir die Daten
      const mergedData = editIndices ? { ...tempTenantData, ...data } : data;
      setTempTenantData(mergedData);
      setShowTenantProfile(true);
      setCurrentRole(UserRole.NONE);
      setEditIndices(undefined);
    } else {
      finalizeLandlord(data);
    }
  };

  const finalizeLandlord = (data: any) => {
    const timestamp = new Date().toISOString();
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newData: LandlordData = {
      ...data,
      id: `V-${randomId}`,
      rentWarm: Number(data.rentWarm) || 0,
      sqm: Number(data.sqm) || 0,
      rooms: Number(data.rooms) || 0,
      createdAt: timestamp
    };
    setLandlords(prev => [...prev, newData]);
    setStats(prev => ({ 
      ...prev, 
      totalProperties: prev.totalProperties + 1, 
      currentProperties: prev.currentProperties + 1 
    }));
    setShowWorkbench(true);
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
      status: 'Profil nicht bestätigt', // Initialer Status gemäß Vorgabe
      createdAt: timestamp
    };
    setTenants(prev => [...prev, newData]);
    setStats(prev => ({ 
      ...prev, 
      totalProfiles: prev.totalProfiles + 1, 
      currentProfiles: prev.currentProfiles + 1 
    }));
    
    // Nach der Bestätigung zeigen wir dem Mieter die Erfolgsseite
    setShowTenantProfile(false);
    setShowSuccess(true);
  };

  const handleResetToLanding = () => {
    setCurrentRole(UserRole.NONE);
    setShowWorkbench(false);
    setShowLegal(false);
    setShowTenantProfile(false);
    setShowSuccess(false);
    setTempTenantData(null);
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
          <SuccessPage onFinish={handleResetToLanding} />
        ) : showTenantProfile ? (
          <MietinteressentenProfil 
            data={tempTenantData} 
            onConfirm={finalizeTenant} 
            onCancel={() => setShowTenantProfile(false)} 
            onEdit={startEditMode}
          />
        ) : showWorkbench ? (
          <Workbench 
            landlords={landlords} 
            tenants={tenants} 
            stats={stats}
            onAddProperty={() => startAssistant(UserRole.LANDLORD)}
          />
        ) : currentRole !== UserRole.NONE ? (
          <ChatAssistant 
            role={currentRole} 
            onCancel={() => {
              if (editIndices) {
                setShowTenantProfile(true);
                setCurrentRole(UserRole.NONE);
              } else {
                setCurrentRole(UserRole.NONE);
              }
            }} 
            onFinish={handleFinishChat}
            editIndices={editIndices}
            initialData={tempTenantData}
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