import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { message, style } = await req.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        let racingData = [];
        const { data: cacheRow } = await supabase
            .from('racing_cache')
            .select('data')
            .eq('endpoint', 'daily_racecards')
            .single();

        if (cacheRow && cacheRow.data) {
            racingData = typeof cacheRow.data === 'string' ? JSON.parse(cacheRow.data) : cacheRow.data;
        }

        const aiResponse = await generateChatResponse(message, style || "favourites", racingData);

        return NextResponse.json({
            content: aiResponse
        });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        );
    }
}
