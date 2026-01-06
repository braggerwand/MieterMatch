
import { GoogleGenAI, Type } from "@google/genai";
import { LandlordData, TenantData, MatchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });

export const getAUMatching = async (property: LandlordData, tenant: TenantData): Promise<MatchResult> => {
  // Korrektur: Wir verwenden existierende Felder aus TenantData (householdIncome, incomeType, incomeDetails, desiredLocation)
  // anstelle von nicht definierten Feldern (occupants, searchDescription).
  const prompt = `
    Analysiere die Übereinstimmung zwischen einem Mietobjekt und einem Mietinteressenten.
    Objekt: ${property.propertyTitle}, Warmmiete: ${property.rentWarm}€, Zimmer: ${property.rooms}, Lage (PLZ): ${property.zipCode}.
    Interessent: Einkommen: ${tenant.householdIncome}€ (${tenant.incomeType}), Details: ${tenant.incomeDetails}, Suche: ${tenant.minRooms} Zimmer in ${tenant.desiredLocation}.
    
    Berechne einen Score von 0-100 basierend auf:
    1. Finanzielle Tragbarkeit (Miete vs Einkommen).
    2. Zimmeranzahl (Bedarf vs. Angebot).
    3. Qualitative Übereinstimmung der Suchkriterien.
    
    Gib das Ergebnis als JSON zurück.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            incomeSuitability: { type: Type.STRING }
          },
          required: ["score", "reasoning", "incomeSuitability"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return {
      tenant,
      score: data.score,
      reasoning: data.reasoning,
      incomeSuitability: data.incomeSuitability
    };
  } catch (error) {
    console.error("AI Match Error:", error);
    return {
      tenant,
      score: 50,
      reasoning: "Manuelle Prüfung erforderlich.",
      incomeSuitability: "Unbekannt"
    };
  }
};
