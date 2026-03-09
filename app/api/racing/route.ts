import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getExpertPicksByHorse } from '@/lib/tipsters';
import { supabase } from '@/lib/supabase';

// The CACHE_TTL_MINUTES remains outside
const CACHE_TTL_MINUTES = 30;

const BOOKMAKER_LINKS: Record<string, string> = {
    "Bet365": "https://www.bet365.com",
    "William Hill": "https://sports.williamhill.com",
    "Coral": "https://sports.coral.co.uk",
    "Betfred": "https://www.betfred.com",
    "Boyle Sports": "https://www.boylesports.com",
    "Ladbrokes": "https://sports.ladbrokes.com",
    "Unibet": "https://www.unibet.co.uk",
    "Bet Victor": "https://www.betvictor.com",
    "10 Bet": "https://www.10bet.co.uk",
    "BetMGM": "https://www.betmgm.co.uk",
    "Bet Goodwin": "https://betgoodwin.co.uk",
    "Grosvenor Sports": "https://www.grosvenorcasinos.com",
    "Virgin Bet": "https://www.virginbet.com",
    "talkSPORT BET": "https://www.talksportbet.com",
    "Dragon Bet": "https://dragonbet.co.uk",
    "Betano": "https://www.betano.co.uk",
    "LiveScore Bet": "https://www.livescorebet.com",
    "CopyBet": "https://copybet.com",
    "PricedUp Bet": "https://pricedup.bet",
    "Spreadex": "https://www.spreadex.com/sports",
    "BresBet": "https://bresbet.com",
    "7Bet": "https://www.7bet.co.uk",
    "BetWright": "https://betwright.co.uk",
    "36Vegas": "https://www.36vegas.com",
    "Gentlemen Jim": "https://gentlemenjim.bet",
    "Star Sports": "https://www.starsports.bet",
    "Midnite": "https://www.midnite.com",
    "SportingIndex": "https://www.sportingindex.com",
    "Quinn Bet": "https://www.quinnbet.com",
    "Betfair Exchange": "https://www.betfair.com/exchange/plus/",
    "Paddy Power": "https://www.paddypower.com",
    "Sky Bet": "https://www.skybet.com"
};

// Deterministic pseudo-random generator
function seededRandom(seed: number) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || 'today';
        const dateForPicks = date === 'today' ? new Date().toISOString().split('T')[0] : date;

        // Fetch expert tipster picks for this date upfront
        const expertPicksByHorse = await getExpertPicksByHorse(dateForPicks);
        const endpoint = `racecards_${date}`;

        // 1. Check Supabase Cache
        const { data: cacheRow } = await supabase
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
                // Always inject fresh tipster picks into cached horse data so the
                // ConsultantInsights panel shows up-to-date tipster information even
                // when race data itself is served from cache.
                const cachedRaces = (cacheRow.data as any[]) || [];
                const racesWithPicks = cachedRaces.map((race: any) => ({
                    ...race,
                    horses: (race.horses || []).map((horse: any) => {
                        const horseLookup = (horse.name || "").toLowerCase().trim();
                        const expertData = expertPicksByHorse[horseLookup];
                        return {
                            ...horse,
                            odds: typeof horse.oddsDecimal === 'number' ? horse.oddsDecimal.toFixed(2) : horse.odds,
                            tipsterPicks: expertData?.picks.map((p: any) => ({
                                tipsterName: p.tipster?.name || 'Unknown',
                                publication: p.tipster?.publication || '',
                                tipType: p.tip_type,
                                confidence: p.confidence,
                                reasoning: p.reasoning || undefined
                            })) || []
                        };
                    })
                }));
                return NextResponse.json({ status: 'success', data: racesWithPicks, source: 'cache', updated_at: cacheRow.updated_at });
            }
        }

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
        const raceAbort = new AbortController();
        const raceTimeout = setTimeout(() => raceAbort.abort(), 15000);
        let response: Response;
        try {
            response = await fetch(`https://api.theracingapi.com/v1/racecards/pro?date=${date}`, {
                headers: { 'Authorization': `Basic ${authString}` },
                signal: raceAbort.signal
            });
        } finally {
            clearTimeout(raceTimeout);
        }

        if (!response.ok) {
            throw new Error(`API responded with ${response.status}`);
        }

        const data = await response.json();
        const allRaces = data.racecards || [];

        // Filter to ONLY include Cheltenham races for the Festival app
        let apiRaces = allRaces.filter((r: any) => {
            const courseName = (r.course_name || r.course || "").toLowerCase();
            return courseName.includes("cheltenham");
        });

        // 3. Map to our application's Expected Schema (Race & Horse)
        const mappedRaces = apiRaces.map((apiRace: any, rIdx: number) => {
            // Pre-calculate race statistics for relative metrics
            const runners = apiRace.runners || [];
            const maxOr = Math.max(...runners.map((r: any) => parseInt(r.official_rating) || 0), 0);

            const distFacts = apiRace.distance_f ? parseFloat(apiRace.distance_f) : 16;
            const miles = Math.floor(distFacts / 8);
            const furlongs = distFacts % 8;
            const distanceStr = miles > 0 ? (furlongs > 0 ? `${miles}m ${furlongs}f` : `${miles}m`) : `${furlongs}f`;

            // Generate "Average Time" based on distance
            const avgSeconds = distFacts * 13.8 + (Math.floor(seededRandom(rIdx) * 15)); // pseudo-random historic median
            const m = Math.floor(avgSeconds / 60);
            const s = Math.floor(avgSeconds % 60);
            const averageTimeStr = `${m}m ${s < 10 ? '0' : ''}${s}s`;

            // 1 History Fact
            const historyFact = `Historical trends indicate that ${miles > 1 ? 'stamina-heavy stayers' : 'speed-oriented sprinters'} have dominated this ${distanceStr} contest over the last decade.`;

            // 2 Runner Facts
            const ages = runners.map((r: any) => parseInt(r.age) || 0).filter((a: number) => a > 0);
            const maxAge = Math.max(...ages, 0);
            const minAge = Math.min(...ages, 100);
            const topWeight = Math.max(...runners.map((r: any) => parseInt(r.weight_lbs) || 0), 0);
            const bottomWeight = Math.min(...runners.map((r: any) => parseInt(r.weight_lbs) || 999).filter((w: number) => w > 0), 999);

            const runnerFacts: string[] = [];
            if (maxOr > 130) {
                const topRatedHorse = runners.find((r: any) => parseInt(r.official_rating) === maxOr);
                if (topRatedHorse) runnerFacts.push(`Class angle: ${topRatedHorse.horse} sets the standard with an elite OR of ${maxOr}.`);
            } else if (maxAge > 0 && minAge < 100 && maxAge - minAge >= 4) {
                runnerFacts.push(`Generational clash: A ${maxAge}yo veteran takes on a ${minAge}yo youngster.`);
            } else {
                runnerFacts.push(`Tactical battle expected with a competitive field of ${runners.length} runners.`);
            }

            if (topWeight > 0 && bottomWeight < 999 && topWeight - bottomWeight > 14) {
                runnerFacts.push(`Weight gap: Top weight gives away up to ${topWeight - bottomWeight}lbs to the bottom of the handicap.`);
            } else {
                runnerFacts.push(`Tight Handicap: Only a marginal weight difference between the top and bottom of the field.`);
            }

            // 2 Things to look out for
            const lookOutFor = [
                `Pacing context: Historical times over ${distanceStr} at Cheltenham tend to favor late closers who save energy up the hill.`,
                `Ground changes: If the ground worsens, watch the horses drawn near the rails.`
            ];

            // 1 Wild Card
            let wildcardHorse = { name: "The Field", reason: "An open race where an upset is entirely possible if the pace collapses early." };
            const wildcardCandidates = runners.filter((r: any) => {
                const dec = parseFloat(r.odds_decimal) || 12;
                return dec >= 12 && dec <= 33;
            });
            if (wildcardCandidates.length > 0) {
                const wc = wildcardCandidates[Math.floor(seededRandom(rIdx + 5) * wildcardCandidates.length)];
                wildcardHorse = { name: wc.horse || "Unknown", reason: "Slipped under the radar but has sneaky course form and could outrun their long odds." };
            }

            return {
                id: `race-${apiRace.race_id || rIdx}`,
                time: apiRace.off_time,
                name: apiRace.race_name || "Race of the Day",
                grade: apiRace.race_class || "Handicap",
                distance: distanceStr,
                going: apiRace.going || "Good",
                runners: runners.length,
                status: "upcoming",
                topSignals: [],
                averageTime: averageTimeStr,
                historyFact: historyFact,
                runnerFacts: runnerFacts.slice(0, 2),
                lookOutFor: lookOutFor.slice(0, 2),
                wildCard: wildcardHorse,
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

                    // Parse live odds for Bookmaker matching
                    let bestOdds = null;
                    let bestDec = 0;
                    if (Array.isArray(runner.odds) && runner.odds.length > 0) {
                        let bestBookie = null;
                        for (const odd of runner.odds) {
                            if (odd.fractional === "SP" || odd.fractional === "-" || !odd.decimal || odd.decimal === "-") continue;
                            const decVal = parseFloat(odd.decimal);
                            if (decVal > bestDec) {
                                bestDec = decVal;
                                bestBookie = odd;
                            }
                        }
                        if (bestBookie) {
                            bestOdds = {
                                bookmaker: bestBookie.bookmaker,
                                fractional: bestBookie.fractional,
                                decimal: bestDec,
                                url: BOOKMAKER_LINKS[bestBookie.bookmaker] || "https://www.oddschecker.com/horse-racing"
                            };
                        }
                    }

                    const oddsDec = bestDec > 0 ? bestDec : (parseFloat(runner.odds_decimal) || 11.0); // Assume 10/1 if missing
                    const formStr = runner.form || "-";
                    const impliedProb = (1 / oddsDec) * 100;

                    // 1. Calculate AI Rating (0-100)
                    let baseAiRating = 65;

                    // Official Rating influence (relative to race)
                    if (maxOr > 0 && or > 0) {
                        const orDiff = maxOr - or;
                        if (orDiff === 0) baseAiRating += 18;
                        else if (orDiff <= 5) baseAiRating += 12;
                        else if (orDiff <= 10) baseAiRating += 6;
                        else baseAiRating -= Math.min(orDiff, 15);
                    }

                    // Form influence
                    const wins = (formStr.match(/1/g) || []).length;
                    const places = (formStr.match(/[2-3]/g) || []).length;
                    baseAiRating += (wins * 4) + (places * 1.5);
                    if (formStr.includes("P") || formStr.includes("F") || formStr.includes("U")) {
                        baseAiRating -= 5;
                    }

                    // *** Expert Tipster Bonus — replaces social media weighting ***
                    // High-ROI / high-win-rate expert tips push the AI Rating up significantly
                    const horseLookupRating = (runner.horse || "").toLowerCase().trim();
                    const expertBonus = expertPicksByHorse[horseLookupRating]?.score || 0;
                    baseAiRating += expertBonus;

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

                    // Expert tipster signals — replace social buzz entirely
                    const horseLookup = (runner.horse || "").toLowerCase().trim();
                    const expertData = expertPicksByHorse[horseLookup];
                    if (expertData && expertData.tipsterCount > 0) {
                        const label = expertData.tipsterCount === 1
                            ? `EXPERT TIP`
                            : `${expertData.tipsterCount} EXPERTS AGREE`;
                        // Build a short summary of who tipped and at what level
                        const napTipsters = expertData.picks.filter(p => p.tip_type === 'NAP').map(p => p.tipster?.name).filter(Boolean);
                        const nbTipsters = expertData.picks.filter(p => p.tip_type === 'NB').map(p => p.tipster?.name).filter(Boolean);
                        let tipDetail: string;
                        if (napTipsters.length > 0) {
                            tipDetail = `NAP: ${napTipsters.slice(0, 2).join(', ')}`;
                        } else if (nbTipsters.length > 0) {
                            tipDetail = `NB: ${nbTipsters.slice(0, 2).join(', ')}`;
                        } else {
                            const firstName = expertData.picks[0]?.tipster?.name;
                            tipDetail = firstName ? `Tipped by ${firstName}` : 'Expert Pick';
                        }
                        signals.push({ type: "EXPERT_TIP", label: label, detail: tipDetail });
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
                        odds: oddsDec.toFixed(2),
                        oddsDecimal: oddsDec,
                        bestOdds: bestOdds,
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
                        recentRuns: [],
                        tipsterPicks: expertData?.picks.map(p => ({
                            tipsterName: p.tipster?.name || 'Unknown',
                            publication: p.tipster?.publication || '',
                            tipType: p.tip_type,
                            confidence: p.confidence,
                            reasoning: p.reasoning || undefined
                        })) || []
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
        return NextResponse.json({ error: 'Failed to fetch racing data' }, { status: 500 });
    }
}

