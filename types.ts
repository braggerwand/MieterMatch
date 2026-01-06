
export enum UserRole {
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT',
  NONE = 'NONE'
}

export type TenantStatus = 'Profil aktiv' | 'Profil nicht bestätigt';
export type LandlordStatus = 'aktiv' | 'nicht aktiv';

export interface PropertyImage {
  data: string;
  description: string;
}

export interface LandlordData {
  id: string; // V-XXXX
  address: string;         // Frage 1
  sqm: number;             // Frage 2
  rooms: number;           // Frage 3
  floor: string;           // Frage 4
  gardenOrBalcony: string; // Frage 5
  parkingDetails: string;  // Frage 6
  kitchenDetails: string;  // Frage 7
  buildingAge: string;     // Frage 8
  rentCold: number;        // Frage 9
  serviceCharges: number;  // Frage 10
  parkingRent: number;     // Frage 11
  otherCosts: number;      // Frage 12
  // Hinzugefügte berechnete Felder für Matching und UI
  rentWarm: number;        // Summe aus Kaltmiete, Nebenkosten, Stellplatz und Sonstiges
  zipCode: string;         // Extrahiert aus der Adresse für regionales Matching
  email: string;           // Frage 13
  phone: string;           // Frage 14
  propertyTitle?: string;  // Generierter Titel aus Adresse
  status: LandlordStatus;  // Neu: Status des Objekts
  createdAt: string;
  images?: PropertyImage[]; // Optionale Bildergalerie
}

export interface TenantData {
  id: string; // M-XXXX
  desiredLocation: string;   
  minSqm: number;            
  minRooms: number;          
  preferredFloor: string;    
  gardenOrBalcony: string;   
  parkingNeeded: string;     
  kitchenIncluded: string;   
  buildingCondition: string; 
  maxRent: number;           
  householdIncome: number;   
  incomeType: string;        
  incomeDetails: string;     
  email: string;             
  phone: string;             
  personalIntro?: string;    
  profileImage?: string;     
  status: TenantStatus;      
  createdAt: string;
}

export interface Stats {
  totalProperties: number;
  currentProperties: number;
  totalProfiles: number;
  currentProfiles: number;
  offersSent: number;
}

export interface MatchResult {
  tenant: TenantData;
  score: number;
  reasoning: string;
  incomeSuitability: string;
}
