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
import ShareButton from "@/components/ShareButton";

interface RacePageProps {
    params: Promise<{ id: string }>;
}

type Filter = "all" | "banker" | "value" | "experts" | "favs" | "longshots" | "ai";

export default function RacePage({ params }: RacePageProps) {
    const { id } = use(params);
    const [race, setRace] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<Filter>("all");

    useEffect(() => {
        async function fetchRace() {
            try {
                // We must search across all 4 days of the festival as the race could be on any day
                const FESTIVAL_DAYS = [
                    "2026-03-10",
                    "2026-03-11",
                    "2026-03-12",
                    "2026-03-13",
                ];

                const promises = FESTIVAL_DAYS.map(async (date) => {
                    const res = await fetch(`/api/racing?date=${date}`);
                    const data = await res.json();
                    return data.data || [];
                });

                const allDaysRaces = (await Promise.all(promises)).flat();
                const found = allDaysRaces.find((r: any) => r.id === id);

                if (found) {
                    setRace(found);
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
        { key: "favs", label: "📉 Favs" },
        { key: "longshots", label: "🚀 Longshots" },
        { key: "ai", label: "🧠 Top AI" },
        { key: "banker", label: "🔥 Banker" },
        { key: "value", label: "💎 Value" },
        { key: "experts", label: "🎯 Experts" },
    ];

    let filteredHorses = [...race.horses];

    switch (activeFilter) {
        case "banker":
            filteredHorses = filteredHorses.filter((h: any) => h.signals.some((s: any) => s.type === "BANKER"));
            break;
        case "value":
            filteredHorses = filteredHorses.filter((h: any) => h.signals.some((s: any) => s.type === "VALUE_BET"));
            break;
        case "experts":
            filteredHorses = filteredHorses.filter((h: any) => h.signals.some((s: any) => s.type === "EXPERT_TIP"));
            break;
        case "longshots":
            filteredHorses = filteredHorses.filter((h: any) => h.oddsDecimal >= 10.0).sort((a: any, b: any) => (b.oddsDecimal || 0) - (a.oddsDecimal || 0));
            break;
        case "favs":
            filteredHorses.sort((a: any, b: any) => (a.oddsDecimal || 999) - (b.oddsDecimal || 999));
            break;
        case "ai":
            filteredHorses.sort((a: any, b: any) => (b.aiRating || 0) - (a.aiRating || 0));
            break;
        case "all":
        default:
            break;
    }

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
                <ShareButton
                    title={`Race Intel: ${race.name}`}
                    text={`Check out the pro AI analysis for the ${race.name} and the runners!`}
                    size="sm"
                    variant="outline"
                />
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
                <ShareButton
                    title={`Race Analysis: ${race.name}`}
                    text={`I'm checking the ${race.name} on the Investigator Slip. Join the intel hunt!`}
                    className="flex-1 py-3"
                    size="lg"
                />
                <Link
                    href="/investigator-slip"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neon-green py-3 text-sm font-bold text-terminal-bg shadow-[0_0_20px_rgba(0,255,136,0.25)] transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] active:scale-[0.98]"
                >
                    <Zap className="h-4 w-4" />
                    Investigator Slip
                </Link>
            </div>
        </div>
    );
}
