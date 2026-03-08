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
                ? "border-neon-green/30 shadow-[0_0_16px_rgba(0,255,136,0.06)]"
                : "border-surface-border"
                }`}
        >
            {/* Main Row — tap expands */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center gap-3 bg-surface px-3 py-3 text-left transition-colors hover:bg-surface-hover active:scale-[0.99]"
            >
                {/* Silk circle */}
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                    style={{ backgroundColor: horse.silkColor }}
                >
                    {horse.number}
                </div>

                {/* Horse name + jockey */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-text-primary truncate text-sm">
                            {horse.name}
                        </span>
                        {horse.aiRating >= 85 && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neon-green animate-pulse" />
                        )}
                    </div>
                    {/* Jockey + Trainer mini row */}
                    <p className="text-[10px] text-muted truncate">
                        {horse.jockey} · {horse.trainer}
                    </p>
                    {/* AI Rating + Crowd Pick — PRD requirement */}
                    <div className="mt-1 flex items-center gap-2">
                        <span className={`text-[9px] font-bold ${aiRatingColor}`}>
                            AI {horse.aiRating}
                        </span>
                        <span className="text-[9px] text-muted">·</span>
                        <span className="flex items-center gap-0.5 text-[9px] text-muted-light">
                            <Users className="h-2.5 w-2.5" />
                            {horse.crowdPickPercent}%
                        </span>
                        <span className="text-[9px] text-muted">·</span>
                        <span className="font-mono-data text-[9px] text-muted-light tracking-wide">
                            {horse.form}
                        </span>
                    </div>
                </div>

                {/* Odds badge */}
                <div className={`shrink-0 rounded-lg px-2.5 py-1.5 font-mono-data text-sm tabular-nums ${oddsColor}`}>
                    {horse.odds}
                </div>

                {/* Expand chevron */}
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${expanded ? "rotate-180 text-neon-green" : ""
                        }`}
                />
            </button>

            {/* Signal Badges row — always visible if signals exist */}
            {horse.signals.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-t border-surface-border/30 bg-surface/50 px-3 py-2">
                    {horse.signals.map((signal, i) => (
                        <SignalBadge key={i} type={signal.type} label={signal.label} size="sm" />
                    ))}
                    {/* Link to full profile */}
                    <Link
                        href={`/horses/${horse.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto flex items-center gap-1 rounded-full border border-neon-green/20 px-2 py-0.5 text-[9px] font-semibold text-neon-green transition-all hover:bg-neon-green/10"
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
