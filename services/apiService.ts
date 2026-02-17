
/**
 * API Service für MieterMatch Datenbank-Interaktionen
 * Erkennt automatisch die Backend-URL basierend auf der aktuellen Browser-Adresse.
 */

export const getBaseUrl = () => {
  const { hostname, protocol } = window.location;
  
  // Wenn wir lokal arbeiten
  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:5000/api';
  }
  
  // In der Cloud/VM Umgebung:
  // Wir nutzen den Hostnamen des Browsers (die IP der VM) und Port 5000.
  // HINWEIS: Wenn protocol === 'https:', wird http://...:5000 oft blockiert (Mixed Content).
  // Wir geben trotzdem http zurück, da Flask standardmäßig kein SSL auf 5000 hat.
  return `http://${hostname}:5000/api`;
};

const API_BASE = getBaseUrl();
console.log(`[API Service] Backend URL: ${API_BASE}`);

export const fetchSystemStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/system-status`, { 
      method: 'GET',
      cache: 'no-store',
      mode: 'cors'
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[API] System-Status Fehler:", err);
    throw err;
  }
};

export const fetchTenants = async () => {
  try {
    const res = await fetch(`${API_BASE}/tenants`, { cache: 'no-store', mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP Fehler: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`[API] Fehler beim Laden der Mieter:`, err);
    throw err;
  }
};

export const saveTenantToDb = async (data: any) => {
  const res = await fetch(`${API_BASE}/tenants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    mode: 'cors'
  });
  if (!res.ok) throw new Error("Speichern fehlgeschlagen");
  return res.json();
};

export const fetchLandlords = async () => {
  try {
    const res = await fetch(`${API_BASE}/landlords`, { cache: 'no-store', mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP Fehler: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`[API] Fehler beim Laden der Objekte:`, err);
    throw err;
  }
};

export const saveLandlordToDb = async (data: any) => {
  const res = await fetch(`${API_BASE}/landlords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    mode: 'cors'
  });
  if (!res.ok) throw new Error("Speichern fehlgeschlagen");
  return res.json();
};
