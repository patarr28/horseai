"use client";

import { useState, useEffect, useRef } from "react";
import { getValueBets } from "@/lib/value-engine";
import { getTipsters, Tipster } from "@/lib/tipsters";
import SignalBadge from "@/components/SignalBadge";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import Link from "next/link";
import {
    Radar,
    Target,
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowRight,
    Flame,
    AlertTriangle,
    Loader2,
    Award,
    BarChart3,
    RefreshCw
} from "lucide-react";
import { Race, TipsterPick } from "@/lib/types";

type Tab = "value" | "experts";

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

const TIP_TYPE_ORDER: Record<string, number> = { NAP: 0, NB: 1, EACH_WAY: 2, VALUE: 3, LONGSHOT: 4 };
const CONF_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

interface FlatPick {
    pick: TipsterPick;
    horse: Race["horses"][0];
    race: Race;
    tipsterColor: string;
}

export default function InsightsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("value");
    const [races, setRaces] = useState<Race[]>([]);
    const [tipsters, setTipsters] = useState<Tipster[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const syncAttempted = useRef(false);

    async function fetchRaces() {
        const res = await fetch("/api/racing");
        const data = await res.json();
        return (data.data || []) as Race[];
    }

    async function autoSync(date: string) {
        setSyncing(true);
        try {
            await fetch(`/api/sync-tipsters?date=${date}`);
            const freshRaces = await fetchRaces();
            setRaces(freshRaces);
        } catch (err) {
            console.error("[insights] Auto-sync failed:", err);
        } finally {
            setSyncing(false);
        }
    }

    useEffect(() => {
        async function load() {
            try {
                const [loadedRaces, tipstersRes] = await Promise.all([
                    fetchRaces(),
                    fetch("/api/tipsters"),
                ]);
                setRaces(loadedRaces);
                if (tipstersRes.ok) {
                    const td = await tipstersRes.json();
                    setTipsters(td.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Auto-sync picks if none are loaded yet (runs once after initial load)
    useEffect(() => {
        if (loading || syncAttempted.current) return;
        const hasPicks = races.some(r => r.horses.some(h => (h.tipsterPicks?.length ?? 0) > 0));
        if (!hasPicks && races.length > 0) {
            syncAttempted.current = true;
            const today = new Date().toISOString().split("T")[0];
            autoSync(today);
        }
    }, [loading, races]);

    // Build tipster colour map for pick display
    const tipsterColorMap = new Map<string, string>(
        tipsters.map(t => [t.name.toLowerCase(), t.color_hex])
    );

    // Flatten all tipsterPicks from all horses into a sortable list
    const allExpertPicks: FlatPick[] = races
        .flatMap(race =>
            race.horses.flatMap(horse =>
                (horse.tipsterPicks || []).map(pick => ({
                    pick,
                    horse,
                    race,
                    tipsterColor: tipsterColorMap.get(pick.tipsterName.toLowerCase()) || "#ff8c00",
                }))
            )
        )
        .sort((a, b) => {
            const typeA = TIP_TYPE_ORDER[a.pick.tipType] ?? 5;
            const typeB = TIP_TYPE_ORDER[b.pick.tipType] ?? 5;
            if (typeA !== typeB) return typeA - typeB;
            return (CONF_ORDER[a.pick.confidence] ?? 5) - (CONF_ORDER[b.pick.confidence] ?? 5);
        });

    // Group picks by horse for the new Most Tipped view
    const mostTippedHorses = Object.values(
        allExpertPicks.reduce((acc, item) => {
            if (!acc[item.horse.name]) {
                acc[item.horse.name] = { horse: item.horse, race: item.race, picks: [] };
            }
            acc[item.horse.name].picks.push(item);
            return acc;
        }, {} as Record<string, { horse: Race["horses"][0]; race: Race; picks: FlatPick[] }>)
    ).sort((a, b) => b.picks.length - a.picks.length);

    const valueBets = getValueBets(races);
    const valuePicks = valueBets.filter(vb => vb.edge > 0);
    const overhypedPicks = valueBets.filter(vb => vb.edge < -20);

    return (
        <div className="animate-fade-in pb-24">
            {/* Header */}
            <header className="px-4 pt-4 pb-3">
                <div className="flex gap-2 items-center">
                    <h1 className="text-xl font-bold text-text-primary">Intelligence</h1>
                    <span className="flex h-5 items-center rounded-sm bg-neon-green/20 border border-neon-green/40 px-1.5 text-[9px] font-bold uppercase tracking-widest text-neon-green shadow-[0_0_8px_rgba(57,255,20,0.3)] animate-pulse">
                        EXPERT DATA
                    </span>
                </div>
                <p className="text-xs text-muted-light">
                    Pro tipster consensus · Value radar · Market intelligence
                </p>
            </header>

            {loading ? (
                <div className="mt-24 flex flex-col items-center justify-center space-y-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-neon-green/10 border border-neon-green/30">
                        <Loader2 className="h-6 w-6 animate-spin text-neon-green" />
                    </div>
                    <p className="font-mono-data text-sm font-bold tracking-widest text-neon-green uppercase">
                        Loading Expert Intel
                    </p>
                    <p className="text-xs text-muted-light">Aggregating tipster consensus...</p>
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
                            onClick={() => setActiveTab("experts")}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all ${activeTab === "experts"
                                ? "bg-neon-green text-terminal-bg"
                                : "text-muted-light hover:text-text-primary"
                                }`}
                        >
                            <Target className="h-3.5 w-3.5" />
                            Expert Consensus
                        </button>
                    </div>

                    {/* VALUE RADAR TAB */}
                    {activeTab === "value" && (
                        <div className="animate-fade-in mt-4 space-y-4 px-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-3 text-center">
                                    <p className="text-2xl font-bold text-neon-green">{valuePicks.length}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-light">Value Bets</p>
                                </div>
                                <div className="rounded-xl border border-risk-red/20 bg-risk-red/5 p-3 text-center">
                                    <p className="text-2xl font-bold text-risk-red">{overhypedPicks.length}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-light">Overhyped</p>
                                </div>
                                <div className="rounded-xl border border-surface-border bg-surface p-3 text-center">
                                    <p className="text-2xl font-bold text-text-primary">
                                        {races.reduce((acc, r) => acc + r.horses.length, 0)}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-light">Runners</p>
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <Flame className="h-4 w-4 text-neon-green" />
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-neon-green">Best Value Bets</h2>
                                </div>
                                <div className="space-y-2">
                                    {valuePicks.map(vb => (
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
                                                        <p className="text-sm font-bold text-text-primary truncate">{vb.horse.name}</p>
                                                        <p className="text-[10px] text-muted">{vb.race.time} · {vb.race.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-xs text-muted line-through">{vb.horse.odds}</span>
                                                            <span className="text-sm font-bold text-neon-green">{vb.modelOddsDisplay}</span>
                                                        </div>
                                                        <span className="rounded bg-neon-green/10 px-1.5 py-0.5 text-[10px] font-bold text-neon-green">
                                                            +{vb.edge}% EDGE
                                                        </span>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-muted-light" />
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 rounded-full bg-terminal-bg overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-neon-green/50 to-neon-green transition-all"
                                                        style={{ width: `${Math.min(100, Math.max(10, vb.edge))}%` }}
                                                    />
                                                </div>
                                                <ConfidenceGauge score={vb.horse.confidence} size="sm" />
                                            </div>
                                        </Link>
                                    ))}
                                    {valuePicks.length === 0 && (
                                        <p className="py-8 text-center text-xs text-muted">No value bets available for today's races.</p>
                                    )}
                                </div>
                            </div>

                            {overhypedPicks.length > 0 && (
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-risk-red" />
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-risk-red">Overhyped — Avoid</h2>
                                    </div>
                                    <div className="space-y-2">
                                        {overhypedPicks.map(vb => (
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
                                                            <p className="text-sm font-bold text-text-primary truncate">{vb.horse.name}</p>
                                                            <p className="text-[10px] text-muted">{vb.race.time} · {vb.race.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-sm font-bold text-risk-red">{vb.horse.odds}</span>
                                                            <span className="text-xs text-muted">→ {vb.modelOddsDisplay}</span>
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

                    {/* EXPERT CONSENSUS TAB */}
                    {activeTab === "experts" && (
                        <div className="animate-fade-in mt-4 space-y-4 px-4">

                            {/* Today's Expert Panel */}
                            {tipsters.length > 0 && (
                                <div className="rounded-xl border border-surface-border bg-surface p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Award className="h-4 w-4 text-value-orange" />
                                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-light">Today's Expert Panel</h2>
                                    </div>
                                    <div className="space-y-2">
                                        {tipsters.slice(0, 6).map((tipster, idx) => (
                                            <div key={tipster.id} className="flex items-center gap-3">
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terminal-bg text-[10px] font-bold text-muted-light">
                                                    {idx + 1}
                                                </span>
                                                <div
                                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-terminal-bg"
                                                    style={{ backgroundColor: tipster.color_hex }}
                                                >
                                                    {tipster.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-text-primary truncate">{tipster.name}</p>
                                                    <p className="text-[10px] text-muted truncate">{tipster.publication}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-bold" style={{ color: tipster.color_hex }}>
                                                        {tipster.roi_percentage > 0 ? "+" : ""}{tipster.roi_percentage}% ROI
                                                    </p>
                                                    <p className="text-[10px] text-muted">{tipster.win_rate}% wins</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Expert Picks — with auto-sync */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-neon-green" />
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-neon-green">Expert Picks</h2>
                                        {allExpertPicks.length > 0 && (
                                            <span className="rounded-full bg-neon-green/10 px-2 py-0.5 text-[9px] font-bold text-neon-green">
                                                {allExpertPicks.length} tips
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            syncAttempted.current = false;
                                            const today = new Date().toISOString().split("T")[0];
                                            autoSync(today);
                                        }}
                                        disabled={syncing}
                                        className="flex items-center gap-1 rounded-lg border border-value-orange/30 bg-value-orange/10 px-2.5 py-1 text-[10px] font-bold text-value-orange transition-all hover:bg-value-orange/20 disabled:opacity-50"
                                    >
                                        <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
                                        {syncing ? "Syncing…" : "Refresh"}
                                    </button>
                                </div>

                                {syncing ? (
                                    <div className="rounded-xl border border-surface-border bg-surface p-8 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-value-orange mb-3" />
                                        <p className="text-sm font-semibold text-text-primary">Generating expert picks…</p>
                                        <p className="text-xs text-muted mt-1">Asking Gemini to analyse today's runners for each tipster</p>
                                    </div>
                                ) : allExpertPicks.length > 0 ? (
                                    <div className="space-y-2">
                                        {allExpertPicks.map((item, idx) => (
                                            <Link
                                                key={idx}
                                                href={`/horses/${item.horse.id}`}
                                                className="block rounded-xl border border-surface-border bg-surface p-3 transition-all hover:border-value-orange/30 active:scale-[0.98]"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Tipster avatar */}
                                                    <div
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-terminal-bg"
                                                        style={{ backgroundColor: item.tipsterColor }}
                                                    >
                                                        {item.pick.tipsterName.substring(0, 2).toUpperCase()}
                                                    </div>

                                                    {/* Main content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-xs font-bold text-text-primary">{item.pick.tipsterName}</p>
                                                            <span className="text-[10px] text-muted-light">{item.pick.publication}</span>
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className={`rounded border px-1.5 py-0.5 text-[9px] font-black tracking-widest ${TIP_TYPE_COLORS[item.pick.tipType] || TIP_TYPE_COLORS.LONGSHOT}`}>
                                                                {item.pick.tipType}
                                                            </span>
                                                            <span className="text-xs font-semibold text-text-primary truncate">{item.horse.name}</span>
                                                            <span className="text-[10px] text-muted shrink-0">{item.horse.odds}</span>
                                                        </div>
                                                        <p className="text-[10px] text-muted mt-0.5 truncate">{item.race.time} · {item.race.name}</p>
                                                        {item.pick.reasoning && (
                                                            <p className="mt-1.5 text-[11px] italic text-text-secondary leading-snug border-l-2 pl-2" style={{ borderColor: item.tipsterColor + "60" }}>
                                                                &ldquo;{item.pick.reasoning}&rdquo;
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Confidence */}
                                                    <div className="shrink-0 text-right">
                                                        <span className={`text-[9px] font-bold uppercase ${CONFIDENCE_COLORS[item.pick.confidence]}`}>
                                                            {item.pick.confidence}
                                                        </span>
                                                        <ArrowRight className="ml-auto mt-1 h-3 w-3 text-muted-light" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-surface-border bg-surface p-6 text-center">
                                        <Target className="mx-auto h-8 w-8 text-muted mb-2" />
                                        <p className="text-sm font-semibold text-text-primary">No tips loaded yet</p>
                                        <p className="text-xs text-muted mt-1">
                                            Make sure /api/racing is fetched first, then hit Refresh above
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Most Tipped Horses */}
                            {mostTippedHorses.length > 0 && (
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Flame className="h-4 w-4 text-value-orange" />
                                            <h2 className="text-sm font-bold uppercase tracking-wider text-value-orange">Most Tipped Horses</h2>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {mostTippedHorses.map((group, idx) => (
                                            <div key={idx} className="rounded-xl border border-surface-border bg-surface p-4">
                                                <div className="flex items-center justify-between mb-3 border-b border-surface-border/50 pb-2">
                                                    <div>
                                                        <h3 className="text-base font-bold text-text-primary">{group.horse.name}</h3>
                                                        <p className="text-[10px] text-muted">{group.race.time} · {group.race.name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-neon-green">{group.horse.odds}</span>
                                                        <div className="mt-0.5 rounded-full bg-value-orange/10 px-2 py-0.5 text-[10px] font-bold text-value-orange">
                                                            {group.picks.length} Tip{group.picks.length > 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {group.picks.map((pickItem, pIdx) => (
                                                        <div key={pIdx} className="flex items-center gap-1.5 rounded-full border border-surface-border bg-terminal-bg px-2 py-1 pr-3 shadow-sm">
                                                            <div
                                                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-terminal-bg"
                                                                style={{ backgroundColor: pickItem.tipsterColor }}
                                                            >
                                                                {pickItem.pick.tipsterName.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="text-[10px] font-semibold text-text-secondary truncate max-w-[100px]">{pickItem.pick.tipsterName}</span>
                                                            <span className={`ml-1 text-[8px] font-black tracking-widest ${TIP_TYPE_COLORS[pickItem.pick.tipType] || TIP_TYPE_COLORS.LONGSHOT}`}>
                                                                {pickItem.pick.tipType.substring(0, 3)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Show the reasoning for the first tip as a highlight */}
                                                {group.picks.find(p => p.pick.reasoning)?.pick.reasoning && (
                                                    <div className="mt-3 rounded border-l-2 pl-3 py-1 bg-terminal-bg/50" style={{ borderColor: group.picks[0].tipsterColor + "60" }}>
                                                        <p className="text-[11px] italic text-text-secondary leading-snug">
                                                            &ldquo;{group.picks.find(p => p.pick.reasoning)?.pick.reasoning}&rdquo;
                                                        </p>
                                                    </div>
                                                )}

                                                <Link
                                                    href={`/horses/${group.horse.id}`}
                                                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-neon-green/10 py-1.5 text-[10px] font-bold text-neon-green transition-all hover:bg-neon-green/20"
                                                >
                                                    View AI Profile <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
