import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase';

const DEFAULT_TIPSTERS = [
    { name: "Templegate", publication: "The Sun", specialty: "Festival Bankers", win_rate: 34.5, roi_percentage: 12.4, picks_this_season: 142, color_hex: "#DC2626" },
    { name: "Tom Segal", publication: "Racing Post (Pricewise)", specialty: "Value / Longshots", win_rate: 18.2, roi_percentage: 24.8, picks_this_season: 85, color_hex: "#2563EB" },
    { name: "Ruby Walsh", publication: "Paddy Power", specialty: "Irish Runners", win_rate: 41.0, roi_percentage: 8.5, picks_this_season: 64, color_hex: "#16A34A" },
    { name: "Kevin Blake", publication: "At The Races", specialty: "Handicaps", win_rate: 22.4, roi_percentage: 18.1, picks_this_season: 92, color_hex: "#9333EA" },
    { name: "Matt Chapman", publication: "ITV Racing", specialty: "Form Study", win_rate: 28.6, roi_percentage: 5.2, picks_this_season: 110, color_hex: "#EA580C" }
];

export async function GET() {
    const { data } = await supabase.from('tipsters').select('name');
    if (data && data.length > 0) {
        return NextResponse.json({ message: 'Tipsters already seeded', count: data.length });
    }

    const { error } = await supabase.from('tipsters').insert(DEFAULT_TIPSTERS);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Successfully seeded tipsters.' });
}
