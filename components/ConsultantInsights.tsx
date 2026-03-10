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
        <div className="animate-slide-up space-y-3 border-t border-white/[0.05] bg-black/40 backdrop-blur-xl px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            {/* Label */}
            <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-value-orange animate-pulse shadow-[0_0_6px_rgba(255,149,0,0.8)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-value-orange">
                    Consultant Insights
                </span>
            </div>

            {/* Stats Row + Mini Gauge */}
            <div className="flex items-center gap-3">
                <div className="flex flex-1 gap-2">
                    <div className="flex-1 rounded-lg border border-neon-green/15 bg-neon-green/[0.05] px-3 py-2 text-center shadow-[inset_0_1px_0_rgba(0,255,136,0.06)]">
                        <p className="text-[9px] uppercase tracking-wider text-muted-light font-bold">
                            Speed
                        </p>
                        <p className="text-lg font-black text-neon-green font-mono-data">
                            {horse.stats.speed}
                            <span className="text-[9px] text-neon-green/40 font-normal">/100</span>
                        </p>
                    </div>
                    <div className="flex-1 rounded-lg border border-surface-border/50 bg-surface/60 px-3 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <p className="text-[9px] uppercase tracking-wider text-muted-light font-bold">
                            Stamina
                        </p>
                        <p className="text-lg font-black text-text-primary font-mono-data">
                            {horse.stats.stamina}
                        </p>
                    </div>
                    <div className="flex-1 rounded-lg border border-surface-border/50 bg-surface/60 px-3 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <p className="text-[9px] uppercase tracking-wider text-muted-light font-bold">
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
                <div className="rounded-xl border border-value-orange/25 bg-value-orange/[0.06] p-3 space-y-2 shadow-[inset_0_1px_0_rgba(255,149,0,0.08),0_0_12px_rgba(255,149,0,0.05)]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Star className="h-3 w-3 text-value-orange fill-value-orange drop-shadow-[0_0_4px_rgba(255,149,0,0.6)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-value-orange">
                            Expert Consensus · {horse.tipsterPicks.length} tip{horse.tipsterPicks.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    {horse.tipsterPicks.map((pick, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg bg-black/20 p-2 border border-white/[0.03]">
                            <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-black tracking-widest shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${TIP_TYPE_COLORS[pick.tipType] || TIP_TYPE_COLORS.LONGSHOT}`}>
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
                            <span className={`ml-auto shrink-0 text-[9px] font-black ${CONFIDENCE_COLORS[pick.confidence]}`}>
                                {pick.confidence}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* AI Quote */}
            <div className="rounded-xl border border-white/[0.06] bg-black/30 backdrop-blur-sm p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs italic leading-relaxed text-text-secondary">
                    &ldquo;{horse.aiInsight}&rdquo;
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <Link
                    href={`/horses/${horse.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-neon-green/[0.08] border border-neon-green/25 px-3 py-2.5 text-xs font-black text-neon-green transition-all hover:bg-neon-green/15 active:scale-95 shadow-[inset_0_1px_0_rgba(0,255,136,0.08)]"
                >
                    Full AI Report
                    <ArrowRight className="h-3 w-3" />
                </Link>
                {horse.bestOdds ? (
                    <a
                        href={horse.bestOdds.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-xl bg-neon-green px-2 py-2.5 text-xs font-black text-terminal-bg shadow-[0_0_18px_rgba(0,255,136,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:shadow-[0_0_28px_rgba(0,255,136,0.5)] active:scale-95 flex items-center justify-center"
                    >
                        {horse.bestOdds.decimal.toFixed(2)} @ {horse.bestOdds.bookmaker}
                    </a>
                ) : (
                    <button className="flex-1 rounded-xl border border-surface-border/60 bg-surface/60 px-3 py-2.5 text-xs font-semibold text-text-primary transition-all hover:border-neon-green/30 hover:text-neon-green active:scale-95 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        Add to Horse Investigator Slip
                    </button>
                )}
            </div>
        </div>
    );
}
