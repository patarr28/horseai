"use client";

import { useState } from "react";
import { Horse } from "@/lib/types";
import SignalBadge from "./SignalBadge";
import ConsultantInsights from "./ConsultantInsights";
import Link from "next/link";
import { ChevronDown, Users } from "lucide-react";

interface HorseRowProps {
    horse: Horse;
}

export default function HorseRow({ horse }: HorseRowProps) {
    const [expanded, setExpanded] = useState(false);

    const oddsColor =
        horse.oddsDecimal <= 3
            ? "bg-neon-green text-terminal-bg font-bold"
            : horse.oddsDecimal <= 6
                ? "bg-neon-green/15 text-neon-green border border-neon-green/30"
                : "bg-surface-border/50 text-text-secondary border border-surface-border";

    const aiRatingColor =
        horse.aiRating >= 85
            ? "text-neon-green"
            : horse.aiRating >= 70
                ? "text-value-orange"
                : "text-muted-light";

    return (
        <div
            className={`overflow-hidden rounded-xl border transition-all duration-300 ${expanded
                ? "border-neon-green/25 shadow-[0_0_20px_rgba(0,255,136,0.08),inset_0_1px_0_rgba(0,255,136,0.06)] glass-water"
                : "border-surface-border/60 bg-surface"
                }`}
        >
            {/* Main Row — tap expands */}
            <button
                onClick={() => setExpanded(!expanded)}
                className={`flex w-full items-center gap-3 px-3 py-3 text-left min-h-[56px] transition-all duration-200 active:brightness-90 active:scale-[0.99] ${expanded ? "bg-transparent" : "bg-surface hover:bg-surface-hover"}`}
            >
                {/* Silk circle — liquid drop shadow */}
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                    style={{
                        backgroundColor: horse.silkColor,
                        boxShadow: `0 2px 12px ${horse.silkColor}55, 0 0 0 1px rgba(255,255,255,0.1)`,
                    }}
                >
                    {horse.number}
                </div>

                {/* Horse name + jockey */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-text-primary truncate text-sm leading-tight">
                            {horse.name}
                        </span>
                        {horse.aiRating >= 85 && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neon-green shadow-[0_0_6px_rgba(0,255,136,0.8)] animate-pulse" />
                        )}
                    </div>
                    <p className="text-[10px] text-muted truncate mt-0.5">
                        {horse.jockey} · {horse.trainer}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                        <span className={`text-[9px] font-black ${aiRatingColor}`}>
                            AI {horse.aiRating}
                        </span>
                        <span className="text-[9px] text-surface-border/80">·</span>
                        <span className="flex items-center gap-0.5 text-[9px] text-muted-light">
                            <Users className="h-2.5 w-2.5" />
                            {horse.crowdPickPercent}%
                        </span>
                        <span className="text-[9px] text-surface-border/80">·</span>
                        <span className="font-mono-data text-[9px] text-muted-light/70 tracking-wide">
                            {horse.form}
                        </span>
                    </div>
                </div>

                {/* Odds badge — liquid glass */}
                <div className={`shrink-0 rounded-lg px-2.5 py-1.5 font-mono-data text-sm font-bold tabular-nums leading-none ${oddsColor} shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}>
                    {horse.odds}
                </div>

                {/* Expand chevron */}
                <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-all duration-300 ${expanded
                        ? "rotate-180 text-neon-green drop-shadow-[0_0_4px_rgba(0,255,136,0.6)]"
                        : "text-muted"
                        }`}
                />
            </button>

            {/* Signal Badges row */}
            {horse.signals.length > 0 && (
                <div className={`flex flex-wrap gap-1.5 border-t px-3 py-2 ${expanded ? "border-neon-green/10 bg-neon-green/[0.02]" : "border-surface-border/30 bg-surface/50"}`}>
                    {horse.signals.map((signal, i) => (
                        <SignalBadge key={i} type={signal.type} label={signal.label} size="sm" />
                    ))}
                    <Link
                        href={`/horses/${horse.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto flex items-center gap-1 rounded-full border border-neon-green/20 bg-neon-green/5 px-2.5 py-1 text-[9px] font-bold text-neon-green transition-all hover:bg-neon-green/10 active:scale-95 shadow-[inset_0_1px_0_rgba(0,255,136,0.08)]"
                    >
                        Full AI Report →
                    </Link>
                </div>
            )}

            {/* Expanded Consultant Insights */}
            {expanded && <ConsultantInsights horse={horse} />}
        </div>
    );
}
