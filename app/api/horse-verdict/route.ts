import { NextResponse } from 'next/server';
import { generateHorseVerdict } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        if (!payload || Object.keys(payload).length === 0) {
            return NextResponse.json({ error: 'Valid horse data is required' }, { status: 400 });
        }

        const analysis = await generateHorseVerdict(payload);

        if (!analysis) {
            return NextResponse.json({ error: 'Failed to generate verdict' }, { status: 500 });
        }

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Horse Verdict API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error while evaluating horse' },
            { status: 500 }
        );
    }
}
