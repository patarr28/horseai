"use client";

import Link from "next/link";
import { Horse } from "@/lib/types";
import ConfidenceGauge from "./ConfidenceGauge";
import { TrendingUp, TrendingDown, Minus, ArrowRight, Star } from "lucide-react";

const TIP_TYPE_COLORS: Record<string, string> = {
    NAP: "text-neon-green border-neon-green/40 bg-neon-green/10",
    NB: "text-value-orange border-value-orange/40 bg-value-orange/10",
    VALUE: "text-sky-400 border-sky-400/40 bg-sky-400/10",
    EACH_WAY: "text-purple-400 border-purple-400/40 bg-purple-400/10",
    LONGSHOT: "text-muted-light border-surface-border bg-surface",
};

const CONFIDENCE_COLORS: Record<string, string> = {
    HIGH: "text-neon-green",
    MEDIUM: "text-value-orange",
    LOW: "text-muted-light",
};

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

            {/* Expert Tipster Consensus */}
            {horse.tipsterPicks && horse.tipsterPicks.length > 0 && (
                <div className="rounded-lg border border-value-orange/20 bg-value-orange/5 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Star className="h-3 w-3 text-value-orange fill-value-orange" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-value-orange">
                            Expert Consensus · {horse.tipsterPicks.length} tip{horse.tipsterPicks.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    {horse.tipsterPicks.map((pick, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-black tracking-widest ${TIP_TYPE_COLORS[pick.tipType] || TIP_TYPE_COLORS.LONGSHOT}`}>
                                {pick.tipType}
                            </span>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-text-primary leading-none">
                                    {pick.tipsterName}
                                    <span className="ml-1 font-normal text-muted-light">· {pick.publication}</span>
                                </p>
                                {pick.reasoning && (
                                    <p className="mt-0.5 text-[10px] italic text-text-secondary leading-tight">
                                        &ldquo;{pick.reasoning}&rdquo;
                                    </p>
                                )}
                            </div>
                            <span className={`ml-auto shrink-0 text-[9px] font-bold ${CONFIDENCE_COLORS[pick.confidence]}`}>
                                {pick.confidence}
                            </span>
                        </div>
                    ))}
                </div>
            )}

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
                {horse.bestOdds ? (
                    <a
                        href={horse.bestOdds.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-lg bg-neon-green px-2 py-2 text-xs font-bold text-terminal-bg shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all hover:shadow-[0_0_25px_rgba(0,255,136,0.5)] flex items-center justify-center"
                    >
                        {horse.bestOdds.decimal.toFixed(2)} @ {horse.bestOdds.bookmaker}
                    </a>
                ) : (
                    <button className="flex-1 rounded-lg border border-surface-border bg-surface px-3 py-2 text-xs font-semibold text-text-primary transition-all hover:border-neon-green/30 hover:text-neon-green">
                        Add to Horse Investigator Slip
                    </button>
                )}
            </div>
        </div>
    );
}
