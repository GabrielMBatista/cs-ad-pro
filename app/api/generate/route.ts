import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client server-side with the secure key
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
    try {
        const { prompt, model = 'gemini-flash-latest', config, task } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
        }

        // 1. Image Generation (using gemini-2.5-flash)
        if (task === 'image') {
            // Use the specific model for images if requested, or default
            const imageModel = 'gemini-2.5-flash';

            const response = await ai.models.generateContent({
                model: imageModel,
                contents: prompt,
                config: {
                    responseModalities: ['IMAGE'],
                    ...config
                }
            });

            // Extract image data from response
            // Note: The structure depends on the specific model response
            // For simplicity, we return the full response and let the client parse specific parts if needed, 
            // but ideally we should normalize here.
            // However, 2.5-flash returns inline data URIs or similar.
            // Let's return the raw candidates for the client to handle for now to match current logic.
            return NextResponse.json(response);
        }

        // 2. Text Generation/Prompt Enhancement
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: config
        });

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Error processing request' },
            { status: 500 }
        );
    }
}
