
import { AspectRatio } from "../types";

// Helper to call our internal API
async function callInternalApi(payload: any) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Uses Gemini Flash (Stable Alias) to optimize the SCENARIO prompt.
 * Acts as a High-End Marketing Director.
 */
export async function enhancePrompt(simplePrompt: string, gameContext: string, colorStyle: string, useThinking: boolean): Promise<string> {
  const prompt = `Você é um Diretor de Arte de Publicidade de Luxo para Instagram. 
      Otimize este prompt para uma CAMPANHA PUBLICITÁRIA ÉPICA: "${simplePrompt}".
      
      CRÍTICO: O objeto central (arma ou rosto) é SAGRADO e INALTERÁVEL. 
      Seu trabalho é criar o CENÁRIO MAIS IMPACTANTE POSSÍVEL ao redor dele.
      
      Instruções:
      1. Use terminologia de fotografia profissional (f/1.8, bokeh, iluminação Rembrandt, color grading cinematográfico).
      2. Descreva texturas do ambiente (nevoeiro, faíscas, superfícies reflexivas).
      3. Foque na composição para Instagram (centro de interesse, profundidade).
      4. Contexto: ${gameContext}, Estilo: ${colorStyle}.
      
      Retorne APENAS o texto final do prompt em inglês para melhor performance da IA de imagem.`;

  try {
    const config: any = {};
    if (useThinking) {
      config.thinkingConfig = { thinkingBudget: 24576 };
    }

    const data = await callInternalApi({
      prompt,
      model: 'gemini-flash-latest',
      config
    });

    return data.candidates?.[0]?.content?.parts?.[0]?.text || simplePrompt;
  } catch (error) {
    console.error("Enhance Prompt Error:", error);
    return simplePrompt;
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
    // Send complex parts structure to our API, handled by custom logic in route.ts if needed, 
    // or we can just send the prompt text if the backend handles the reference image logic.
    // However, our backend generic route expects 'prompt' as string or parts. 
    // Let's adjust route.ts to handle 'contents' or simple 'prompt'.
    // Actually, let's keep it simple: we pass the full 'contents' payload structure expected by Gemini
    // but wrapped in our API payload.

    // Simplification for this specific function:
    // We'll update the route.ts to handle 'parts' construction if we pass reference image separate, 
    // OR we pass the constructed parts from here.

    // Let's pass the configured parts directly to the model via our API
    // We need to slightly adjust api/generate/route.ts to accept 'contents' directly for maximum flexibility
    // OR just use the 'prompt' field as the contents array.

    // For now, let's assume route.ts takes 'prompt' as the main content input.
    // If 'prompt' is an array, GoogleGenAI might handle it, or we need to fix route.ts.
    // Let's fix route.ts to be more robust first? 
    // No, let's strictly follow the contract we built: api/generate accepts { prompt, model, config, task }

    // We'll pass the parts array as 'prompt' and handle it in route.ts
    // (We need to update route.ts to handle array prompts if it doesn't already, 
    // but GoogleGenAI.generateContent accepts string or Part[])

    const data = await callInternalApi({
      prompt: parts, // Passing parts array as prompt
      task: 'image',
      config: {
        responseModalities: ['IMAGE']
      }
    });

    // Parse response
    for (const part of data.candidates?.[0]?.content?.parts || []) {
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
  try {
    const parts = [
      { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
      { text: prompt }
    ];

    const data = await callInternalApi({
      prompt: parts,
      task: 'image',
      config: {
        responseModalities: ['IMAGE'] // Force image return
      }
    });

    for (const part of data.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Falha na edição: modelo não retornou imagem.");
  } catch (error) {
    console.error("Edit Image Error:", error);
    throw error;
  }
}

/**
 * Analyzes images using Gemini Flash with thinking mode.
 */
export async function analyzeImage(base64Image: string, query: string, useThinking: boolean): Promise<string> {
  try {
    const config: any = {};
    if (useThinking) {
      config.thinkingConfig = { thinkingBudget: 24576 };
    }

    const parts = [
      { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
      { text: query }
    ];

    const data = await callInternalApi({
      prompt: parts,
      model: 'gemini-2.5-flash',
      config
    });

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem análise.";
  } catch (error) {
    console.error("Analyze Image Error:", error);
    return "Erro na análise.";
  }
}
