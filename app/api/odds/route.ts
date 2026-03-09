import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId'); // e.g., Cheltenham festival ID

    if (!eventId) {
        return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // TODO: Replace with actual Odds API integration when keys are available
    // const apiKey = process.env.ODDS_API_KEY;
    // const response = await fetch(`https://api.the-odds-api.com/v4/sports/horse_racing/events/${eventId}/odds?apiKey=${apiKey}&regions=uk`);
    // const data = await response.json();

    // For now, return a placeholder or mock structure
    return NextResponse.json({
        status: 'success',
        message: 'Odds API route configured (Mock)',
        data: []
    });
}
