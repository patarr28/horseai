"use client";

import { use } from "react";
import { getHorseById } from "@/lib/mock-data";
import { getValueData } from "@/lib/value-engine";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import AIVerdict from "@/components/AIVerdict";
import SignalBadge from "@/components/SignalBadge";
import {
    ArrowLeft,
    User,
    Award,
    TrendingUp,
    TrendingDown,
    Minus,
    Star,
} from "lucide-react";
import Link from "next/link";

interface HorsePageProps {
    params: Promise<{ horseId: string }>;
}

// Form bubble: colour-code each character
function FormBubbles({ form }: { form: string }) {
    const chars = form.split("");
    return (
        <div className="flex items-center gap-1 flex-wrap">
            {chars.map((ch, i) => {
                let bg = "bg-muted/30 text-muted-light";
                if (ch === "1") bg = "bg-neon-green text-terminal-bg";
                else if (ch === "2") bg = "bg-value-orange/80 text-terminal-bg";
                else if (ch === "3") bg = "bg-muted/50 text-text-secondary";
                else if (ch === "F" || ch === "U" || ch === "P") bg = "bg-risk-red/70 text-white";
                else if (ch === "-") return <span key={i} className="text-muted-light text-xs mx-0.5">|</span>;
                return (
                    <span
                        key={i}
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold font-mono-data ${bg}`}
                    >
                        {ch}
                    </span>
                );
            })}
        </div>
    );
}

export default function HorsePage({ params }: HorsePageProps) {
    const { horseId } = use(params);
    const result = getHorseById(horseId);

    if (!result) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-text-secondary">Horse not found</p>
            </div>
        );
    }

    const { horse, race } = result;
    const valueData = getValueData(horse.id);

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

    // Silk-tinted ambient bg
    const silkRgb = horse.silkColor;

    return (
        <div className="animate-fade-in pb-8">
            {/* Back Header */}
            <header className="flex items-center gap-3 px-4 pt-4 pb-2">
                <Link
                    href={`/races/${race.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border bg-surface transition-colors hover:border-neon-green/30 active:scale-90"
                >
                    <ArrowLeft className="h-4 w-4 text-muted-light" />
                </Link>
                <span className="text-sm font-medium text-text-secondary">
                    Back to {race.name}
                </span>
            </header>

            {/* ── Hero Card (silk-tinted) ── */}
            <div
                className="relative mx-4 mt-2 overflow-hidden rounded-2xl border border-surface-border"
                style={{
                    background: `linear-gradient(135deg, ${silkRgb}22 0%, #0f180f 55%, #080d08 100%)`,
                }}
            >
                {/* Ambient silk glow */}
                <div
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-50"
                    style={{ backgroundColor: silkRgb }}
                />

                <div className="relative p-5">
                    <div className="flex items-start gap-4">
                        {/* Silk — larger, glowing */}
                        <div
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-xl"
                            style={{
                                backgroundColor: silkRgb,
                                boxShadow: `0 0 20px ${silkRgb}55`,
                            }}
                        >
                            {horse.number}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-text-primary truncate">
                                    {horse.name}
                                </h1>
                                {horse.aiRating >= 85 && (
                                    <Star className="h-4 w-4 shrink-0 text-gold fill-gold" />
                                )}
                            </div>

                            {/* Form bubbles */}
                            <div className="mt-1.5">
                                <FormBubbles form={horse.form} />
                            </div>

                            {/* Signals */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {horse.signals.map((signal, i) => (
                                    <SignalBadge key={i} type={signal.type} label={signal.label} size="md" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Odds — prominent mono display */}
                    <div className="mt-4 flex items-center gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-light">Market Odds</p>
                            <p className="font-mono-data text-3xl font-bold text-neon-green text-glow-green">
                                {horse.odds}
                            </p>
                        </div>
                        {valueData.modelOdds !== "N/A" && (
                            <div className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-terminal-bg/60 px-3 py-2">
                                <div>
                                    <p className="text-[9px] uppercase tracking-wider text-muted">Model Price</p>
                                    <p className="font-mono-data text-sm font-bold text-value-orange">{valueData.modelOdds}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info grid */}
                <div className="border-t border-surface-border/40 grid grid-cols-2 divide-x divide-surface-border/40">
                    <div className="flex items-center gap-2 px-4 py-2.5">
                        <User className="h-3.5 w-3.5 text-neon-green shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-wider text-muted">Jockey</p>
                            <p className="text-xs font-semibold text-text-primary truncate">{horse.jockey}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5">
                        <Award className="h-3.5 w-3.5 text-value-orange shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-wider text-muted">Trainer</p>
                            <p className="text-xs font-semibold text-text-primary truncate">{horse.trainer}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5">
                        <span className="text-muted-light text-xs">⚖️</span>
                        <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted">Weight</p>
                            <p className="text-xs font-semibold text-text-primary">{horse.weight}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5">
                        <span className="text-muted-light text-xs">🐴</span>
                        <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted">Age</p>
                            <p className="text-xs font-semibold text-text-primary">{horse.age}yo</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Confidence + Quick Stats ── */}
            <div className="mx-4 mt-4 rounded-2xl border border-surface-border bg-surface p-5">
                <div className="flex items-center justify-center gap-8">
                    <ConfidenceGauge score={horse.confidence} size="lg" />
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-light">AI Rating</p>
                            <p className="font-mono-data text-2xl font-bold text-neon-green">
                                {horse.aiRating}<span className="text-xs text-muted font-normal">/100</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-light">OR Rating</p>
                            <p className="font-mono-data text-lg font-bold text-text-primary">{horse.rating}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-light">Trend</p>
                            <div className="flex items-center gap-1">
                                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                                <span className={`text-xs font-semibold capitalize ${trendColor}`}>
                                    {horse.stats.trend}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Track Record ── */}
            <div className="mx-4 mt-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-light">
                    Track Record
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: "Course", wins: horse.trackRecord.courseWins, runs: horse.trackRecord.courseRuns, color: "text-neon-green" },
                        { label: "Distance", wins: horse.trackRecord.distanceWins, runs: horse.trackRecord.distanceRuns, color: "text-value-orange" },
                        { label: "Going", wins: horse.trackRecord.goingWins, runs: horse.trackRecord.goingRuns, color: "text-text-primary" },
                    ].map(({ label, wins, runs, color }) => (
                        <div key={label} className="rounded-xl border border-surface-border bg-surface p-3 text-center">
                            <p className="text-[10px] uppercase tracking-wider text-muted-light">{label}</p>
                            <p className={`mt-1 font-mono-data text-xl font-bold ${color}`}>
                                {wins}<span className="text-xs text-muted font-normal">/{runs}</span>
                            </p>
                            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-terminal-bg">
                                <div
                                    className="h-full rounded-full bg-current opacity-60 transition-all duration-700"
                                    style={{ width: runs > 0 ? `${(wins / runs) * 100}%` : "0%", color: color.replace("text-", "") }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Recent Runs Table ── */}
            <div className="mx-4 mt-4">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-light">
                    Recent Runs
                </h3>
                <div className="overflow-hidden rounded-xl border border-surface-border">
                    {/* Table header */}
                    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-3 border-b border-surface-border bg-terminal-bg px-4 py-2">
                        <span className="text-[9px] uppercase tracking-wider text-muted">Pos</span>
                        <span className="text-[9px] uppercase tracking-wider text-muted">Course</span>
                        <span className="text-[9px] uppercase tracking-wider text-muted">Going</span>
                        <span className="text-[9px] uppercase tracking-wider text-muted">Odds</span>
                    </div>
                    {horse.recentRuns.map((run, i) => {
                        const isWin = run.position === "1st";
                        const isPlace = run.position === "2nd" || run.position === "3rd";
                        return (
                            <div
                                key={i}
                                className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-3 px-4 py-2.5 border-b border-surface-border/50 last:border-0 transition-colors ${isWin ? "bg-neon-green/5" : isPlace ? "bg-value-orange/3" : ""
                                    }`}
                            >
                                <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono-data text-[11px] font-bold ${isWin
                                            ? "bg-neon-green text-terminal-bg"
                                            : isPlace
                                                ? "bg-value-orange/20 text-value-orange"
                                                : "bg-surface-border text-muted-light"
                                        }`}
                                >
                                    {run.position.replace(/[a-z]/g, "")}
                                </span>
                                <div>
                                    <p className="text-xs font-semibold text-text-primary">{run.course}</p>
                                    <p className="text-[9px] text-muted">{run.distance} · {new Date(run.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                                </div>
                                <span className="text-[10px] text-muted-light whitespace-nowrap">{run.going.split(" ")[0]}</span>
                                <span className={`font-mono-data text-xs font-bold ${isWin ? "text-neon-green" : "text-text-secondary"}`}>
                                    {run.odds}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Sentiment + Crowd ── */}
            <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-surface-border bg-surface p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-light mb-2">Sentiment</p>
                    <div className="h-2 overflow-hidden rounded-full bg-terminal-bg">
                        <div className="flex h-full">
                            <div className="bg-neon-green" style={{ width: `${horse.sentiment.positive}%` }} />
                            <div className="bg-muted/50" style={{ width: `${horse.sentiment.neutral}%` }} />
                            <div className="bg-risk-red" style={{ width: `${horse.sentiment.negative}%` }} />
                        </div>
                    </div>
                    <div className="mt-1.5 flex justify-between text-[9px]">
                        <span className="text-neon-green font-semibold">{horse.sentiment.positive}%</span>
                        <span className="text-risk-red font-semibold">{horse.sentiment.negative}%</span>
                    </div>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-light mb-1">Crowd Pick</p>
                    <div className="flex items-end gap-1.5">
                        <p className="font-mono-data text-2xl font-bold text-neon-green">{horse.crowdPickPercent}%</p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-terminal-bg">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-green-dim"
                            style={{ width: `${horse.crowdPickPercent}%` }}
                        />
                    </div>
                    <p className="mt-1 text-[9px] text-muted">of users picking</p>
                </div>
            </div>

            {/* Social Mentions */}
            <div className="mx-4 mt-3 flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-social-blue text-base">🌐</span>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-light">Social Mentions</p>
                        <p className="font-mono-data text-lg font-bold text-social-blue">
                            {valueData.socialMentions.toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-muted-light">Last hour</p>
                    <p className="text-xs font-semibold text-neon-green">↑ Trending</p>
                </div>
            </div>

            {/* ── AI Verdict ── */}
            <div className="mx-4 mt-4">
                <AIVerdict horse={horse} />
            </div>
        </div>
    );
}
