import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return NextResponse.json({ error: 'Valid intelligence email required.' }, { status: 400 });
        }

        // Insert into subscriptions table
        // Note: Using service role or public insert depends on Supabase RLS.
        // For lead generation, we assumes the public insert policy created in migration is active.
        const { error } = await supabase
            .from('subscriptions')
            .insert([{ email, status: 'active' }]);

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'This intelligence link already exists.' }, { status: 400 });
            }
            console.error('[Subscribe API Error]:', error);
            return NextResponse.json({ error: 'Failed to establish link.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Subscribe API Error]:', error);
        return NextResponse.json({ error: 'Internal system error.' }, { status: 500 });
    }
}
