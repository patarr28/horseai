"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    User, Bell, ChevronRight, Shield, TrendingUp,
    Smartphone, Trophy, Star, LogIn, Zap, LogOut
} from "lucide-react";

type BettingStyle = "favourites" | "value" | "nofavs" | "lucky15" | "smartacca";
type RiskTolerance = "low" | "medium" | "high";

const bettingStyles: { key: BettingStyle; icon: string; label: string }[] = [
    { key: "favourites", icon: "🟢", label: "Strong Favourites" },
    { key: "value", icon: "💎", label: "Value Hunters" },
    { key: "nofavs", icon: "🚫", label: "No Favourites" },
    { key: "lucky15", icon: "🎲", label: "Lucky 15 Builder" },
    { key: "smartacca", icon: "🧠", label: "Smart Acca" },
];

export default function AccountPage() {
    const [selectedStyle, setSelectedStyle] = useState<BettingStyle>("value");
    const [risk, setRisk] = useState<RiskTolerance>("medium");
    const [notifications, setNotifications] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    const riskLabels: Record<RiskTolerance, { label: string; color: string }> = {
        low: { label: "Conservative", color: "text-neon-green" },
        medium: { label: "Balanced", color: "text-value-orange" },
        high: { label: "Aggressive", color: "text-risk-red" },
    };

    return (
        <div className="animate-fade-in pb-24">
            {/* Header */}
            <header className="relative overflow-hidden px-4 pt-5 pb-4">
                <div className="pointer-events-none absolute -top-8 right-0 h-24 w-24 rounded-full bg-neon-green/5 blur-2xl" />
                <div className="relative flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neon-green/30 bg-neon-green/10">
                        <User className="h-7 w-7 text-neon-green" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-text-primary">My Account</h1>
                        <p className="text-xs text-muted-light">Festival Whisperer 3.0</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="rounded-full border border-neon-green/25 bg-neon-green/10 px-2.5 py-1 text-[10px] font-bold text-neon-green">
                            {user ? user.email?.split('@')[0] : 'Guest'}
                        </span>
                        {user && (
                            <button onClick={handleSignOut} className="rounded-full border border-surface-border bg-surface p-1.5 text-muted-light hover:text-risk-red transition-colors">
                                <LogOut className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Sign-in CTA */}
            {!user && (
                <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-neon-green/20 bg-gradient-to-br from-neon-green/8 to-transparent p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-green/15">
                            <Zap className="h-5 w-5 text-neon-green" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-text-primary">Sign in to unlock full features</p>
                            <p className="text-[10px] text-muted-light">Save picks, track bets, sync across devices</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/login')}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-neon-green py-2.5 text-sm font-bold text-terminal-bg transition-all hover:bg-neon-green-dim active:scale-[0.98]">
                        <LogIn className="h-4 w-4" />
                        Sign in / Sign up
                    </button>
                </div>
            )}

            {/* Betting Style Preference */}
            <div className="mx-4 mb-4">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-light">Betting Style</h2>
                <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
                    {bettingStyles.map(({ key, icon, label }, idx) => (
                        <button
                            key={key}
                            onClick={() => setSelectedStyle(key)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover active:scale-[0.99] ${idx < bettingStyles.length - 1 ? "border-b border-surface-border/50" : ""
                                }`}
                        >
                            <span className="text-lg">{icon}</span>
                            <span className={`flex-1 text-sm font-medium ${selectedStyle === key ? "text-text-primary" : "text-text-secondary"}`}>
                                {label}
                            </span>
                            {selectedStyle === key && (
                                <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Risk Tolerance */}
            <div className="mx-4 mb-4">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-light">Risk Tolerance</h2>
                <div className="flex gap-2">
                    {(["low", "medium", "high"] as RiskTolerance[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRisk(r)}
                            className={`flex-1 rounded-xl border py-3 text-xs font-bold uppercase tracking-wide transition-all active:scale-95 ${risk === r
                                ? r === "low"
                                    ? "border-neon-green/40 bg-neon-green/10 text-neon-green"
                                    : r === "medium"
                                        ? "border-value-orange/40 bg-value-orange/10 text-value-orange"
                                        : "border-risk-red/40 bg-risk-red/10 text-risk-red"
                                : "border-surface-border text-muted-light"
                                }`}
                        >
                            {riskLabels[r].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="mx-4 mb-4">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-light">Festival Stats</h2>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { icon: Trophy, label: "Picks", value: "0", color: "text-neon-green" },
                        { icon: TrendingUp, label: "Win Rate", value: "—", color: "text-value-orange" },
                        { icon: Star, label: "Best Odds", value: "—", color: "text-text-primary" },
                    ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} className="rounded-xl border border-surface-border bg-surface p-3 text-center">
                            <Icon className={`mx-auto h-4 w-4 mb-1 ${color}`} />
                            <p className={`font-mono-data text-lg font-bold ${color}`}>{value}</p>
                            <p className="text-[9px] uppercase tracking-wider text-muted mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Beat the Whisperer Leaderboard */}
            <div className="mx-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-light">Beat The Whisperer</h2>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-full border border-neon-green/20">
                        <Trophy className="h-3 w-3" />
                        Live
                    </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface divide-y divide-surface-border/50">
                    {[
                        { rank: 1, name: "AI Whisperer", roi: "+24.5%", isSystem: true },
                        { rank: 2, name: "You (Guest)", roi: "0.0%", isUser: true },
                        { rank: 3, name: "@CryptoPunt", roi: "-5.2%" },
                        { rank: 4, name: "@CheltsKing", roi: "-12.8%" },
                    ].map((player, idx) => (
                        <div key={idx} className={`flex items-center gap-3 px-4 py-3 ${player.isUser ? "bg-neon-green/5" : ""}`}>
                            <span className={`font-mono-data text-xs font-bold ${player.rank === 1 ? "text-gold" : "text-muted-light"}`}>
                                #{player.rank}
                            </span>
                            <div className="flex-1">
                                <p className={`text-sm font-semibold ${player.isSystem ? "text-neon-green text-glow-green" : player.isUser ? "text-text-primary" : "text-text-secondary"}`}>
                                    {player.name}
                                </p>
                            </div>
                            <span className={`font-mono-data text-sm font-bold ${player.roi.startsWith('+') ? "text-neon-green" : player.roi === "0.0%" ? "text-text-secondary" : "text-risk-red"}`}>
                                {player.roi}
                            </span>
                        </div>
                    ))}
                    <div className="p-3 text-center bg-surface-hover/50">
                        <button className="text-xs font-bold text-neon-green hover:text-neon-green-dim transition-colors">
                            View Full Leadeboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="mx-4 mb-4">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-light">Settings</h2>
                <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface divide-y divide-surface-border/50">
                    {/* Notifications toggle */}
                    <div className="flex items-center gap-3 px-4 py-3">
                        <Bell className="h-4 w-4 text-muted-light shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">Value Alert Notifications</p>
                            <p className="text-[10px] text-muted">Ping when a new value bet appears</p>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${notifications ? "bg-neon-green" : "bg-surface-border"}`}
                        >
                            <span
                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifications ? "translate-x-5" : "translate-x-0.5"}`}
                            />
                        </button>
                    </div>

                    {/* Install PWA */}
                    <div className="flex items-center gap-3 px-4 py-3">
                        <Smartphone className="h-4 w-4 text-muted-light shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">Install App</p>
                            <p className="text-[10px] text-muted">Add to home screen for best experience</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted" />
                    </div>

                    {/* Privacy */}
                    <div className="flex items-center gap-3 px-4 py-3">
                        <Shield className="h-4 w-4 text-muted-light shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">Privacy Policy</p>
                            <p className="text-[10px] text-muted">GDPR · 18+ · Gamble Responsibly</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted" />
                    </div>
                </div>
            </div>

            {/* Responsible gambling footer */}
            <div className="mx-4 rounded-xl border border-surface-border/50 bg-surface/50 p-3 text-center">
                <p className="text-[10px] text-muted leading-relaxed">
                    🔞 18+ only. Please gamble responsibly.<br />
                    <span className="text-neon-green/70">BeGambleAware.org</span> · <span className="text-neon-green/70">GamStop.co.uk</span>
                </p>
            </div>
        </div>
    );
}
