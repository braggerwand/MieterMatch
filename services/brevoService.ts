
/**
 * Brevo API Integration Service
 * Erfordert BREVO_API_KEY in der .env Datei
 */

export const sendOfferNotification = async (email: string, phone: string, propertyName: string) => {
  console.log(`Versende Angebot für ${propertyName} an ${email} und SMS an ${phone}`);
  
  // Simulation des API-Calls zu Brevo
  // In Produktion: 
  // fetch('https://api.brevo.com/v3/smtp/email', { headers: { 'api-key': process.env.BREVO_API_KEY } ... })
  
  return true;
};
