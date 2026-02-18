
import { GoogleGenAI } from "@google/genai";
import { CSGOSkin, AspectRatio, ImageSize } from "../types";

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export async function checkAndRequestKey() {
  if (typeof window.aistudio !== 'undefined' && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }
}

async function handleApiError(error: any): Promise<never> {
  if (error?.message?.includes('Requested entity was not found.') && typeof window.aistudio !== 'undefined' && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  }
  throw error;
}

/**
 * Uses Gemini Flash (Stable Alias) to optimize the SCENARIO prompt.
 * Acts as a High-End Marketing Director.
 */
export async function enhancePrompt(simplePrompt: string, gameContext: string, colorStyle: string, useThinking: boolean): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY });

  const config: any = {};
  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 24576 };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: `Você é um Diretor de Arte de Publicidade de Luxo para Instagram. 
      Otimize este prompt para uma CAMPANHA PUBLICITÁRIA ÉPICA: "${simplePrompt}".
      
      CRÍTICO: O objeto central (arma ou rosto) é SAGRADO e INALTERÁVEL. 
      Seu trabalho é criar o CENÁRIO MAIS IMPACTANTE POSSÍVEL ao redor dele.
      
      Instruções:
      1. Use terminologia de fotografia profissional (f/1.8, bokeh, iluminação Rembrandt, color grading cinematográfico).
      2. Descreva texturas do ambiente (nevoeiro, faíscas, superfícies reflexivas).
      3. Foque na composição para Instagram (centro de interesse, profundidade).
      4. Contexto: ${gameContext}, Estilo: ${colorStyle}.
      
      Retorne APENAS o texto final do prompt em inglês para melhor performance da IA de imagem.`,
      config
    });
    return response.text || simplePrompt;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Generates images with Gemini 2.5 Flash Image.
 * HARSH MULTIMODAL PIXEL-LOCK: Strictly enforces foreground preservation using multimodal input.
 */
export async function generateImage(
  scenarioPrompt: string,
  gameContext: string,
  aspectRatio: AspectRatio,
  referenceImageBase64?: string,
  userNegativePrompt?: string
): Promise<string> {
  await checkAndRequestKey();
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY });


  const prompt = `ADVERTISEMENT COMPOSITING:
  SCENARIO: ${scenarioPrompt}.
  CONTEXT: ${gameContext}.
  
  STRICT PIXEL-LOCK RULES:
  - DO NOT redraw, change colors, or modify the textures of the object in the reference image.
  - The object from the reference image must remain exactly as it is.
  - ONLY generate the background and environmental effects around the object.
  
  NEGATIVE PROMPT: ${userNegativePrompt || 'distorted subject, modified reference, redrawn weapon, changed face, altered item, new colors on subject, blurry object, artistic reinterpretation'}.`;

  const parts: any[] = [];

  if (referenceImageBase64) {
    parts.push({
      inlineData: {
        data: referenceImageBase64.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: 'image/png'
      }
    });
  }
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        // @ts-ignore
        responseModalities: ['TEXT', 'IMAGE'],
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("gemini-2.5-flash-image não retornou imagem.");

  } catch (error: any) {
    throw new Error(`Falha na geração de imagem: ${error.message}`);
  }
}


/**
 * Edits images using Gemini 2.5 Flash Image.
 */
export async function editImage(base64Image: string, prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: prompt }
        ]
      },
      config: {
        // @ts-ignore
        responseModalities: ['TEXT', 'IMAGE'],
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Falha na edição: modelo não retornou imagem.");
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Analyzes images using Gemini Flash with thinking mode.
 */
export async function analyzeImage(base64Image: string, query: string, useThinking: boolean): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY });

  const config: any = {};
  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 24576 };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: query }
        ]
      },
      config
    });
    return response.text || "Sem análise.";
  } catch (error) {
    return handleApiError(error);
  }
}
