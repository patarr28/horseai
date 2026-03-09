import { NextResponse } from 'next/server';
import { ai, GEMINI_MODEL } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const race = await req.json();

        if (!race || !race.horses) {
            return NextResponse.json({ error: 'Valid race data is required' }, { status: 400 });
        }

        // Condense horses for token limit
        const condensedHorses = race.horses.map((h: any) => ({
            name: h.name,
            odds: h.odds,
            oddsDecimal: h.oddsDecimal,
            rating: h.rating,
            form: h.form,
            signals: h.signals.map((s: any) => s.type).join(',')
        }));

        const prompt = `
        You are the "Festival Whisperer", an expert AI racing analyst.
        Review this upcoming race:
        Name: ${race.name}
        Distance: ${race.distance}
        Runners: ${race.runners}
        
        Field:
        ${JSON.stringify(condensedHorses)}

        Provide a 2-3 sentence engaging "Race Preview" that captures the dynamic of the race.
        Mention what to expect (e.g., "A wide open handicap", "A match race between the two favorites"), point out the top-rated contender, and highlight where the value might lie.
        Keep the prose punchy, sharp, and confident (like an experienced pundit). Do not use markdown headers, just return a single paragraph string.
        `;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
        });

        if (response.text) {
            return NextResponse.json({ preview: response.text });
        }

        throw new Error("Empty response from Gemini");

    } catch (error: any) {
        console.error("Race Preview API Error:", error);
        return NextResponse.json({ error: 'Failed to generate race preview' }, { status: 500 });
    }
}
