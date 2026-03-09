import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ai, GEMINI_MODEL } from '@/lib/gemini';

/**
 * GET /api/sync-tipsters?date=YYYY-MM-DD
 * Uses Gemini API with Google Search Grounding to find ACTUAL expert picks
 * published by known tipsters across the internet for the specific horses running today.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    try {
        // 1. Fetch tipster profiles from Supabase
        const { data: tipsters, error: tipErr } = await supabaseAdmin
            .from('tipsters')
            .select('*')
            .order('roi_percentage', { ascending: false });

        if (tipErr || !tipsters || tipsters.length === 0) {
            return NextResponse.json({ status: 'error', message: 'No tipsters found in database.' }, { status: 400 });
        }

        // 2. Fetch cached race data for the date
        const { data: cacheRow } = await supabaseAdmin
            .from('racing_cache')
            .select('data')
            .eq('endpoint', `racecards_${date}`)
            .single();

        const races: any[] = cacheRow?.data || [];
        if (races.length === 0) {
            return NextResponse.json({
                status: 'warning',
                message: 'No race data cached for this date. Call /api/racing first.',
                date
            });
        }

        // 3. Build condensed race/horse summary for Gemini
        const runnersToSearch: string[] = [];
        const horseRaceMap = new Map<string, { race_name: string; race_time: string }>();

        for (const race of races) {
            for (const horse of (race.horses || [])) {
                if (horse.name && horse.name !== 'Unknown') {
                    const normalized = horse.name.trim().toLowerCase();
                    runnersToSearch.push(horse.name);
                    horseRaceMap.set(normalized, {
                        race_name: race.name,
                        race_time: race.time
                    });
                }
            }
        }

        const tipsterNames = tipsters.map((t: any) => t.name).join(", ");

        // 4. Ask Gemini to use Google Search to find REAL tips
        const prompt = `
Search the live internet to find the 20 MOST TIPPED horses running today (${date}) in the UK and Ireland.
Look for contemporary, real horse racing expert picks and tips from ANY reputable horse racing expert, publication, or ex-jockey (e.g., Sporting Life, Timeform, Oddschecker, Hugh Taylor, Templegate, Racing Post, etc.).

CRITICAL INSTRUCTIONS:
1. USE GOOGLE SEARCH to find actual articles, tweets, or racing tipster columns posted recently (within the last 48 hours).
2. Find the horses that are receiving the MOST tips from different experts.
3. For each tip, explicitly state the Tipster/Publication name and the Horse name.
4. If they flag it as their "NAP" (best bet) or "NB" (next best), accurately record that in 'tip_type', otherwise use 'VALUE' or 'EACH_WAY'.
5. Ensure 'reasoning' is briefly paraphrased in YOUR OWN WORDS. DO NOT USE DIRECT QUOTES as it will trigger copyright/recitation filters.

Return ONLY valid JSON with this exact structure, no markdown formatting blocks, no other text:
{
  "picks": [
    {
      "tipster_name": "Name of the Tipster or Publication",
      "horse_name": "State Man",
      "tip_type": "NAP",
      "confidence": "HIGH",
      "reasoning": "Paraphrased summary of why they chose this horse."
    }
  ]
}`;

        let geminiPicks: any[] = [];
        let rawText = "";
        try {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                    temperature: 0.1 // Low temp for factual extraction
                }
            });

            if (response.text) {
                const text = response.text.trim();
                rawText = text;
                console.log("[DEBUG] Raw Gemini response text:", text);
                try {
                    const parsed = JSON.parse(text);
                    geminiPicks = Array.isArray(parsed.picks) ? parsed.picks : [];
                } catch (e) {
                    // Clean up markdown block if present
                    let cleaned = text.trim();
                    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
                    else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
                    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);

                    try {
                        const parsed = JSON.parse(cleaned.trim());
                        geminiPicks = Array.isArray(parsed.picks) ? parsed.picks : [];
                    } catch (e2) {
                        console.error('[sync-tipsters] Failed to parse JSON even after cleaning:', cleaned);
                    }
                }
            } else {
                console.log("[DEBUG] Empty text. Full response:", JSON.stringify(response, null, 2));
                rawText = JSON.stringify(response);
            }
        } catch (err: any) {
            console.error('[sync-tipsters] Gemini API error:', err.message);
            return NextResponse.json({ status: 'error', message: 'Gemini request failed: ' + err.message }, { status: 500 });
        }

        if (geminiPicks.length === 0) {
            return NextResponse.json({ status: 'warning', message: 'Gemini found no real picks matching our tipsters to todays runners.', rawText }, { status: 200 });
        }

        // 5. Match back to our DB schema and insert new tipsters if found
        const tipsterMap = new Map<string, any>(
            tipsters.map((t: any) => [t.name.toLowerCase().trim(), t])
        );

        const VALID_TIP_TYPES = new Set(['NAP', 'NB', 'EACH_WAY', 'VALUE', 'LONGSHOT']);
        const VALID_CONFIDENCE = new Set(['HIGH', 'MEDIUM', 'LOW']);

        const newTipstersToInsert: any[] = [];

        // First pass: identify missing tipsters
        for (const pick of geminiPicks) {
            const searchTipster = (pick.tipster_name || '').trim();
            if (!searchTipster) continue;

            const searchTipsterLower = searchTipster.toLowerCase();
            let tipster = tipsterMap.get(searchTipsterLower);

            if (!tipster) {
                const partialMatch = Array.from(tipsterMap.entries()).find(([name]) =>
                    searchTipsterLower.includes(name) || name.includes(searchTipsterLower)
                );
                if (partialMatch) {
                    tipster = partialMatch[1];
                }
            }

            if (!tipster) {
                let existingStaged = newTipstersToInsert.find(t => t.name.toLowerCase() === searchTipsterLower);
                if (!existingStaged) {
                    existingStaged = {
                        name: searchTipster,
                        platform: "Web",
                        win_rate: 20.0,
                        roi_percentage: 0.0,
                        followers_count: 0
                    };
                    newTipstersToInsert.push(existingStaged);
                }
            }
        }

        // Insert new tipsters into the DB if any
        if (newTipstersToInsert.length > 0) {
            console.log('[sync-tipsters] Dynamically inserting new tipsters:', newTipstersToInsert.map(t => t.name));
            const { data: insertedTipsters, error: newTipErr } = await supabaseAdmin
                .from('tipsters')
                .insert(newTipstersToInsert)
                .select();

            if (newTipErr || !insertedTipsters) {
                console.error('[sync-tipsters] Failed to auto-create tipsters:', newTipErr?.message);
            } else {
                insertedTipsters.forEach(t => {
                    tipsterMap.set(t.name.toLowerCase().trim(), t);
                });
            }
        }

        const mappingDebug: string[] = [];
        const picksToInsert = geminiPicks
            .map((pick: any) => {
                const searchTipster = (pick.tipster_name || '').toLowerCase().trim();
                let tipster = tipsterMap.get(searchTipster);
                if (!tipster) {
                    const partialMatch = Array.from(tipsterMap.entries()).find(([name]) =>
                        searchTipster.includes(name) || name.includes(searchTipster)
                    );
                    if (partialMatch) tipster = partialMatch[1];
                }

                if (!tipster) {
                    mappingDebug.push(`Failed tipster match: ${pick.tipster_name}`);
                    return null;
                }

                const searchHorse = (pick.horse_name || '').toLowerCase().trim();
                let raceInfo = horseRaceMap.get(searchHorse);

                // Fuzzy Match for Horse Names
                if (!raceInfo) {
                    const allKnownHorseNames = Array.from(horseRaceMap.keys());

                    // Simple included-string match
                    const partialMatch = allKnownHorseNames.find(name =>
                        searchHorse.includes(name) || name.includes(searchHorse)
                    );

                    if (partialMatch) {
                        raceInfo = horseRaceMap.get(partialMatch);
                    } else {
                        mappingDebug.push(`Failed horse match: ${pick.horse_name} (Search: ${searchHorse})`);
                        return null;
                    }
                }

                const tipType = VALID_TIP_TYPES.has(pick.tip_type) ? pick.tip_type : 'VALUE';
                const confidence = VALID_CONFIDENCE.has(pick.confidence) ? pick.confidence : 'MEDIUM';

                return {
                    tipster_id: tipster.id,
                    race_date: date,
                    race_time: raceInfo?.race_time || '',
                    race_name: raceInfo?.race_name || '',
                    horse_name: pick.horse_name,
                    confidence,
                    tip_type: tipType,
                    reasoning: pick.reasoning || "Picked based on current market trends and form.",
                    odds_at_time: null
                };
            })
            .filter(Boolean);

        if (picksToInsert.length === 0) {
            return NextResponse.json({
                status: 'error',
                message: 'Found picks, but failed to map them to known tipster IDs and horse names.',
                geminiPicks,
                mappingDebug
            }, { status: 400 });
        }

        // 6. Delete old picks for this date and insert newly scraped ones
        await supabaseAdmin.from('expert_picks').delete().eq('race_date', date);

        const { error: insertErr } = await supabaseAdmin
            .from('expert_picks')
            .insert(picksToInsert);

        if (insertErr) {
            console.error('[sync-tipsters] DB insert error:', insertErr.message);
            return NextResponse.json({ status: 'error', message: 'Failed to save picks to database.', dbError: insertErr.message }, { status: 500 });
        }

        const tipstersCovered = new Set(picksToInsert.map((p: any) => p.tipster_id)).size;

        return NextResponse.json({
            status: 'success',
            message: `Gemini-Search successfully scraped and synced expert picks for ${date}`,
            date,
            picksGenerated: picksToInsert.length,
            tipstersCovered,
            preview: picksToInsert.slice(0, 5).map((p: any) => ({
                tipster: tipsters.find((t: any) => t.id === p.tipster_id)?.name,
                horse: p.horse_name,
                type: p.tip_type,
                reasoning: p.reasoning
            }))
        });

    } catch (err: any) {
        console.error('[sync-tipsters] Unexpected error:', err.message);
        return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
    }
}
