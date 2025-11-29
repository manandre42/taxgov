import { GoogleGenAI, Type } from "@google/genai";
import { RouteAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeRoute = async (origin: string, destination: string): Promise<RouteAnalysis> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      Atue como um sistema de tráfego e logística inteligente.
      Analise uma rota de táxi de "${origin}" para "${destination}".
      
      Estime a distância, o tempo de viagem (considerando trânsito urbano médio),
      e classifique se é uma rota curta (tiro curto) ou longa.
      
      Classificação:
      - Urbana: dentro da mesma cidade, curta distância (<15km).
      - Intermunicipal: entre cidades vizinhas.
      - Longo Curso: distâncias grandes (>50km).
      
      Forneça uma avaliação curta de risco ou obs (ex: área de trânsito intenso, rota turística).
      Forneça um resumo textual do caminho principal (ex: Via Av. Paulista e Rebouças).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distanceKm: { type: Type.NUMBER, description: "Distância estimada em Kilometros" },
            durationMinutes: { type: Type.NUMBER, description: "Duração estimada em minutos" },
            isShortHaul: { type: Type.BOOLEAN, description: "True se for uma corrida curta (tiro curto)" },
            classification: { type: Type.STRING, enum: ["Urbana", "Intermunicipal", "Longo Curso"] },
            riskAssessment: { type: Type.STRING, description: "Avaliação sucinta da rota" },
            suggestedPath: { type: Type.STRING, description: "Resumo das principais vias" }
          },
          required: ["distanceKm", "durationMinutes", "isShortHaul", "classification", "riskAssessment", "suggestedPath"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data as RouteAnalysis;
    }
    
    throw new Error("Não foi possível analisar a rota.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback data in case of error to prevent app crash
    return {
      distanceKm: 0,
      durationMinutes: 0,
      isShortHaul: true,
      classification: "Urbana",
      riskAssessment: "Erro ao conectar com servidor de IA.",
      suggestedPath: "Rota desconhecida"
    };
  }
};