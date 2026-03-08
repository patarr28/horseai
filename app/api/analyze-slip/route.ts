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

        const analysis = await analyzeBetSlip(legs, stake || '10');

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Slip Analysis API Error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze bet slip' },
            { status: 500 }
        );
    }
}
