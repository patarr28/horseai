"use client";

import Link from "next/link";
import { Race } from "@/lib/types";
import SignalBadge from "./SignalBadge";
import { Clock, Users, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

interface RaceCardProps {
    race: Race;
}

// Signal-colored left border
const signalBorderColor: Record<string, string> = {
    BANKER: "border-l-neon-green",
    VALUE_BET: "border-l-value-orange",
    STEAMING: "border-l-steaming-purple",
    PUNDIT_PICK: "border-l-social-blue",
    DRIFTING: "border-l-risk-red",
    SOCIAL_BUZZ: "border-l-value-orange",
    OVERHYPED: "border-l-risk-red",
    MARKET_MOVER: "border-l-steaming-purple",
};

const signalGlow: Record<string, string> = {
    BANKER: "hover:shadow-[0_0_24px_rgba(0,255,136,0.12)]",
    VALUE_BET: "hover:shadow-[0_0_24px_rgba(255,149,0,0.12)]",
    STEAMING: "hover:shadow-[0_0_24px_rgba(191,90,242,0.12)]",
    PUNDIT_PICK: "hover:shadow-[0_0_24px_rgba(29,161,242,0.12)]",
    DRIFTING: "hover:shadow-[0_0_24px_rgba(255,59,48,0.12)]",
};

export default function RaceCard({ race }: RaceCardProps) {
    const topSignal = race.topSignals[0]?.type ?? "SOCIAL_BUZZ";
    const borderColor = signalBorderColor[topSignal] ?? "border-l-surface-border";
    const glowClass = signalGlow[topSignal] ?? "";

    // Top horse odds for the card
    const topHorse = race.horses[0];

    return (
        <Link href={`/races/${race.id}`} className="group block">
            <div
                className={`relative overflow-hidden rounded-2xl border border-surface-border border-l-4 ${borderColor} bg-surface transition-all duration-300 ${glowClass} hover:border-surface-border-bright active:scale-[0.98]`}
            >
                {/* Subtle gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />

                {/* Race Header */}
                <div className="relative p-4 pb-3">
                    {/* Status + Grade row */}
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {race.status === "upcoming" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-neon-green/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neon-green">
                                    <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
                                    Live Soon
                                </span>
                            )}
                            {race.status === "live" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-risk-red/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-risk-red">
                                    <span className="h-1.5 w-1.5 rounded-full bg-risk-red animate-pulse" />
                                    LIVE
                                </span>
                            )}
                        </div>
                        {race.grade && (
                            <span className="rounded-md border border-surface-border bg-terminal-bg px-2 py-0.5 text-[10px] font-bold text-muted-light">
                                {race.grade}
                            </span>
                        )}
                    </div>

                    {/* Time + Name + Meta */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                                <span className="font-mono-data text-2xl font-bold text-text-primary">
                                    {race.time}
                                </span>
                                {topHorse && (
                                    <span className="flex items-center gap-0.5 font-mono-data text-xs font-semibold text-neon-green">
                                        <TrendingUp className="h-3 w-3" />
                                        {topHorse.odds}
                                    </span>
                                )}
                            </div>
                            <h3 className="mt-0.5 text-sm font-bold text-text-primary truncate">
                                {race.name}
                            </h3>
                        </div>

                        {/* Meta right */}
                        <div className="shrink-0 text-right space-y-0.5">
                            <div className="flex items-center justify-end gap-1 text-[10px] text-muted-light">
                                <Clock className="h-3 w-3" />
                                <span className="font-mono-data">{race.distance}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1 text-[10px] text-muted-light">
                                <Users className="h-3 w-3" />
                                <span>{race.runners} Runners</span>
                            </div>
                            <p className="text-[10px] text-muted">{race.going}</p>
                        </div>
                    </div>
                </div>

                {/* Signal Pills */}
                <div className="flex flex-wrap gap-1.5 border-t border-surface-border/40 px-4 py-3">
                    {race.topSignals.map((signal, i) => (
                        <SignalBadge key={i} type={signal.type} label={signal.label} size="sm" />
                    ))}
                </div>

                {/* Go Arrow on hover */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                    <ChevronRight className="h-5 w-5 text-neon-green" />
                </div>
            </div>
        </Link>
    );
}
