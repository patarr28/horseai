import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { generateChatResponse, analyzeAccaImage } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import { getExpertPicksByHorse, getConsensusPicks } from '@/lib/tipsters';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const message = formData.get('message') as string;
        const style = formData.get('style') as string || "favourites";
        const image = formData.get('image') as File | null;

        // Fetch all 4 days of racing data for full festival context
        const FESTIVAL_DAYS = [
            "2026-03-10",
            "2026-03-11",
            "2026-03-12",
            "2026-03-13",
        ];

        // Parallel fetch from cache or live if needed (prefer cache for speed in chat)
        const cachePromises = FESTIVAL_DAYS.map(async (date) => {
            const { data } = await supabase
                .from('racing_cache')
                .select('data')
                .eq('endpoint', `racecards_${date}`)
                .single();
            return data?.data || [];
        });

        const todayStr = new Date().toISOString().split('T')[0];

        // Fetch expert picks + live tipster consensus in parallel with race data
        const [allRacingData, expertPicks, consensusPicks] = await Promise.all([
            Promise.all(cachePromises).then(r => r.flat()),
            getExpertPicksByHorse(todayStr),
            // Consensus picks for today: sorted by vote count, ready for the AI to reference
            getConsensusPicks(todayStr)
        ]);

        // Format consensus as a compact summary so Gemini can reference it in answers
        const consensusSummary = consensusPicks.slice(0, 15).map(c =>
            `${c.horse_name} (${c.consensus_votes} tip${c.consensus_votes !== 1 ? 's' : ''}${c.has_nap ? ' — NAP' : ''}): ${c.tipsters.slice(0, 3).join(', ')}${c.tipsters.length > 3 ? ` +${c.tipsters.length - 3}` : ''}`
        );

        const context = {
            races: allRacingData,
            expertPicks: expertPicks,
            // Real-time tipster consensus from cheltenham_tips table
            tipsterConsensus: {
                date: todayStr,
                topPicks: consensusSummary,
                totalHorsesTipped: consensusPicks.length
            }
        };

        const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
        const MAX_MESSAGE_LENGTH = 2000;

        let aiResponse = "";

        if (image) {
            if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
                return NextResponse.json({ error: 'Unsupported image type. Please upload a JPEG, PNG, GIF, or WebP.' }, { status: 400 });
            }
            const buffer = Buffer.from(await image.arrayBuffer());
            if (buffer.length > MAX_IMAGE_BYTES) {
                return NextResponse.json({ error: 'Image too large. Maximum size is 5 MB.' }, { status: 400 });
            }
            aiResponse = await analyzeAccaImage(buffer, image.type, context);
        } else {
            if (!message) {
                return NextResponse.json({ error: 'Message is required' }, { status: 400 });
            }
            const safeMessage = message.slice(0, MAX_MESSAGE_LENGTH);
            aiResponse = await generateChatResponse(safeMessage, style, context);
        }

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
