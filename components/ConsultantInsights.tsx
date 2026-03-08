"use client";

import Link from "next/link";
import { Horse } from "@/lib/types";
import ConfidenceGauge from "./ConfidenceGauge";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

interface ConsultantInsightsProps {
    horse: Horse;
}

export default function ConsultantInsights({ horse }: ConsultantInsightsProps) {
    const TrendIcon =
        horse.stats.trend === "up"
            ? TrendingUp
            : horse.stats.trend === "down"
                ? TrendingDown
                : Minus;
    const trendColor =
        horse.stats.trend === "up"
            ? "text-neon-green"
            : horse.stats.trend === "down"
                ? "text-risk-red"
                : "text-muted-light";

    return (
        <div className="animate-slide-up space-y-3 border-t border-surface-border/30 bg-terminal-bg-light/50 px-4 py-3">
            {/* Label */}
            <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-value-orange animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-value-orange">
                    Consultant Insights
                </span>
            </div>

            {/* Stats Row + Mini Gauge */}
            <div className="flex items-center gap-3">
                <div className="flex flex-1 gap-2">
                    <div className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-light">
                            Speed
                        </p>
                        <p className="text-lg font-bold text-neon-green">
                            {horse.stats.speed}
                            <span className="text-xs text-muted">/100</span>
                        </p>
                    </div>
                    <div className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-light">
                            Stamina
                        </p>
                        <p className="text-lg font-bold text-text-primary">
                            {horse.stats.stamina}
                        </p>
                    </div>
                    <div className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-light">
                            Trend
                        </p>
                        <div className="flex items-center justify-center pt-1">
                            <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                        </div>
                    </div>
                </div>
                {/* Mini Confidence Gauge */}
                <ConfidenceGauge score={horse.confidence} size="sm" />
            </div>

            {/* AI Quote */}
            <div className="rounded-lg border border-surface-border/50 bg-surface/50 p-3">
                <p className="text-xs italic leading-relaxed text-text-secondary">
                    &ldquo;{horse.aiInsight}&rdquo;
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <Link
                    href={`/horses/${horse.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 px-3 py-2 text-xs font-semibold text-neon-green transition-all hover:bg-neon-green/20"
                >
                    Full AI Report
                    <ArrowRight className="h-3 w-3" />
                </Link>
                <button className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-xs font-semibold text-text-primary transition-all hover:border-neon-green/30 hover:text-neon-green">
                    Track Profile
                </button>
            </div>
        </div>
    );
}
