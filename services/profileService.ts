
import { TenantData, LandlordData } from "../types";

// In dieser Version verzichten wir komplett auf Fetch-Aufrufe, 
// da der User kein Backend im Terminal starten möchte.
export const fetchProfiles = async (role?: 'TENANT' | 'LANDLORD'): Promise<any[]> => {
  // Wir simulieren eine kurze Ladezeit für das UI-Gefühl
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const key = role === 'TENANT' ? 'mm_tenants' : 'mm_landlords';
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  return data;
};

export const saveProfileToDb = async (data: TenantData | LandlordData): Promise<boolean> => {
  // Wir simulieren eine kurze Ladezeit
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const isTenant = (data as any).desiredLocation !== undefined;
  const key = isTenant ? 'mm_tenants' : 'mm_landlords';
  
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  // Prüfen, ob ID schon existiert (Update) oder neu hinzufügen
  const index = existing.findIndex((item: any) => item.id === data.id);
  
  if (index > -1) {
    existing[index] = data;
  } else {
    existing.push(data);
  }
  
  localStorage.setItem(key, JSON.stringify(existing));
  return true;
};
