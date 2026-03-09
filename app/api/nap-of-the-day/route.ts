import { NextResponse } from 'next/server';
import { ai, GEMINI_MODEL } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || 'today';
        const endpoint = `racecards_${date}`;

        // 1. Get cached races from today
        const { data: cacheRow } = await supabase
            .from('racing_cache')
            .select('data')
            .eq('endpoint', endpoint)
            .single();

        let races = [];

        if (!cacheRow || !cacheRow.data) {
            console.log("[NAP API] Cache miss, triggering /api/racing fetch");
            // Use hardcoded base URL — never derive from user-supplied headers (SSRF risk)
            const napAbort = new AbortController();
            const napTimeout = setTimeout(() => napAbort.abort(), 20000);
            try {
                const racingRes = await fetch(`${APP_BASE_URL}/api/racing?date=${date}`, { signal: napAbort.signal });
                if (racingRes.ok) {
                    const racingData = await racingRes.json();
                    races = racingData.data || [];
                }
            } finally {
                clearTimeout(napTimeout);
            }

            if (races.length === 0) {
                return NextResponse.json({ error: 'No racing data available to analyze' }, { status: 404 });
            }
        } else {
            races = cacheRow.data;
        }

        // 2. Extract top horses to send to Gemini (to save token space)
        const topContenders: any[] = [];
        races.forEach((race: any) => {
            if (race.horses) {
                // Get top 2 horses by AI rating in each race
                const sorted = [...race.horses].sort((a, b) => b.aiRating - a.aiRating).slice(0, 2);
                sorted.forEach(h => {
                    topContenders.push({
                        raceTime: race.time,
                        raceName: race.name,
                        horse: h.name,
                        odds: h.odds,
                        oddsDecimal: h.oddsDecimal,
                        aiRating: h.aiRating,
                        form: h.form,
                        rating: h.rating
                    });
                });
            }
        });

        // 3. Prompt Gemini
        const prompt = `
        You are "HorseRacingAi", an expert data-driven racing assistant.
        Review this list of the day's top-rated contenders based on official ratings and form:
        ${JSON.stringify(topContenders)}

        Select exactly ONE horse as the "Algorithmic Standout" (Top Rated Data Match).
        Look for a horse with a very high AI rating (Official Rating edge) but decent odds (above 2.0 decimal, ideally 3.0+ for value).

        Return a JSON object with this exact structure, nothing else:
        {
           "horseName": "Name of horse",
           "raceTime": "Time of race",
           "odds": "Fractional odds",
           "reasoning": "A 2-3 sentence punchy, authoritative explanation of why this is the best bet of the day based on its edge and form."
        }
        `;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        if (response.text) {
            try {
                const napData = JSON.parse(response.text);
                return NextResponse.json(napData);
            } catch {
                console.error("NAP of the Day: failed to parse Gemini JSON:", response.text);
                return NextResponse.json({ error: 'Failed to parse best bet response' }, { status: 500 });
            }
        }

        throw new Error("Empty response from Gemini");

    } catch (error: any) {
        console.error("NAP of the Day Error:", error);
        return NextResponse.json({ error: 'Failed to generate best bet' }, { status: 500 });
    }
}
