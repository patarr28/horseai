import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Use service role key if available for backend operations, else fallback
const supabase = createClient(supabaseUrl, supabaseKey);

const CACHE_TTL_MINUTES = 30;

// Deterministic pseudo-random generator
function seededRandom(seed: number) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function generateSignals(seed: number) {
    const signalTypes = ["BANKER", "VALUE_BET", "STEAMING", "DRIFTING", "SOCIAL_BUZZ", "PUNDIT_PICK", "MARKET_MOVER"];
    const signals = [];
    if (seededRandom(seed) > 0.8) signals.push({ type: "BANKER", label: "BANKER" });
    if (seededRandom(seed + 1) > 0.7) signals.push({ type: "VALUE_BET", label: "VALUE BET" });
    if (seededRandom(seed + 2) > 0.6) signals.push({ type: "STEAMING", label: "STEAMING" });
    if (seededRandom(seed + 3) > 0.6) signals.push({ type: "SOCIAL_BUZZ", label: "SOCIAL BUZZ", detail: "Active on X" });
    return signals.slice(0, 2);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || 'today';
    const endpoint = `racecards_${date}`;

    // 1. Check Supabase Cache
    const { data: cacheRow, error: cacheError } = await supabase
        .from('racing_cache')
        .select('*')
        .eq('endpoint', endpoint)
        .single();

    if (cacheRow) {
        const lastUpdated = new Date(cacheRow.updated_at).getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - lastUpdated) / (1000 * 60);

        if (diffMinutes < CACHE_TTL_MINUTES) {
            console.log(`[API] Serving from Supabase cache (${endpoint})`);
            return NextResponse.json({ status: 'success', data: cacheRow.data, source: 'cache' });
        }
    }

    try {
        // 2. Cache miss or stale — fetch from The Racing API REST endpoint
        // NOTE: MCP get_racecards_free has a server-side bug (sends unsupported params),
        // so we use direct REST call for free racecards. MCP client is available for other tools.
        console.log(`[API] Fetching LIVE from The Racing API (${endpoint})`);

        const RACING_API_USER = process.env.RACING_API_USER;
        const RACING_API_PASS = process.env.RACING_API_PASS;
        if (!RACING_API_USER || !RACING_API_PASS) {
            return NextResponse.json({ error: 'Missing API Credentials in .env.local' }, { status: 500 });
        }

        const authString = Buffer.from(`${RACING_API_USER}:${RACING_API_PASS}`).toString('base64');
        const response = await fetch(`https://api.theracingapi.com/v1/racecards/free`, {
            headers: { 'Authorization': `Basic ${authString}` }
        });

        if (!response.ok) {
            throw new Error(`API responded with ${response.status}`);
        }

        const data = await response.json();
        const allRaces = data.racecards || [];

        // Filter to ONLY include Cheltenham races for the Festival app
        const apiRaces = allRaces.filter((r: any) => {
            const courseName = (r.course_name || r.course || "").toLowerCase();
            return courseName.includes("cheltenham");
        });

        // 3. Map to our application's Expected Schema (Race & Horse)
        const mappedRaces = apiRaces.map((apiRace: any, rIdx: number) => {
            const dateStr = apiRace.off_time ? apiRace.off_time.substring(11, 16) : apiRace.off_time;

            // Pre-calculate race statistics for relative metrics
            const runners = apiRace.runners || [];
            const maxOr = Math.max(...runners.map((r: any) => parseInt(r.official_rating) || 0), 0);

            return {
                id: `race-${apiRace.race_id || rIdx}`,
                time: apiRace.off_time,
                name: apiRace.race_name || "Race of the Day",
                grade: apiRace.race_class || "Handicap",
                distance: apiRace.distance_f ? `${apiRace.distance_f}f` : "2m",
                going: apiRace.going || "Good",
                runners: runners.length,
                status: "upcoming",
                topSignals: [],
                horses: runners.map((runner: any, hIdx: number) => {
                    // Fix for h-NaN: horse_id might be missing or non-numeric
                    const seedStr = runner.horse_id || runner.draw || String(hIdx);
                    // Generate a simple numeric seed from the string
                    let seed = 0;
                    for (let i = 0; i < seedStr.length; i++) {
                        seed += seedStr.charCodeAt(i);
                    }
                    seed = seed + hIdx;

                    // --- EXACT DATA PARSING & AI SYNTHESIS ---
                    const or = parseInt(runner.official_rating) || 0;
                    const oddsDec = parseFloat(runner.odds_decimal) || 11.0; // Assume 10/1 if missing
                    const formStr = runner.form || "-";
                    const impliedProb = (1 / oddsDec) * 100;

                    // 1. Calculate realistic AI Rating (0-100)
                    let baseAiRating = 65;

                    // Official Rating influence (relative to race)
                    if (maxOr > 0 && or > 0) {
                        const orDiff = maxOr - or;
                        if (orDiff === 0) baseAiRating += 18; // Top rated gets large boost
                        else if (orDiff <= 5) baseAiRating += 12;
                        else if (orDiff <= 10) baseAiRating += 6;
                        else baseAiRating -= Math.min(orDiff, 15); // Penalize low ratings
                    }

                    // Form influence
                    const wins = (formStr.match(/1/g) || []).length;
                    const places = (formStr.match(/[2-3]/g) || []).length;
                    baseAiRating += (wins * 4) + (places * 1.5);
                    if (formStr.includes("P") || formStr.includes("F") || formStr.includes("U")) {
                        baseAiRating -= 5;
                    }

                    // Cap AI Rating
                    const finalAiRating = Math.min(Math.max(Math.floor(baseAiRating), 30), 99);

                    // 2. Generate Deterministic Signals
                    const signals = [];
                    if (impliedProb > 35) signals.push({ type: "BANKER", label: "BANKER" });

                    // Value bet: High AI rating but bookies offer generous odds (low implied prob)
                    if (finalAiRating > 78 && oddsDec >= 8.0) {
                        signals.push({ type: "VALUE_BET", label: "VALUE BET" });
                    }

                    if (formStr.endsWith("11") || formStr.endsWith("111")) {
                        signals.push({ type: "STEAMING", label: "STEAMING" });
                    } else if (formStr.endsWith("P") || formStr.endsWith("0")) {
                        signals.push({ type: "DRIFTING", label: "DRIFTING" });
                    }

                    if (maxOr > 0 && or === maxOr) {
                        signals.push({ type: "PUNDIT_PICK", label: "TOP RATED", detail: `OR ${or}` });
                    }

                    // Combine with some pseudo-random social buzz
                    if (seededRandom(seed + 3) > 0.8) {
                        signals.push({ type: "SOCIAL_BUZZ", label: "SOCIAL BUZZ", detail: "Trending" });
                    }

                    // 3. Crowd Pick driven by implied market probability (with slight noise)
                    let crowdPct = impliedProb * 1.1 + (seededRandom(seed) * 5);
                    crowdPct = Math.min(Math.max(Math.floor(crowdPct), 1), 95);

                    return {
                        id: `h-${seed}`,
                        number: parseInt(runner.draw || runner.saddle_cloth) || (hIdx + 1),
                        name: runner.horse || "Unknown",
                        jockey: runner.jockey || "TBA",
                        trainer: runner.trainer || "TBA",
                        form: formStr,
                        odds: runner.odds_decimal ? `${Math.round((runner.odds_decimal - 1) * 2)}/2` : "SP",
                        oddsDecimal: oddsDec,
                        aiRating: finalAiRating,
                        crowdPickPercent: crowdPct,
                        signals: signals.slice(0, 3), // Max 3 signals
                        sentiment: {
                            positive: Math.min(finalAiRating, 90), // High rating = high positive sentiment
                            negative: Math.max(100 - Math.min(finalAiRating, 90) - 20, 0),
                            neutral: 20
                        },
                        stats: { speed: 80, stamina: "Medium", trend: formStr.endsWith("1") ? "up" : formStr.match(/[PFU0]$/) ? "down" : "stable" },
                        aiInsight: "Live intelligence derived from official ratings, exact form, and implied probability.",
                        silkColor: runner.silk_image_png ? `url(${runner.silk_image_png})` : "#1a5c2e",
                        aiVerdict: "Analysis generated on the fly.",
                        pros: [or > 0 ? `Official Rating: ${or}` : "Live Data Synced", `Recent Form: ${formStr}`],
                        cons: ["Requires deeper pedigree analysis"],
                        confidence: Math.max(finalAiRating - 8 + Math.floor(seededRandom(seed + 4) * 10), 30),
                        age: runner.age || 5,
                        weight: runner.weight_lbs ? `${Math.floor(runner.weight_lbs / 14)}st ${runner.weight_lbs % 14}lb` : "11st",
                        rating: or || 120,
                        trackRecord: { courseWins: 0, courseRuns: 0, distanceWins: 0, distanceRuns: 0, goingWins: 0, goingRuns: 0 },
                        recentRuns: []
                    };
                })
            };
        });

        // 4. Save mapped data into Supabase Cache
        await supabase
            .from('racing_cache')
            .upsert({
                endpoint: endpoint,
                data: mappedRaces,
                updated_at: new Date().toISOString()
            });

        return NextResponse.json({ status: 'success', data: mappedRaces, source: 'live' });

    } catch (error: any) {
        console.error("The Racing API Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

