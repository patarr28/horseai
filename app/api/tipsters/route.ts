import { NextResponse } from 'next/server';
import { getTipsters } from '@/lib/tipsters';

/**
 * GET /api/tipsters
 * Returns all tipsters from Supabase, ordered by ROI.
 * Falls back to static list if Supabase tables don't exist yet.
 */
export async function GET() {
    const tipsters = await getTipsters();

    // If Supabase returns empty (tables not created yet), serve static fallback
    if (tipsters.length === 0) {
        const fallback = [
            { id: '1', name: 'Ruby Walsh', publication: 'Racing TV / Paddy Power', specialty: 'Festival Bankers', win_rate: 41.50, roi_percentage: 28.70, picks_this_season: 60, color_hex: '#ff8c00' },
            { id: '2', name: 'Tom Segal', publication: 'Racing Post (Pricewise)', specialty: 'Value Betting', win_rate: 29.50, roi_percentage: 42.80, picks_this_season: 95, color_hex: '#ff8c00' },
            { id: '3', name: 'Willie Mullins', publication: 'Racing Post Cheltenham Special', specialty: 'Festival Certainties', win_rate: 48.20, roi_percentage: 35.50, picks_this_season: 70, color_hex: '#ff8c00' },
            { id: '4', name: 'Tony McCoy', publication: 'ITV Racing / At The Races', specialty: 'Cheltenham Specialists', win_rate: 38.10, roi_percentage: 22.30, picks_this_season: 52, color_hex: '#39ff14' },
            { id: '5', name: 'Rachael Blackmore', publication: 'HRI / Betway Blog', specialty: 'Irish Festival Picks', win_rate: 37.40, roi_percentage: 19.80, picks_this_season: 55, color_hex: '#39ff14' },
            { id: '6', name: 'Mick Fitzgerald', publication: 'Racing Post / ITV', specialty: 'Novice Hurdles & Chases', win_rate: 34.20, roi_percentage: 18.50, picks_this_season: 48, color_hex: '#39ff14' },
            { id: '7', name: 'Nicky Henderson', publication: 'Racing Post', specialty: 'Champion Hurdle Intel', win_rate: 36.30, roi_percentage: 17.60, picks_this_season: 50, color_hex: '#39ff14' },
            { id: '8', name: 'Barry Geraghty', publication: 'Betfair / Sky Sports', specialty: 'Jump Racing', win_rate: 35.80, roi_percentage: 15.20, picks_this_season: 44, color_hex: '#39ff14' },
            { id: '9', name: 'Nick Luck', publication: 'Racing Post / Channel 4', specialty: 'Each Way Specialists', win_rate: 31.00, roi_percentage: 14.30, picks_this_season: 88, color_hex: '#39ff14' },
            { id: '10', name: 'Paul Nicholls', publication: 'Racing Post', specialty: 'Trainer Insight', win_rate: 42.00, roi_percentage: 31.00, picks_this_season: 38, color_hex: '#ff8c00' },
            { id: '11', name: 'Henry De Bromhead', publication: 'At The Races Blog', specialty: 'Grade 1 Specialists', win_rate: 39.70, roi_percentage: 24.10, picks_this_season: 45, color_hex: '#ff8c00' },
            { id: '12', name: 'Templegate', publication: 'The Sun Racing', specialty: 'Daily Naps', win_rate: 27.80, roi_percentage: 8.90, picks_this_season: 110, color_hex: '#39ff14' },
        ];
        return NextResponse.json({ status: 'success', data: fallback, source: 'fallback' });
    }

    return NextResponse.json({ status: 'success', data: tipsters, source: 'supabase' });
}
