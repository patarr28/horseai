"use client";

import { useState, useEffect } from "react";
import { getValueBets, getSocialTrending } from "@/lib/value-engine";
import SignalBadge from "@/components/SignalBadge";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import Link from "next/link";
import {
    Radar,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowRight,
    Flame,
    AlertTriangle,
    Loader2
} from "lucide-react";
import { Race } from "@/lib/types";

type Tab = "value" | "social";

export default function InsightsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("value");
    const [races, setRaces] = useState<Race[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRaces() {
            try {
                const res = await fetch("/api/racing");
                const data = await res.json();
                setRaces(data.data || []);
            } catch (error) {
                console.error("Failed to fetch races:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRaces();
    }, []);

    const valueBets = getValueBets(races);
    const socialTrending = getSocialTrending(races);

    const valuePicks = valueBets.filter((vb) => vb.edge > 0);
    const overhypedPicks = valueBets.filter((vb) => vb.edge < -20);

    return (
        <div className="animate-fade-in pb-24">
            {/* Header */}
            <header className="px-4 pt-4 pb-3">
                <div className="flex gap-2 items-center">
                    <h1 className="text-xl font-bold text-text-primary">Insights</h1>
                    <span className="flex h-5 items-center rounded-sm bg-risk-red px-1.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-[0_0_8px_rgba(255,51,102,0.6)] animate-pulse">
                        LIVE DATA
                    </span>
                </div>
                <p className="text-xs text-muted-light">
                    AI-driven live market intelligence
                </p>
            </header>

            {loading ? (
                <div className="mt-24 flex flex-col items-center justify-center space-y-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-neon-green/10 border border-neon-green/30">
                        <Loader2 className="h-6 w-6 animate-spin text-neon-green" />
                        <div className="absolute inset-0 rounded-xl animate-pulse-glow" />
                    </div>
                    <p className="font-mono-data text-sm font-bold tracking-widest text-neon-green uppercase">
                        Fetching Live Signals
                    </p>
                    <p className="text-xs text-muted-light">Analyzing market drift and social buzz...</p>
                </div>
            ) : (
                <>

                    {/* Tab Switcher */}
                    <div className="mx-4 flex gap-1 rounded-xl border border-surface-border bg-surface p-1">
                        <button
                            onClick={() => setActiveTab("value")}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all ${activeTab === "value"
                                ? "bg-neon-green text-terminal-bg"
                                : "text-muted-light hover:text-text-primary"
                                }`}
                        >
                            <Radar className="h-3.5 w-3.5" />
                            Value Radar
                        </button>
                        <button
                            onClick={() => setActiveTab("social")}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all ${activeTab === "social"
                                ? "bg-neon-green text-terminal-bg"
                                : "text-muted-light hover:text-text-primary"
                                }`}
                        >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Social Pulse
                        </button>
                    </div>

                    {/* VALUE RADAR TAB */}
                    {activeTab === "value" && (
                        <div className="animate-fade-in mt-4 space-y-4 px-4">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-3 text-center">
                                    <p className="text-2xl font-bold text-neon-green">
                                        {valuePicks.length}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-light">
                                        Value Bets
                                    </p>
                                </div>
                                <div className="rounded-xl border border-risk-red/20 bg-risk-red/5 p-3 text-center">
                                    <p className="text-2xl font-bold text-risk-red">
                                        {overhypedPicks.length}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-light">
                                        Overhyped
                                    </p>
                                </div>
                                <div className="rounded-xl border border-surface-border bg-surface p-3 text-center">
                                    <p className="text-2xl font-bold text-text-primary">
                                        {races.reduce((acc, r) => acc + r.horses.length, 0)}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-light">
                                        Runners
                                    </p>
                                </div>
                            </div>

                            {/* Value Bets Section */}
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <Flame className="h-4 w-4 text-neon-green" />
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-neon-green">
                                        Best Value Bets
                                    </h2>
                                </div>
                                <div className="space-y-2">
                                    {valuePicks.map((vb) => (
                                        <Link
                                            key={vb.horse.id}
                                            href={`/horses/${vb.horse.id}`}
                                            className="block rounded-xl border border-neon-green/10 bg-surface p-4 transition-all hover:border-neon-green/30 active:scale-[0.98]"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                                                        style={{ backgroundColor: vb.horse.silkColor }}
                                                    >
                                                        {vb.horse.number}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-text-primary truncate">
                                                            {vb.horse.name}
                                                        </p>
                                                        <p className="text-[10px] text-muted">
                                                            {vb.race.time} · {vb.race.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-xs text-muted line-through">
                                                                {vb.horse.odds}
                                                            </span>
                                                            <span className="text-sm font-bold text-neon-green">
                                                                {vb.modelOddsDisplay}
                                                            </span>
                                                        </div>
                                                        <span className="rounded bg-neon-green/10 px-1.5 py-0.5 text-[10px] font-bold text-neon-green">
                                                            +{vb.edge}% EDGE
                                                        </span>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-muted-light" />
                                                </div>
                                            </div>
                                            {/* Value Bar */}
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 rounded-full bg-terminal-bg overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-neon-green/50 to-neon-green transition-all"
                                                        style={{
                                                            width: `${Math.min(100, Math.max(10, vb.edge))}%`,
                                                        }}
                                                    />
                                                </div>
                                                <ConfidenceGauge
                                                    score={vb.horse.confidence}
                                                    size="sm"
                                                />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Overhyped Section */}
                            {overhypedPicks.length > 0 && (
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-risk-red" />
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-risk-red">
                                            Overhyped — Avoid
                                        </h2>
                                    </div>
                                    <div className="space-y-2">
                                        {overhypedPicks.map((vb) => (
                                            <Link
                                                key={vb.horse.id}
                                                href={`/horses/${vb.horse.id}`}
                                                className="block rounded-xl border border-risk-red/10 bg-surface p-4 transition-all hover:border-risk-red/30 active:scale-[0.98]"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div
                                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                                                            style={{ backgroundColor: vb.horse.silkColor }}
                                                        >
                                                            {vb.horse.number}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-text-primary truncate">
                                                                {vb.horse.name}
                                                            </p>
                                                            <p className="text-[10px] text-muted">
                                                                {vb.race.time} · {vb.race.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-sm font-bold text-risk-red">
                                                                {vb.horse.odds}
                                                            </span>
                                                            <span className="text-xs text-muted">
                                                                → {vb.modelOddsDisplay}
                                                            </span>
                                                        </div>
                                                        <span className="rounded bg-risk-red/10 px-1.5 py-0.5 text-[10px] font-bold text-risk-red">
                                                            {vb.edge}% OVERBET
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SOCIAL PULSE TAB */}
                    {activeTab === "social" && (
                        <div className="animate-fade-in mt-4 space-y-4 px-4">
                            {/* Social Summary */}
                            <div className="rounded-xl border border-surface-border bg-surface p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-light">
                                            Total Mentions
                                        </p>
                                        <p className="text-3xl font-bold text-neon-green">
                                            {socialTrending
                                                .reduce((acc, s) => acc + s.mentions, 0)
                                                .toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-light">
                                            Last Hour
                                        </p>
                                        <p className="text-sm text-value-orange font-semibold">
                                            Trending ↑ 24%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Trending Horses */}
                            <div>
                                <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-light">
                                    Trending on X / Social
                                </h2>
                                <div className="space-y-2">
                                    {socialTrending.slice(0, 12).map((item, idx) => {
                                        const TrendIcon =
                                            item.trend === "up"
                                                ? TrendingUp
                                                : item.trend === "down"
                                                    ? TrendingDown
                                                    : Minus;
                                        const trendColor =
                                            item.trend === "up"
                                                ? "text-neon-green"
                                                : item.trend === "down"
                                                    ? "text-risk-red"
                                                    : "text-muted-light";
                                        const sentimentColor =
                                            item.sentimentScore > 50
                                                ? "text-neon-green"
                                                : item.sentimentScore > 20
                                                    ? "text-value-orange"
                                                    : "text-risk-red";

                                        return (
                                            <Link
                                                key={item.horse.id}
                                                href={`/horses/${item.horse.id}`}
                                                className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface p-3 transition-all hover:border-neon-green/20 active:scale-[0.98]"
                                            >
                                                {/* Rank */}
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terminal-bg text-[10px] font-bold text-muted-light">
                                                    {idx + 1}
                                                </span>

                                                {/* Silk */}
                                                <div
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                                    style={{
                                                        backgroundColor: item.horse.silkColor,
                                                    }}
                                                >
                                                    {item.horse.number}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-text-primary truncate">
                                                        {item.horse.name}
                                                    </p>
                                                    <p className="text-[10px] text-muted">
                                                        {item.race.time} · {item.race.name}
                                                    </p>
                                                </div>

                                                {/* Mentions */}
                                                <div className="flex items-center gap-2">
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-text-primary tabular-nums">
                                                            {item.mentions.toLocaleString()}
                                                        </p>
                                                        <p className="text-[10px] text-muted">mentions</p>
                                                    </div>
                                                    <TrendIcon
                                                        className={`h-4 w-4 ${trendColor}`}
                                                    />
                                                </div>

                                                {/* Sentiment */}
                                                <div className="hidden sm:block">
                                                    <div className="h-8 w-8 rounded-full border-2 border-surface-border flex items-center justify-center">
                                                        <span
                                                            className={`text-[10px] font-bold ${sentimentColor}`}
                                                        >
                                                            {item.sentimentScore > 0 ? "+" : ""}
                                                            {item.sentimentScore}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sentiment Overview */}
                            <div>
                                <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-light">
                                    Sentiment Breakdown — Top Discussed
                                </h2>
                                <div className="space-y-3">
                                    {socialTrending.slice(0, 6).map((item) => (
                                        <div
                                            key={item.horse.id}
                                            className="rounded-xl border border-surface-border bg-surface p-3"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-semibold text-text-primary">
                                                    {item.horse.name}
                                                </p>
                                                <div className="flex gap-1.5">
                                                    {item.horse.signals.map((s, i) => (
                                                        <SignalBadge
                                                            key={i}
                                                            type={s.type}
                                                            label={s.label}
                                                            size="sm"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="h-2.5 overflow-hidden rounded-full bg-terminal-bg">
                                                <div className="flex h-full">
                                                    <div
                                                        className="bg-neon-green transition-all duration-500"
                                                        style={{
                                                            width: `${item.horse.sentiment.positive}%`,
                                                        }}
                                                    />
                                                    <div
                                                        className="bg-muted transition-all duration-500"
                                                        style={{
                                                            width: `${item.horse.sentiment.neutral}%`,
                                                        }}
                                                    />
                                                    <div
                                                        className="bg-risk-red transition-all duration-500"
                                                        style={{
                                                            width: `${item.horse.sentiment.negative}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-1 flex justify-between text-[10px]">
                                                <span className="text-neon-green">
                                                    👍 {item.horse.sentiment.positive}%
                                                </span>
                                                <span className="text-muted-light">
                                                    {item.mentions.toLocaleString()} mentions
                                                </span>
                                                <span className="text-risk-red">
                                                    👎 {item.horse.sentiment.negative}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
