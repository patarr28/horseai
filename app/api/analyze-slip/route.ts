import { NextResponse } from 'next/server';
import { analyzeBetSlip } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const { legs, stake } = await req.json();

        if (!legs || !Array.isArray(legs) || legs.length === 0) {
            return NextResponse.json(
                { error: 'Valid legs array is required' },
                { status: 400 }
            );
        }

        const rawStake = parseFloat(stake);
        const safeStake = isNaN(rawStake) || rawStake <= 0 ? 10 : Math.min(rawStake, 100000);

        const analysis = await analyzeBetSlip(legs, String(safeStake));

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Slip Analysis API Error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze bet slip' },
            { status: 500 }
        );
    }
}
