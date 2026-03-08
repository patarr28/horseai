"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [view, setView] = useState('sign-in'); // 'sign-in' or 'sign-up'
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
                data: {
                    username: email.split('@')[0],
                }
            },
        });
        if (error) {
            setError(error.message);
        } else {
            setView('check-email');
        }
        setLoading(false);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            setError(error.message);
        } else {
            router.push('/account');
            router.refresh();
        }
        setLoading(false);
    };

    if (view === 'check-email') {
        return (
            <div className="flex h-screen items-center justify-center bg-terminal-bg p-4 flex-col text-center">
                <h1 className="text-2xl font-bold text-neon-green mb-2">Check your email</h1>
                <p className="text-muted-light">We sent a verification link to {email}.</p>
                <button
                    onClick={() => setView('sign-in')}
                    className="mt-6 text-sm text-value-orange hover:underline"
                >
                    Back to Log In
                </button>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-terminal-bg px-4 pb-20 pt-10">
            <div className="w-full max-w-sm rounded-3xl border border-surface-border bg-surface p-6 shadow-2xl">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-text-primary">
                        {view === 'sign-in' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-light">
                        {view === 'sign-in' ? 'Sign in to sync your command centre.' : 'Join to track your ROI against the AI.'}
                    </p>
                </div>

                <form onSubmit={view === 'sign-in' ? handleSignIn : handleSignUp} className="space-y-4">
                    {error && (
                        <div className="rounded-xl border border-risk-red/30 bg-risk-red/10 p-3 text-sm text-risk-red">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-muted-light">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-xl border border-surface-border bg-terminal-bg px-4 py-3 text-text-primary outline-none focus:border-neon-green/50 transition-colors"
                            placeholder="punter@example.com"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase text-muted-light">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-xl border border-surface-border bg-terminal-bg px-4 py-3 text-text-primary outline-none focus:border-neon-green/50 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-neon-green py-3.5 text-sm font-bold text-terminal-bg shadow-[0_0_15px_rgba(0,255,136,0.1)] transition-all hover:bg-neon-green/90 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : view === 'sign-in' ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted">
                    {view === 'sign-in' ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setView(view === 'sign-in' ? 'sign-up' : 'sign-in')}
                        className="font-bold text-neon-green hover:underline"
                    >
                        {view === 'sign-in' ? 'Sign up' : 'Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
}
