import { createClient } from '@supabase/supabase-js';
import type { TipsterPick } from '@/lib/types';

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

/** Raw row from the cheltenham_tips table (AI-extracted live tips) */
export interface ChelthamTip {
    id: string;
    race_date: string;
    race_time: string | null;
    race_name: string | null;
    horse_name: string;
    tipster_name: string;
    tip_type: 'Win' | 'Each Way' | 'NAP';
    created_at: string;
}

/** Row from the consensus_picks view */
export interface ConsensusPick {
    race_date: string;
    race_time: string | null;
    race_name: string | null;
    horse_name: string;
    consensus_votes: number;
    tipsters: string[];
    tip_types: string[];
    has_nap: boolean;
    voteStrength?: number; // 0–100, added client-side
}

/**
 * Map cheltenham_tips tip_type strings to the internal TipsterPick tipType keys
 * so the existing color-coding in ConsultantInsights.tsx works correctly.
 */
function mapTipType(raw: string): 'NAP' | 'NB' | 'EACH_WAY' | 'VALUE' | 'LONGSHOT' {
    switch (raw) {
        case 'NAP': return 'NAP';
        case 'Each Way': return 'EACH_WAY';
        case 'Win':
        default: return 'VALUE';
    }
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
 * Fetch expert picks from the normalised expert_picks table (joined with tipsters).
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
 * Fetch AI-extracted tips from the cheltenham_tips table.
 */
export async function getChelthamTips(date: string): Promise<ChelthamTip[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('cheltenham_tips')
        .select('*')
        .eq('race_date', date);

    if (error) {
        console.error('[Tipsters] Failed to fetch cheltenham_tips:', error.message);
        return [];
    }
    return data || [];
}

/**
 * Fetch the consensus_picks view for a given date.
 * Returns horses sorted by consensus_votes DESC.
 */
export async function getConsensusPicks(date: string): Promise<ConsensusPick[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('consensus_picks')
        .select('*')
        .eq('race_date', date)
        .order('consensus_votes', { ascending: false });

    if (error) {
        console.error('[Tipsters] Failed to fetch consensus_picks:', error.message);
        return [];
    }
    return data || [];
}

/**
 * Get expert picks grouped by horse name for a given race date.
 *
 * Sources:
 *  1. expert_picks (normalised, ROI-weighted) — existing table
 *  2. cheltenham_tips (AI-extracted live web tips) — new table
 *
 * Returns a map of lower-case horse_name → {
 *   picks        – ExpertPick[] from expert_picks (with tipster joins)
 *   tipsterPicks – TipsterPick[] merged from BOTH sources (ready to attach to Horse)
 *   tipsterCount – total across both sources
 *   score        – 0-20 AI rating bonus, weighted by tipster ROI where known
 *   highestTipType
 * }
 */
export async function getExpertPicksByHorse(date: string): Promise<Record<string, {
    picks: ExpertPick[];
    tipsterPicks: TipsterPick[];
    tipsterCount: number;
    score: number;
    highestTipType: string;
}>> {
    // Fetch both sources in parallel
    const [expertPicks, chelthamTips] = await Promise.all([
        getExpertPicksForDate(date),
        getChelthamTips(date)
    ]);

    // ── 1. Group expert_picks by horse ─────────────────────────────────────
    const byHorse: Record<string, ExpertPick[]> = {};
    for (const pick of expertPicks) {
        const key = pick.horse_name.toLowerCase().trim();
        if (!byHorse[key]) byHorse[key] = [];
        byHorse[key].push(pick);
    }

    // ── 2. Group cheltenham_tips by horse ──────────────────────────────────
    const cheltByHorse: Record<string, ChelthamTip[]> = {};
    for (const tip of chelthamTips) {
        const key = tip.horse_name.toLowerCase().trim();
        if (!cheltByHorse[key]) cheltByHorse[key] = [];
        cheltByHorse[key].push(tip);
    }

    // ── 3. Build merged result ─────────────────────────────────────────────
    const allKeys = new Set([...Object.keys(byHorse), ...Object.keys(cheltByHorse)]);
    const result: Record<string, {
        picks: ExpertPick[];
        tipsterPicks: TipsterPick[];
        tipsterCount: number;
        score: number;
        highestTipType: string;
    }> = {};

    for (const horseName of allKeys) {
        const horsePicks = byHorse[horseName] || [];
        const horseTips = cheltByHorse[horseName] || [];

        let score = 0;
        let highestTipType = 'VALUE';

        // Score from normalised expert_picks (ROI-weighted)
        for (const pick of horsePicks) {
            const tipster = pick.tipster;
            const roiWeight = tipster ? Math.min(tipster.roi_percentage / 100, 1.0) : 0.2;
            const winWeight = tipster ? Math.min(tipster.win_rate / 50, 1.0) : 0.5;

            const tipPoints: Record<string, number> = { NAP: 10, NB: 8, EACH_WAY: 5, VALUE: 5, LONGSHOT: 3 };
            const base = tipPoints[pick.tip_type] || 4;
            const confMult: Record<string, number> = { HIGH: 1.5, MEDIUM: 1.0, LOW: 0.6 };
            const conf = confMult[pick.confidence] || 1.0;

            score += base * conf * (roiWeight + winWeight) / 2;

            if (pick.tip_type === 'NAP') highestTipType = 'NAP';
            else if (pick.tip_type === 'NB' && highestTipType !== 'NAP') highestTipType = 'NB';
        }

        // Score from cheltenham_tips (flat weight — no ROI metadata)
        for (const tip of horseTips) {
            const tipPoints: Record<string, number> = { NAP: 10, 'Each Way': 5, Win: 4 };
            const base = tipPoints[tip.tip_type] || 4;
            const flatWeight = 0.5; // conservative weight when no ROI data
            score += base * flatWeight;

            if (tip.tip_type === 'NAP') highestTipType = 'NAP';
        }

        // ── Merge into TipsterPick[] (used by Horse.tipsterPicks on the frontend) ──

        // From expert_picks
        const expertTipsterPicks: TipsterPick[] = horsePicks.map(p => ({
            tipsterName: p.tipster?.name || 'Expert',
            publication: p.tipster?.publication || '',
            tipType: p.tip_type,
            confidence: p.confidence,
            reasoning: p.reasoning || undefined
        }));

        // From cheltenham_tips (deduplicate against expert names already included)
        const expertNames = new Set(expertTipsterPicks.map(p => p.tipsterName.toLowerCase()));
        const chelthamTipsterPicks: TipsterPick[] = horseTips
            .filter(t => !expertNames.has(t.tipster_name.toLowerCase()))
            .map(t => ({
                tipsterName: t.tipster_name,
                publication: t.tipster_name,          // no separate publication field
                tipType: mapTipType(t.tip_type),
                confidence: 'MEDIUM' as const,
                reasoning: undefined
            }));

        const mergedTipsterPicks = [...expertTipsterPicks, ...chelthamTipsterPicks];

        result[horseName] = {
            picks: horsePicks,
            tipsterPicks: mergedTipsterPicks,
            tipsterCount: mergedTipsterPicks.length,
            score: Math.min(Math.round(score), 20),
            highestTipType
        };
    }

    return result;
}

/**
 * Seed today's picks for the festival — called by /api/sync-tipsters
 * Uses horse names from the racecard to intelligently assign picks.
 * NOTE: This generates placeholder data. For live tips use /api/tips/collect instead.
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

    for (let i = 0; i < tipsters.length; i++) {
        const tipster = tipsters[i];
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
