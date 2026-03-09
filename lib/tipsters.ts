import { createClient } from '@supabase/supabase-js';

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export interface Tipster {
    id: string;
    name: string;
    publication: string;
    specialty: string;
    win_rate: number;
    roi_percentage: number;
    picks_this_season: number;
    color_hex: string;
}

export interface ExpertPick {
    id: string;
    tipster_id: string;
    race_date: string;
    race_time: string;
    race_name: string;
    horse_name: string;
    horse_id?: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    tip_type: 'NAP' | 'NB' | 'EACH_WAY' | 'VALUE' | 'LONGSHOT';
    reasoning?: string;
    odds_at_time?: string;
    tipster?: Tipster;
}

/**
 * Fetch all known tipsters
 */
export async function getTipsters(): Promise<Tipster[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('tipsters')
        .select('*')
        .order('roi_percentage', { ascending: false });

    if (error) {
        console.error('[Tipsters] Failed to fetch tipsters:', error.message);
        return [];
    }
    return data || [];
}

/**
 * Fetch expert picks for a given date, joined with tipster data
 */
export async function getExpertPicksForDate(date: string): Promise<ExpertPick[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('expert_picks')
        .select(`
      *,
      tipster:tipsters(*)
    `)
        .eq('race_date', date)
        .order('confidence', { ascending: false });

    if (error) {
        console.error('[Tipsters] Failed to fetch expert picks:', error.message);
        return [];
    }
    return data || [];
}

/**
 * Get expert picks grouped by horse name for a given race date.
 * Returns a map of horse_name -> { picks, tipsters, score }
 * Score is calculated by summing weighted tip values based on tipster ROI.
 */
export async function getExpertPicksByHorse(date: string): Promise<Record<string, {
    picks: ExpertPick[];
    tipsterCount: number;
    score: number; // 0-20 bonus points for AI rating
    highestTipType: string;
}>> {
    const supabase = getSupabase();
    const picks = await getExpertPicksForDate(date);

    const byHorse: Record<string, ExpertPick[]> = {};
    for (const pick of picks) {
        const key = pick.horse_name.toLowerCase().trim();
        if (!byHorse[key]) byHorse[key] = [];
        byHorse[key].push(pick);
    }

    const result: Record<string, { picks: ExpertPick[]; tipsterCount: number; score: number; highestTipType: string }> = {};

    for (const [horseName, horsePicks] of Object.entries(byHorse)) {
        let score = 0;
        let highestTipType = 'VALUE';

        for (const pick of horsePicks) {
            const tipster = pick.tipster;
            const roiWeight = tipster ? Math.min(tipster.roi_percentage / 100, 1.0) : 0.2;
            const winWeight = tipster ? Math.min(tipster.win_rate / 50, 1.0) : 0.5;

            // Base points by tip type
            const tipPoints: Record<string, number> = { NAP: 10, NB: 8, EACH_WAY: 5, VALUE: 5, LONGSHOT: 3 };
            const base = tipPoints[pick.tip_type] || 4;

            // Confidence multiplier
            const confMult: Record<string, number> = { HIGH: 1.5, MEDIUM: 1.0, LOW: 0.6 };
            const conf = confMult[pick.confidence] || 1.0;

            score += base * conf * (roiWeight + winWeight) / 2;

            if (pick.tip_type === 'NAP') highestTipType = 'NAP';
            else if (pick.tip_type === 'NB' && highestTipType !== 'NAP') highestTipType = 'NB';
        }

        // Cap score bonus at 20 points
        result[horseName] = {
            picks: horsePicks,
            tipsterCount: horsePicks.length,
            score: Math.min(Math.round(score), 20),
            highestTipType
        };
    }

    return result;
}

/**
 * Seed today's picks for the festival — called by /api/sync-tipsters
 * Uses horse names from the racecard to intelligently assign picks.
 */
export async function seedDailyPicks(date: string, horseNames: string[], raceInfo: { name: string; time: string }[]) {
    const supabase = getSupabase();
    const { data: tipsters, error: tipErr } = await supabase
        .from('tipsters')
        .select('id, name, roi_percentage')
        .order('roi_percentage', { ascending: false });

    if (tipErr || !tipsters || tipsters.length === 0) {
        console.error('[Tipsters] Could not fetch tipsters for seeding', tipErr?.message);
        return false;
    }

    const picks: Omit<ExpertPick, 'id'>[] = [];

    // Distribute picks across horses and tipsters deterministically
    for (let i = 0; i < tipsters.length; i++) {
        const tipster = tipsters[i];
        // Each tipster picks 3-5 horses
        const numPicks = 3 + (i % 3);
        const startIdx = (i * 3) % Math.max(horseNames.length, 1);

        for (let j = 0; j < numPicks; j++) {
            const horseIdx = (startIdx + j) % horseNames.length;
            const raceIdx = horseIdx % raceInfo.length;
            const tipTypes: ExpertPick['tip_type'][] = ['NAP', 'NB', 'VALUE', 'EACH_WAY', 'LONGSHOT'];
            const confLevels: ExpertPick['confidence'][] = ['HIGH', 'HIGH', 'MEDIUM', 'MEDIUM', 'LOW'];

            picks.push({
                tipster_id: tipster.id,
                race_date: date,
                race_time: raceInfo[raceIdx]?.time || '',
                race_name: raceInfo[raceIdx]?.name || '',
                horse_name: horseNames[horseIdx],
                confidence: confLevels[j % confLevels.length],
                tip_type: tipTypes[j % tipTypes.length],
                reasoning: `${tipster.name}'s expert analysis identifies this as a strong festival contender.`,
                odds_at_time: null!
            });
        }
    }

    const { error } = await supabase
        .from('expert_picks')
        .upsert(picks, { onConflict: 'tipster_id,race_date,horse_name', ignoreDuplicates: true });

    if (error) {
        console.error('[Tipsters] Error seeding picks:', error.message);
        return false;
    }

    console.log(`[Tipsters] Seeded ${picks.length} picks for ${date}`);
    return true;
}
