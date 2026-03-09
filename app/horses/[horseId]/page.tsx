"use client";

import { use, useState, useEffect } from "react";
import { getValueData } from "@/lib/value-engine";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import AIVerdict from "@/components/AIVerdict";
import SignalBadge from "@/components/SignalBadge";
import ShareButton from "@/components/ShareButton";
import {
    ChevronLeft,
    User,
    Award,
    TrendingUp,
    TrendingDown,
    Minus,
    Star,
    Sparkles,
    Zap,
    Users,
} from "lucide-react";

const TIP_TYPE_COLORS: Record<string, string> = {
    NAP: "text-neon-green border-neon-green/40 bg-neon-green/10",
    NB: "text-value-orange border-value-orange/40 bg-value-orange/10",
    VALUE: "text-sky-400 border-sky-400/40 bg-sky-400/10",
    EACH_WAY: "text-purple-400 border-purple-400/40 bg-purple-400/10",
    LONGSHOT: "text-muted-light border-surface-border bg-surface",
};

const CONFIDENCE_DOT: Record<string, string> = {
    HIGH: "bg-neon-green",
    MEDIUM: "bg-value-orange",
    LOW: "bg-muted-light",
};
import Link from "next/link";
import NextImage from "next/image";
import { TipsterPick } from "@/lib/types";

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
    const [result, setResult] = useState<{ horse: any; race: any } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHorse() {
            try {
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

                let foundResult = null;
                for (const race of allDaysRaces) {
                    const horse = race.horses.find((h: any) => h.id === horseId);
                    if (horse) {
                        foundResult = { horse, race };
                        break;
                    }
                }

                setResult(foundResult);
            } catch (error) {
                console.error("Failed to fetch horse:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchHorse();
    }, [horseId]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-neon-green font-mono-data text-sm tracking-widest uppercase animate-pulse">Loading API Data...</p>
            </div>
        );
    }

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

    const silkRgb = horse.silkColor;

    return (
        <div className="animate-fade-in pb-8">
            <header className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/races/${race.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border bg-surface transition-colors hover:border-neon-green/30 active:scale-90"
                    >
                        <ChevronLeft className="h-4 w-4 text-muted-light" />
                    </Link>
                    <span className="text-sm font-medium text-text-secondary">
                        Back to {race.name}
                    </span>
                </div>
                <ShareButton
                    title={`Horse Intel: ${horse.name}`}
                    text={`Check out the AI Analysis for ${horse.name} at the Festival!`}
                    size="sm"
                    variant="outline"
                />
            </header>

            <div
                className="relative mx-4 mt-2 overflow-hidden rounded-2xl border border-surface-border"
                style={{
                    background: `linear-gradient(135deg, ${silkRgb}22 0%, #0f180f 55%, #080d08 100%)`,
                }}
            >
                <div
                    className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl opacity-30"
                    style={{ backgroundColor: silkRgb }}
                />

                <div className="relative p-5">
                    <div className="flex items-start gap-4">
                        <div className="relative">
                            <div
                                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl overflow-hidden bg-terminal-bg border border-white/10 shadow-xl"
                                style={{ boxShadow: `0 0 20px ${silkRgb}33` }}
                            >
                                {horse.silkUrl ? (
                                    <NextImage
                                        src={horse.silkUrl}
                                        alt="Silks"
                                        width={64}
                                        height={64}
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full" style={{ backgroundColor: silkRgb }} />
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-surface-border font-mono-data text-[10px] font-bold text-text-primary">
                                {horse.number}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-text-primary tracking-tight truncate">
                                    {horse.name}
                                </h1>
                                {horse.aiRating >= 85 && (
                                    <Star className="h-5 w-5 shrink-0 text-gold fill-gold animate-pulse" />
                                )}
                            </div>
                            <p className="text-[10px] text-muted-light uppercase tracking-[0.2em] font-bold mt-0.5 opacity-70">
                                {horse.trainer} • {horse.age}yo {horse.weight}
                            </p>
                            <div className="mt-3">
                                <FormBubbles form={horse.form} />
                            </div>
                        </div>

                        {horse.jockeyUrl && (
                            <div className="shrink-0 group">
                                <div className="relative h-14 w-14 rounded-full border-2 border-neon-green/30 overflow-hidden bg-surface-border transition-transform group-hover:scale-110">
                                    <NextImage
                                        src={horse.jockeyUrl}
                                        alt={horse.jockey}
                                        width={56}
                                        height={56}
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all"
                                    />
                                </div>
                                <p className="text-[8px] mt-1 text-center font-bold text-muted-light uppercase tracking-tighter opacity-60">
                                    {horse.jockey.split(' ').pop()}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-end justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-light mb-1">Live Market</p>
                                <p className="font-mono-data text-4xl font-black text-neon-green text-glow-green">
                                    {horse.odds}
                                </p>
                            </div>
                            {valueData.modelOdds !== "N/A" && (
                                <div className="mb-1 rounded-lg border border-value-orange/20 bg-value-orange/5 px-2.5 py-1.5">
                                    <p className="text-[8px] uppercase tracking-widest text-value-orange/80 font-bold">AI Fair Value</p>
                                    <p className="font-mono-data text-sm font-bold text-value-orange leading-none mt-0.5">{valueData.modelOdds}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5">
                                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${trendColor}`}>
                                    {horse.stats.trend}
                                </span>
                            </div>
                            <div className="mt-2 flex gap-1">
                                {horse.signals.slice(0, 2).map((signal: any, i: number) => (
                                    <SignalBadge key={i} type={signal.type} label={signal.label} size="sm" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {horse.plainEnglishInsights && (
                <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-neon-green/20 bg-neon-green/5">
                    <div className="flex items-center gap-1.5 bg-neon-green/10 px-4 py-2 text-neon-green">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Festival Whisperer Insights</span>
                    </div>
                    <div className="p-4 space-y-3">
                        {horse.plainEnglishInsights.map((insight: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
                                <p className="text-sm font-medium text-text-primary leading-relaxed italic">
                                    "{insight}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Expert Tipster Consensus Panel */}
            {horse.tipsterPicks && horse.tipsterPicks.length > 0 && (
                <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-value-orange/25 bg-value-orange/5">
                    <div className="flex items-center gap-2 bg-value-orange/10 px-4 py-2.5">
                        <Users className="h-3.5 w-3.5 text-value-orange" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-value-orange">
                            Expert Consensus
                        </span>
                        <span className="ml-auto rounded-full bg-value-orange/20 px-2 py-0.5 text-[9px] font-bold text-value-orange">
                            {horse.tipsterPicks.length} tip{horse.tipsterPicks.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="divide-y divide-value-orange/10">
                        {horse.tipsterPicks.map((pick: TipsterPick, i: number) => (
                            <div key={i} className="flex items-start gap-3 px-4 py-3">
                                {/* Tip type badge */}
                                <span className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-black tracking-widest ${TIP_TYPE_COLORS[pick.tipType] || TIP_TYPE_COLORS.LONGSHOT}`}>
                                    {pick.tipType}
                                </span>
                                {/* Tipster info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-text-primary leading-tight">
                                        {pick.tipsterName}
                                    </p>
                                    <p className="text-[10px] text-muted-light">{pick.publication}</p>
                                    {pick.reasoning && (
                                        <p className="mt-1 text-[11px] italic text-text-secondary leading-relaxed">
                                            &ldquo;{pick.reasoning}&rdquo;
                                        </p>
                                    )}
                                </div>
                                {/* Confidence dot */}
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                    <div className={`h-2 w-2 rounded-full ${CONFIDENCE_DOT[pick.confidence] || CONFIDENCE_DOT.LOW}`} />
                                    <span className="text-[8px] font-bold uppercase text-muted-light">{pick.confidence}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-surface-border bg-surface p-4 flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-[-20%] right-[-10%] opacity-10">
                        <TrendingUp className="h-16 w-16 text-neon-green" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-light mb-4">Speed Index</p>
                        <div className="flex items-baseline gap-1">
                            <span className="font-mono-data text-4xl font-black text-text-primary">{horse.stats.speed}</span>
                            <span className="text-xs text-neon-green font-bold">/100</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-surface-border/50">
                        <p className="text-[9px] text-muted-light font-bold uppercase tracking-tighter mb-1">Course Sync</p>
                        <p className="text-[10px] text-text-secondary leading-tight">
                            Calculated for <span className="text-neon-green font-mono">{race.distance}</span> trip.
                            {horse.stats.fastestMileTime && (
                                <> Fastest mile: <span className="text-text-primary font-mono">{horse.stats.fastestMileTime}</span></>
                            )}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-surface-border bg-surface p-4 flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-[-20%] right-[-10%] opacity-10">
                        <Zap className="h-16 w-16 text-value-orange" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-light mb-4">Stamina Profile</p>
                        <p className={`font-black text-2xl uppercase tracking-tighter ${horse.stats.stamina === "Elite" ? "text-value-orange text-glow-orange" : "text-text-primary"}`}>
                            {horse.stats.stamina}
                        </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-surface-border/50">
                        <p className="text-[9px] text-muted-light font-bold uppercase tracking-tighter mb-1">Stay-Ability</p>
                        <p className="text-[10px] text-text-secondary leading-tight">
                            Rating based on <span className="text-value-orange font-bold">{race.going}</span> conditions.
                            {horse.trackRecord.distanceWins > 0 ? ` Proved at distance.` : ` Unproven at trip.`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-4 mt-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-light">
                        Combat History (Last 3)
                    </h3>
                    <div className="h-px flex-1 bg-surface-border ml-4" />
                </div>
                <div className="space-y-2">
                    {horse.recentRuns.slice(0, 3).map((run: any, i: number) => {
                        const isWin = run.position === "1st";
                        const isPlace = run.position === "2nd" || run.position === "3rd";
                        return (
                            <div
                                key={i}
                                className={`group flex items-center gap-4 rounded-xl border border-surface-border p-3 transition-colors hover:bg-surface-border/20 ${isWin ? "bg-neon-green/5 border-neon-green/20" : isPlace ? "bg-value-orange/5 border-value-orange/20" : "bg-surface/50"}`}
                            >
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono-data text-lg font-black shadow-inner ${isWin ? "bg-neon-green text-terminal-bg" : isPlace ? "bg-value-orange text-terminal-bg" : "bg-terminal-bg text-muted"}`}>
                                    {run.position.replace(/[a-z]/g, "")}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-text-primary truncate">{run.course}</p>
                                        <p className="font-mono-data text-xs font-bold text-text-secondary">{run.odds}</p>
                                    </div>
                                    <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted font-medium">
                                        <span>{run.distance} • {run.going}</span>
                                        <span className="opacity-60">{new Date(run.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mx-4 mt-8">
                <div className="rounded-2xl border-2 border-neon-green bg-terminal-bg p-6 shadow-[0_0_30px_rgba(0,255,136,0.1)] relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20" style={{ backgroundSize: '100% 2px, 3px 100%' }} />
                    <div className="relative z-10">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-neon-green animate-ping" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-green">Algorithmic Final Verdict</h4>
                        </div>
                        <p className="font-mono text-sm leading-relaxed text-text-primary mb-6">
                            <span className="text-neon-green font-bold mr-2">&gt;</span>
                            {horse.aiVerdict}
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h5 className="text-[9px] font-black uppercase tracking-widest text-neon-green/60 mb-3 underline decoration-neon-green/30 underline-offset-4">Primary Strengths</h5>
                                <ul className="space-y-2">
                                    {horse.pros.map((pro: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs font-medium text-text-secondary">
                                            <span className="text-neon-green mt-0.5 text-[8px]">●</span> {pro}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-[9px] font-black uppercase tracking-widest text-risk-red/60 mb-3 underline decoration-risk-red/30 underline-offset-4">Risk Factors</h5>
                                <ul className="space-y-2">
                                    {horse.cons.map((con: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs font-medium text-text-secondary">
                                            <span className="text-risk-red mt-0.5 text-[8px]">●</span> {con}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center justify-between pt-6 border-t border-neon-green/10">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-muted-light mb-1">Confidence</p>
                                    <p className="font-mono-data text-2xl font-black text-neon-green">{horse.confidence}%</p>
                                </div>
                                <div className="h-10 w-px bg-neon-green/10" />
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-muted-light mb-1">AI Rank</p>
                                    <p className="font-mono-data text-2xl font-black text-text-primary">#{horse.number}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <ShareButton
                                    title={`Pro Analysis: ${horse.name}`}
                                    text={`I'm tracking ${horse.name} using the Investigator Slip. Check this AI rating: ${horse.aiRating}`}
                                    variant="outline"
                                />
                                <button className="rounded-lg bg-neon-green px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-terminal-bg shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-transform hover:scale-105 active:scale-95">
                                    Add to Horse Investigator Slip
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
