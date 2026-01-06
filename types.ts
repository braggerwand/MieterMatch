
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
  id: string; 
  address: string;         
  sqm: number;             
  rooms: number;           
  floor: string;           
  gardenOrBalcony: string; 
  parkingDetails: string;  
  kitchenDetails: string;  
  buildingAge: string;     
  rentCold: number;        
  serviceCharges: number;  
  parkingRent: number;     
  otherCosts: number;      
  rentWarm: number;        
  zipCode: string;         
  email: string;           
  phone: string;           
  propertyTitle?: string;  
  status: LandlordStatus;  
  createdAt: string;
  images?: PropertyImage[]; 
  isVerified?: boolean; // NEU
}

export interface TenantData {
  id: string; 
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
  isVerified?: boolean; // NEU
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
