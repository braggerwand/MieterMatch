
/**
 * Brevo Proxy Service - Verbunden mit Flask Backend auf Port 5000
 */

const getBackendUrl = () => {
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Wenn wir auf localhost sind, nutzen wir localhost
  if (host === 'localhost' || host === '127.0.0.1' || !host) {
    return `http://127.0.0.1:5000/api`;
  }
  
  // In einer VM/Google Cloud nutzen wir die aktuelle IP/Domain auf Port 5000
  // Hinweis: Wenn die Seite via HTTPS geladen wird, muss auch das Backend via HTTPS (Proxy) erreichbar sein.
  // Für die Entwicklung auf VMs nutzen wir meistens die IP.
  return `${protocol}//${host}:5000/api`;
};

const BACKEND_URL = getBackendUrl();

export interface BrevoResponse {
  success: boolean;
  errorType?: 'CORS_BLOCKED' | 'INVALID_KEY' | 'MISSING_KEY' | 'NETWORK_ERROR' | 'TIMEOUT' | 'API_ERROR';
  details?: string;
}

async function fetchWithTimeout(url: string, options: any, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    throw error;
  }
}

export const sendVerificationCode = async (email: string, phone: string, code: string): Promise<BrevoResponse> => {
  try {
    const targetUrl = `${BACKEND_URL}/send-verification`;
    console.log(`Versuche Backend zu erreichen: ${targetUrl}`);
    
    const response = await fetchWithTimeout(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, phone })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          errorType: 'API_ERROR', 
          details: errorData.details || `Server antwortete mit Status ${response.status}`
        };
    }

    const result = await response.json();
    return { 
      success: result.success, 
      errorType: result.error, 
      details: result.details 
    };
  } catch (error: any) {
    console.error("Brevo Service Netzwerkfehler:", error);
    let message = `Konnte Backend unter ${BACKEND_URL} nicht erreichen.`;
    
    if (error.name === 'AbortError') {
      return { success: false, errorType: 'TIMEOUT', details: "Das Backend antwortet zu langsam." };
    }

    return { 
      success: false, 
      errorType: 'NETWORK_ERROR', 
      details: `${message} Bitte prüfen Sie, ob "python3 main.py" im Terminal läuft und Port 5000 offen ist.` 
    };
  }
};

export const sendOfferNotification = async (email: string, phone: string, propertyTitle: string): Promise<BrevoResponse> => {
  try {
    const response = await fetchWithTimeout(`${BACKEND_URL}/send-offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, propertyTitle })
    }, 5000);
    
    if (!response.ok) return { success: false, errorType: 'API_ERROR' };
    
    const result = await response.json();
    return { success: result.success };
  } catch (error) {
    return { success: false, errorType: 'NETWORK_ERROR' };
  }
};
