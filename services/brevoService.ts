
/**
 * Brevo Proxy Service - Kommuniziert mit dem Flask Backend auf Port 5000
 */
import { getBaseUrl } from './apiService';

const getApiEndpoint = (path: string) => {
  const base = getBaseUrl();
  return `${base}${path}`;
};

export interface BrevoResponse {
  success: boolean;
  errorType?: 'CORS_BLOCKED' | 'INVALID_KEY' | 'MISSING_KEY' | 'NETWORK_ERROR' | 'TIMEOUT' | 'API_ERROR';
  details?: string;
}

async function fetchWithTimeout(url: string, options: any, timeout = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      mode: 'cors'
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') throw new Error('TIMEOUT');
    throw error;
  }
}

export const sendVerificationCode = async (email: string, phone: string, code: string): Promise<BrevoResponse> => {
  const targetUrl = getApiEndpoint('/send-verification');
  
  try {
    const response = await fetchWithTimeout(targetUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, code, phone })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        return { 
          success: false, 
          errorType: result.error || 'API_ERROR', 
          details: result.details || `Server antwortete mit Status ${response.status}`
        };
    }

    return { 
      success: true, 
      details: result.details 
    };
  } catch (error: any) {
    console.error("BrevoService Netzwerkfehler:", error);
    
    let details = "Das Backend (main.py) ist unter dieser Adresse nicht erreichbar.";
    let errorType: BrevoResponse['errorType'] = 'NETWORK_ERROR';

    if (error.message === 'TIMEOUT') {
      errorType = 'TIMEOUT';
      details = "Die Verbindung zum Server hat zu lange gedauert.";
    } else if (window.location.protocol === 'https:' && targetUrl.startsWith('http:')) {
      errorType = 'CORS_BLOCKED';
      details = "Browser blockiert Anfrage (HTTPS zu HTTP). Bitte nutzen Sie die HTTP-Version der Seite.";
    }

    return { success: false, errorType, details };
  }
};

export const sendOfferNotification = async (email: string, phone: string, propertyTitle: string): Promise<BrevoResponse> => {
  const targetUrl = getApiEndpoint('/send-offer');
  
  try {
    const response = await fetchWithTimeout(targetUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, propertyTitle })
    }, 8000);
    
    const result = await response.json();
    return { success: result.success && response.ok };
  } catch (error) {
    return { success: false, errorType: 'NETWORK_ERROR' };
  }
};
