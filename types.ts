export enum UserRole {
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT',
  NONE = 'NONE'
}

export type TenantStatus = 'Profil aktiv' | 'Profil nicht bestätigt';

export interface LandlordData {
  id: string; // V-XXXX
  email: string;
  phone: string;
  propertyTitle: string;
  zipCode: string;     // Wichtig für lokales Matching
  rentWarm: number;
  sqm: number;
  rooms: number;
  description: string;
  createdAt: string;
}

export interface TenantData {
  id: string; // M-XXXX
  // Die 14 Felder aus dem Chat
  desiredLocation: string;   // Frage 1
  minSqm: number;            // Frage 2
  minRooms: number;          // Frage 3
  preferredFloor: string;    // Frage 4
  gardenOrBalcony: string;   // Frage 5
  parkingNeeded: string;     // Frage 6
  kitchenIncluded: string;   // Frage 7
  buildingCondition: string; // Frage 8
  maxRent: number;           // Frage 9
  householdIncome: number;   // Frage 10
  incomeType: string;        // Frage 11
  incomeDetails: string;     // Frage 12
  email: string;             // Frage 13
  phone: string;             // Frage 14
  personalIntro?: string;    // Freitext Vorstellung
  profileImage?: string;     // Base64 oder URL des Profilbilds/Grafik
  status: TenantStatus;      // Status des Profils (aktiv/nicht bestätigt)
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