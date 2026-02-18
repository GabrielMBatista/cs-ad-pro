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

        // 1. Image Generation (using gemini-2.5-flash-image)
        if (task === 'image') {
            const imageModel = 'gemini-2.5-flash-image';

            // Ensure contents is formatted correctly as Content[]
            // The frontend sends 'prompt' as Part[] (array of parts)
            const parts = Array.isArray(prompt) ? prompt : [{ text: prompt }];

            const response = await ai.models.generateContent({
                model: imageModel,
                contents: [
                    {
                        role: 'user',
                        parts: parts
                    }
                ],
                config: {
                    imageConfig: { aspectRatio: "1:1" },
                    ...config
                }
            });

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
        if (error.response) {
            console.error('Gemini API Response Error Data:', JSON.stringify(error.response, null, 2));
        }
        return NextResponse.json(
            { error: error.message || 'Error processing request', details: error.toString() },
            { status: 500 }
        );
    }
}
