import { NextRequest, NextResponse } from 'next/server';
import { ai, GEMINI_MODEL } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const FESTIVAL_DAYS = ['2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13'];

const EXTRACTION_PROMPT = `You are a highly precise sports data extraction API. Your only job is to read text containing horse racing tips for the Cheltenham Festival and convert them into a strict, perfectly formatted JSON array.

Extract the following for every single tip found:
1. "race_date": YYYY-MM-DD format. Assume year is 2026 if not stated.
2. "race_time": HH:MM 24-hour format. null if missing.
3. "race_name": Official race name e.g. "Supreme Novices' Hurdle". null if missing.
4. "horse_name": Exact horse name.
5. "tipster_name": Person or publication name e.g. "Ruby Walsh", "Racing Post", "Templegate".
6. "tip_type": Strictly "Win", "Each Way", or "NAP". Use "NAP" for a tipster's best bet. Default to "Win".

CRITICAL:
- Output ONLY a valid JSON array. No markdown, no explanations, nothing else.
- Missing values use null — the key must still exist.
- Deduplicate: one row per horse + tipster combination.`;

/**
 * Three complementary search queries that maximise coverage from different angles:
 * - Query A: broad day overview from major publications
 * - Query B: named TV/media pundits and their specific NAPs
 * - Query C: race-by-race breakdown and each-way plays
 */
function buildSearchQueries(date: string): string[] {
    return [
        `Search the web now for horse racing tips for the Cheltenham Festival on ${date} 2026.
         Find tips from Racing Post (Tom Segal, Templegate column), Sporting Life, Oddschecker,
         At The Races, Sky Sports Racing, and the Racing TV tipsters.
         List every single horse tipped, the race it runs in, the race time, and whether it is
         a NAP (best bet), Each Way, or Win recommendation.`,

        `Search the web now for Cheltenham Festival ${date} 2026 tips from expert TV pundits
         and former jockeys including: Ruby Walsh, Tony McCoy, Mick Fitzgerald, Barry Geraghty,
         Rachael Blackmore, Paul Nicholls, Willie Mullins, Henry De Bromhead, Nick Luck,
         Luke Harvey, and ITV Racing presenters.
         For each pundit list their NAP of the day and any other horses they fancy, including
         race name, race time, and tip type.`,

        `Search the web now for Cheltenham ${date} 2026 each-way tips, value bets, and
         longshots from betting publications. Include tips from the Mirror (Newsboy),
         the Sun (Templegate), the Daily Mail, the Guardian, the Telegraph,
         Betfair Hub, Paddy Power blog, William Hill blog, and any major betting Twitter/X accounts.
         List every horse name, tipster name, race, time, and tip type.`
    ];
}

/** Run a single Google Search Grounding request and return the raw text */
async function runSearchQuery(query: string): Promise<string> {
    try {
        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: query,
            config: { tools: [{ googleSearch: {} }] }
        });
        return resp.text || '';
    } catch (err: any) {
        console.warn('[Tips Collect] Search query failed:', err?.message?.slice(0, 100));
        return '';
    }
}

/** Extract structured tips from combined raw text */
async function extractTips(rawText: string, targetDate: string): Promise<any[]> {
    if (!rawText.trim()) return [];

    const prompt = `${EXTRACTION_PROMPT}

The primary race date to use when not explicitly stated is ${targetDate}.

Process the following text and extract ALL tips now:

${rawText.slice(0, 28000)}`; // stay within token limits

    try {
        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        if (!resp.text) return [];
        return JSON.parse(resp.text);
    } catch (err: any) {
        console.error('[Tips Collect] Extraction parse error:', err?.message?.slice(0, 100));
        return [];
    }
}

/** Sanitise and upsert an array of raw tip objects into cheltenham_tips */
async function upsertTips(tips: any[], fallbackDate: string): Promise<number> {
    const VALID_TYPES = new Set(['Win', 'Each Way', 'NAP']);

    const sanitized = tips
        .filter(t => t?.horse_name && t?.tipster_name)
        .map(t => ({
            race_date: t.race_date || fallbackDate,
            race_time: t.race_time || null,
            race_name: t.race_name || null,
            horse_name: String(t.horse_name).trim(),
            tipster_name: String(t.tipster_name).trim(),
            tip_type: VALID_TYPES.has(t.tip_type) ? t.tip_type : 'Win'
        }));

    if (sanitized.length === 0) return 0;

    const { error } = await supabase
        .from('cheltenham_tips')
        .upsert(sanitized, { onConflict: 'race_date,horse_name,tipster_name', ignoreDuplicates: true });

    if (error) {
        console.error('[Tips Collect] Supabase upsert error:', error.message);
        return 0;
    }

    return sanitized.length;
}

/** Collect tips for a single date using 3 parallel searches */
async function collectForDate(date: string): Promise<{ date: string; inserted: number }> {
    const queries = buildSearchQueries(date);

    // Run all 3 searches in parallel for speed
    const [textA, textB, textC] = await Promise.all(queries.map(runSearchQuery));

    // Combine all raw search text into one extraction pass
    const combined = [textA, textB, textC].filter(Boolean).join('\n\n---\n\n');
    if (!combined.trim()) return { date, inserted: 0 };

    const tips = await extractTips(combined, date);
    if (!Array.isArray(tips) || tips.length === 0) return { date, inserted: 0 };

    const inserted = await upsertTips(tips, date);
    console.log(`[Tips Collect] ${date}: ${inserted} tips stored`);
    return { date, inserted };
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    if (!ai) {
        return NextResponse.json({ error: 'Gemini not configured' }, { status: 500 });
    }

    let date: string | null = null;
    let allDays = false;

    try {
        const body = await req.json();
        date = body.date || null;
        allDays = body.allDays === true;
    } catch {
        // no body — defaults above apply
    }

    try {
        if (allDays) {
            // Collect for all 4 festival days (run sequentially to avoid rate limits)
            const results: { date: string; inserted: number }[] = [];
            for (const d of FESTIVAL_DAYS) {
                results.push(await collectForDate(d));
            }
            const total = results.reduce((s, r) => s + r.inserted, 0);
            return NextResponse.json({ total, results });
        }

        // Single day
        const targetDate = date || new Date().toISOString().split('T')[0];
        const result = await collectForDate(targetDate);
        return NextResponse.json({ inserted: result.inserted, date: result.date });

    } catch (error: any) {
        console.error('[Tips Collect] Unhandled error:', error?.message);
        return NextResponse.json({ error: 'Tip collection failed' }, { status: 500 });
    }
}
