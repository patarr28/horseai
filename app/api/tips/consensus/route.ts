import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const tipster = searchParams.get('tipster') || null; // optional filter

    try {
        let query = supabase
            .from('consensus_picks')
            .select('*')
            .eq('race_date', date)
            .order('consensus_votes', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('[Tips Consensus] Supabase error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        let picks = data || [];

        // Optional: filter to only rows where a specific tipster contributed
        if (tipster) {
            picks = picks.filter((row: any) =>
                Array.isArray(row.tipsters) &&
                row.tipsters.some((t: string) =>
                    t.toLowerCase().includes(tipster.toLowerCase())
                )
            );
        }

        // Attach useful derived fields
        const maxVotes = picks[0]?.consensus_votes || 1;
        const enriched = picks.map((row: any) => ({
            ...row,
            voteStrength: Math.round((row.consensus_votes / maxVotes) * 100), // 0–100 %
        }));

        return NextResponse.json({ date, picks: enriched });
    } catch (error: any) {
        console.error('[Tips Consensus] Unhandled error:', error?.message);
        return NextResponse.json({ error: 'Failed to fetch consensus' }, { status: 500 });
    }
}
