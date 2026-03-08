"use client";

import { use, useState, useEffect } from "react";
import AIRacePreview from "@/components/AIRacePreview";
import { getValueData } from "@/lib/value-engine";
import HorseRow from "@/components/HorseRow";
import SignalBadge from "@/components/SignalBadge";
import {
    ArrowLeft,
    Clock,
    Users,
    MapPin,
    Share2,
    Zap,
    SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

interface RacePageProps {
    params: Promise<{ id: string }>;
}

type Filter = "all" | "banker" | "value" | "social";

export default function RacePage({ params }: RacePageProps) {
    const { id } = use(params);
    const [race, setRace] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<Filter>("all");

    useEffect(() => {
        async function fetchRace() {
            try {
                const res = await fetch('/api/racing');
                const data = await res.json();
                if (data && data.data) {
                    const found = data.data.find((r: any) => r.id === id);
                    if (found) setRace(found);
                }
            } catch (error) {
                console.error("Failed to fetch race:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRace();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-neon-green font-mono-data text-sm tracking-widest uppercase animate-pulse">Loading Race Intel...</p>
            </div>
        );
    }

    if (!race) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-text-secondary">Race not found</p>
            </div>
        );
    }

    const filterLabels: { key: Filter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "banker", label: "🔥 Banker" },
        { key: "value", label: "💎 Value" },
        { key: "social", label: "🌐 Social" },
    ];

    const filteredHorses = race.horses.filter((h: any) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "banker") return h.signals.some((s: any) => s.type === "BANKER");
        if (activeFilter === "value") return h.signals.some((s: any) => s.type === "VALUE_BET");
        if (activeFilter === "social") return h.signals.some((s: any) => s.type === "SOCIAL_BUZZ" || s.type === "STEAMING");
        return true;
    });

    const topBanker = race.horses.find((h: any) => h.signals.some((s: any) => s.type === "BANKER"));
    const topValue = race.horses.find((h: any) => h.signals.some((s: any) => s.type === "VALUE_BET"));
    const topValueData = topValue ? getValueData(topValue.id) : null;

    return (
        <div className="animate-fade-in pb-28">
            {/* Back Header */}
            <header className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border bg-surface transition-colors hover:border-neon-green/30 active:scale-90"
                    >
                        <ArrowLeft className="h-4 w-4 text-muted-light" />
                    </Link>
                    <span className="text-sm font-medium text-text-secondary">
                        Back to Races
                    </span>
                </div>
            </header>

            {/* Race Hero */}
            <div className="relative mx-4 mt-2 overflow-hidden rounded-2xl border border-surface-border bg-surface">
                {/* Ambient glow */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-neon-green/8 blur-2xl" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.018] to-transparent" />

                <div className="relative p-4">
                    {/* Status row */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-green/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neon-green">
                            <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
                            Live Soon
                        </span>
                        {race.grade && (
                            <span className="rounded-lg border border-surface-border bg-terminal-bg px-2.5 py-1 text-[10px] font-bold text-muted-light tracking-wide">
                                {race.grade}
                            </span>
                        )}
                    </div>

                    {/* Time + Name */}
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-mono-data text-3xl font-bold text-text-primary">{race.time}</span>
                                <span className="text-muted-light text-sm">·</span>
                                <span className="font-mono-data text-sm text-muted-light">{race.distance}</span>
                            </div>
                            <h1 className="mt-1 text-sm font-bold text-neon-green">{race.name}</h1>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="flex items-center justify-end gap-1 text-[10px] text-muted-light">
                                <Users className="h-3 w-3" />
                                <span>{race.runners} Runners</span>
                            </div>
                            <div className="text-[10px] text-muted">{race.going}</div>
                        </div>
                    </div>

                    {/* Signals */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {race.topSignals?.map((signal: any, i: number) => (
                            <SignalBadge key={i} type={signal.type} label={signal.label} size="sm" />
                        ))}
                    </div>
                </div>

                {/* Quick Intelligence Strip */}
                {(topBanker || topValue) && (
                    <div className="border-t border-surface-border/50 grid grid-cols-2 divide-x divide-surface-border/50">
                        {topBanker && (
                            <div className="px-4 py-2.5">
                                <p className="text-[9px] uppercase tracking-wider text-muted">AI Banker</p>
                                <p className="text-xs font-bold text-neon-green truncate">{topBanker.name}</p>
                                <p className="font-mono-data text-sm font-bold text-text-primary">{topBanker.odds}</p>
                            </div>
                        )}
                        {topValue && topValueData && (
                            <div className="px-4 py-2.5">
                                <p className="text-[9px] uppercase tracking-wider text-muted">Top Value</p>
                                <p className="text-xs font-bold text-value-orange truncate">{topValue.name}</p>
                                <p className="font-mono-data text-xs text-muted-light">
                                    {topValue.odds} <span className="text-neon-green">→ {topValueData.modelOdds}</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* AI Race Preview injected here */}
            <AIRacePreview race={race} />

            {/* Filter Bar */}
            <div className="mt-4 px-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-light">
                        Runners & Betting
                    </h2>
                    <SlidersHorizontal className="h-3.5 w-3.5 text-muted" />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    {filterLabels.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveFilter(key)}
                            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${activeFilter === key
                                ? "bg-neon-green text-terminal-bg"
                                : "border border-surface-border bg-surface text-muted-light hover:text-text-primary"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Horse List */}
            <div className="space-y-2 px-4 pt-3">
                {filteredHorses.length > 0 ? (
                    filteredHorses.map((horse: any, idx: number) => (
                        <div
                            key={horse.id}
                            className="animate-slide-up"
                            style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
                        >
                            <HorseRow horse={horse} />
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center">
                        <p className="text-sm text-muted-light">No horses match this filter</p>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-16 mx-4 mt-6 flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface/80 py-3 text-sm font-semibold text-text-primary backdrop-blur-md transition-all hover:border-neon-green/30 active:scale-[0.98]">
                    <Share2 className="h-4 w-4" />
                    Share
                </button>
                <Link
                    href="/bets"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neon-green py-3 text-sm font-bold text-terminal-bg shadow-[0_0_20px_rgba(0,255,136,0.25)] transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] active:scale-[0.98]"
                >
                    <Zap className="h-4 w-4" />
                    Bet Slip
                </Link>
            </div>
        </div>
    );
}
