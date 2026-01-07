
/**
 * Brevo Proxy Service - Simulation für den Betrieb ohne Backend
 */

export interface BrevoResponse {
  success: boolean;
  errorType?: 'NETWORK_ERROR' | 'API_ERROR';
  details?: string;
}

export const sendVerificationCode = async (email: string, phone: string, code: string): Promise<BrevoResponse> => {
  // Da kein Backend vorhanden ist, simulieren wir den Erfolg sofort.
  // Der Code wird in der App.tsx im "Demo-Modus" abgefangen und angezeigt.
  console.log(`[SIMULATION] Verifizierungscode für ${email}: ${code}`);
  
  return { 
    success: false, // Wir geben false zurück, damit die App in den hilfreichen Demo-Modus schaltet
    errorType: 'NETWORK_ERROR', 
    details: 'Lokaler Testmodus aktiv (Kein Backend erforderlich)' 
  };
};

export const sendOfferNotification = async (email: string, phone: string, propertyTitle: string): Promise<BrevoResponse> => {
  console.log(`[SIMULATION] Angebot für ${propertyTitle} an ${email} gesendet.`);
  return { success: true };
};
