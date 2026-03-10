import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { ai, GEMINI_MODEL } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { getConsensusPicks } from '@/lib/tipsters';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || 'today';
        const dateForConsensus = date === 'today' ? new Date().toISOString().split('T')[0] : date;
        const endpoint = `racecards_${date}`;

        // 1. Get cached race data
        const { data: cacheRow } = await supabase
            .from('racing_cache')
            .select('data')
            .eq('endpoint', endpoint)
            .single();

        let races: any[] = [];

        if (!cacheRow?.data) {
            console.log('[NAP API] Cache miss, fetching /api/racing');
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
                return NextResponse.json({ error: 'No racing data available' }, { status: 404 });
            }
        } else {
            races = cacheRow.data;
        }

        // 2. Fetch live tipster consensus from cheltenham_tips (real expert votes)
        const consensus = await getConsensusPicks(dateForConsensus);

        // 3. Build contenders list — top 3 per race by AI rating, enriched with consensus
        const topContenders: any[] = [];
        races.forEach((race: any) => {
            if (!race.horses) return;
            const sorted = [...race.horses].sort((a: any, b: any) => b.aiRating - a.aiRating).slice(0, 3);
            sorted.forEach((h: any) => {
                const cRow = consensus.find(c =>
                    c.horse_name.toLowerCase().trim() === (h.name || '').toLowerCase().trim()
                );
                topContenders.push({
                    raceTime: race.time,
                    raceName: race.name,
                    horse: h.name,
                    odds: h.odds,
                    oddsDecimal: h.oddsDecimal,
                    aiRating: h.aiRating,
                    form: h.form,
                    rating: h.rating,
                    consensusVotes: cRow?.consensus_votes ?? 0,
                    isNap: cRow?.has_nap ?? false,
                    tipsters: (cRow?.tipsters ?? []).slice(0, 4),
                    tipTypes: cRow?.tip_types ?? []
                });
            });
        });

        // Pre-sort by composite score so Gemini gets the strongest candidates first
        topContenders.sort((a, b) => {
            const scoreA = a.aiRating + (a.consensusVotes * 8) + (a.isNap ? 15 : 0);
            const scoreB = b.aiRating + (b.consensusVotes * 8) + (b.isNap ? 15 : 0);
            return scoreB - scoreA;
        });

        // 4. Build the prompt with both data sources
        const consensusSummary = consensus.length > 0
            ? consensus.slice(0, 12).map(c =>
                `  • ${c.horse_name}: ${c.consensus_votes} tip${c.consensus_votes !== 1 ? 's' : ''}${c.has_nap ? ' [NAP]' : ''} — by ${c.tipsters.slice(0, 3).join(', ')}${c.tipsters.length > 3 ? ` +${c.tipsters.length - 3} more` : ''}`
            ).join('\n')
            : '  (No consensus data collected yet — rely on algorithmic ratings only)';

        const prompt = `You are "HorseRacingAi", an expert data-driven Cheltenham Festival racing assistant.

You have two independent data sources to cross-reference:

SOURCE 1 — ALGORITHMIC RATINGS (Official Ratings + Form Analysis):
${JSON.stringify(topContenders.slice(0, 15), null, 2)}

SOURCE 2 — LIVE TIPSTER CONSENSUS (Real tips scraped from Racing Post, Sporting Life, named pundits etc.):
${consensusSummary}

SELECTION RULES:
1. The ideal NAP has BOTH a high AI rating AND multiple consensus votes — cross-referencing both sources gives the highest confidence.
2. Weight consensus votes heavily: 3+ votes is strong, 5+ is very strong, a NAP call from any tipster is a very strong signal.
3. A horse with 5+ consensus votes beats a higher-rated horse with 0 votes.
4. Prefer odds above 2.0 decimal (ideally 3.0+) for genuine value.
5. If consensus is empty, fall back to AI rating + form.

Return a JSON object with this exact structure — no markdown, no extra text:
{
  "horseName": "Exact horse name",
  "raceTime": "HH:MM",
  "odds": "Fractional odds string",
  "consensusVotes": <integer>,
  "reasoning": "2-3 punchy sentences citing BOTH AI rating edge AND tipster consensus votes where available. Be specific about the number of experts backing this horse."
}`;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        if (response.text) {
            try {
                return NextResponse.json(JSON.parse(response.text));
            } catch {
                console.error('[NAP API] JSON parse failed:', response.text?.slice(0, 200));
                return NextResponse.json({ error: 'Failed to parse best bet response' }, { status: 500 });
            }
        }

        throw new Error('Empty response from Gemini');

    } catch (error: any) {
        console.error('[NAP API] Error:', error?.message);
        return NextResponse.json({ error: 'Failed to generate best bet' }, { status: 500 });
    }
}
