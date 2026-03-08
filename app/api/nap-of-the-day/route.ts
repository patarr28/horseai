import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ai } from '@/lib/gemini';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
            const origin = request.headers.get("origin") || request.headers.get("host") ? `http://${request.headers.get("host")}` : 'http://localhost:3000';
            const racingRes = await fetch(`${origin}/api/racing?date=${date}`);
            if (racingRes.ok) {
                const racingData = await racingRes.json();
                races = racingData.data || [];
            }

            if (races.length === 0) {
                return NextResponse.json({ error: 'No racing data available to analyze' }, { status: 404 });
            }
        } else {
            races = cacheRow.data;
        }

        // 2. Extract top horses to send to Gemini (to save token space)
        let topContenders: any[] = [];
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
        You are the "Festival Whisperer", an expert AI horse racing analyst.
        Review this list of the day's top-rated contenders based on official ratings and form:
        ${JSON.stringify(topContenders)}

        Select exactly ONE horse as the "Nap of the Day" (Best Bet). 
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
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        if (response.text) {
            const napData = JSON.parse(response.text);
            return NextResponse.json(napData);
        }

        throw new Error("Empty response from Gemini");

    } catch (error: any) {
        console.error("NAP of the Day Error:", error);
        return NextResponse.json({ error: 'Failed to generate best bet' }, { status: 500 });
    }
}
