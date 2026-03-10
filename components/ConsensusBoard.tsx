"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Users, RefreshCw, Flame, Star, Loader2 } from "lucide-react";

interface ConsensusPick {
    race_date: string;
    race_time: string | null;
    race_name: string | null;
    horse_name: string;
    consensus_votes: number;
    tipsters: string[];
    tip_types: string[];
    has_nap: boolean;
    voteStrength: number; // 0–100
}

interface ConsensusBoardProps {
    date: string; // e.g. "2026-03-10"
}

const TIP_TYPE_PILL: Record<string, string> = {
    NAP: "bg-neon-green/10 text-neon-green border-neon-green/40",
    "Each Way": "bg-purple-400/10 text-purple-400 border-purple-400/40",
    Win: "bg-sky-400/10 text-sky-400 border-sky-400/40",
};

export default function ConsensusBoard({ date }: ConsensusBoardProps) {
    const [picks, setPicks] = useState<ConsensusPick[]>([]);
    const [loading, setLoading] = useState(true);
    const [collecting, setCollecting] = useState(false);
    const [activeTipster, setActiveTipster] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const autoCollectAttempted = useRef(false);

    const fetchConsensus = useCallback(async (): Promise<ConsensusPick[]> => {
        setLoading(true);
        try {
            const url = activeTipster
                ? `/api/tips/consensus?date=${date}&tipster=${encodeURIComponent(activeTipster)}`
                : `/api/tips/consensus?date=${date}`;
            const res = await fetch(url);
            const json = await res.json();
            const p: ConsensusPick[] = json.picks || [];
            setPicks(p);
            if (p.length > 0) setLastUpdated(new Date());
            return p;
        } catch {
            setPicks([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [date, activeTipster]);

    // On mount: fetch then auto-collect once if empty
    useEffect(() => {
        fetchConsensus().then(async (result) => {
            if (result.length === 0 && !autoCollectAttempted.current) {
                autoCollectAttempted.current = true;
                await collectTips(true); // silent auto-collect
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    // Re-fetch when tipster filter changes (after initial mount)
    useEffect(() => {
        if (autoCollectAttempted.current) fetchConsensus();
    }, [activeTipster, fetchConsensus]);

    async function collectTips(silent = false) {
        if (!silent) setCollecting(true);
        else setStatusMsg("Auto-collecting tips…");
        try {
            const res = await fetch("/api/tips/collect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date }),
            });
            const json = await res.json();
            const count = json.inserted ?? 0;
            setStatusMsg(count > 0 ? `${count} tips collected` : "No new tips found");
            await fetchConsensus();
        } catch {
            setStatusMsg("Collection failed — try again");
        } finally {
            setCollecting(false);
        }
    }

    // All unique tipster names across the fetched picks
    const allTipsters = Array.from(
        new Set(picks.flatMap((p) => p.tipsters))
    ).sort();

    const napPick = picks.find((p) => p.has_nap) || picks[0];
    const maxVotes = picks[0]?.consensus_votes || 1;

    return (
        <section className="mx-4 mb-6 rounded-2xl glass-panel overflow-hidden shadow-2xl">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-surface-border/30">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-value-orange" />
                    <span className="text-xs font-black uppercase tracking-widest text-value-orange">
                        Tipster Consensus
                    </span>
                    {picks.length > 0 && (
                        <span className="rounded bg-value-orange/10 border border-value-orange/30 px-1.5 py-0.5 text-[9px] font-bold text-value-orange">
                            {picks.length} horses
                        </span>
                    )}
                </div>
                <button
                    onClick={() => collectTips(false)}
                    disabled={collecting}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-black bg-neon-green shadow-[0_0_12px_rgba(0,255,136,0.3)] transition-all active:scale-90 disabled:opacity-60"
                >
                    {collecting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <RefreshCw className="h-3 w-3" />
                    )}
                    {collecting ? "Collecting…" : "Refresh Tips"}
                </button>
            </div>

            {(statusMsg || lastUpdated) && (
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-surface-border/20">
                    {statusMsg && (
                        <p className="text-[10px] text-neon-green/70">{statusMsg}</p>
                    )}
                    {lastUpdated && (
                        <p className="text-[9px] text-muted ml-auto">
                            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>
            )}

            {/* ── NAP of the Day ───────────────────────────────────── */}
            {napPick && !loading && (
                <div className="mx-4 mt-4 rounded-xl bg-neon-green/5 border border-neon-green/20 p-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neon-green/10 border border-neon-green/30">
                        <Flame className="h-5 w-5 text-neon-green animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-neon-green/70 mb-0.5">
                            Top Consensus Pick
                        </p>
                        <p className="text-sm font-black text-neon-green leading-tight truncate text-glow-green">
                            {napPick.horse_name}
                        </p>
                        <p className="text-[10px] text-muted-light truncate">
                            {napPick.race_name || "Cheltenham"}{napPick.race_time ? ` · ${napPick.race_time}` : ""}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-xl font-black text-neon-green text-glow-green">
                            {napPick.consensus_votes}
                        </p>
                        <p className="text-[9px] text-muted-light uppercase tracking-widest">
                            tipster{napPick.consensus_votes !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Tipster Filter Chips ─────────────────────────────── */}
            {allTipsters.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pt-3 pb-1">
                    <button
                        onClick={() => setActiveTipster(null)}
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border transition-all ${
                            activeTipster === null
                                ? "bg-value-orange text-black border-value-orange"
                                : "border-surface-border text-muted-light hover:border-value-orange/40"
                        }`}
                    >
                        All
                    </button>
                    {allTipsters.map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTipster(activeTipster === t ? null : t)}
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border transition-all ${
                                activeTipster === t
                                    ? "bg-value-orange text-black border-value-orange"
                                    : "border-surface-border text-muted-light hover:border-value-orange/40"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Horse List ───────────────────────────────────────── */}
            <div className="px-4 pt-3 pb-4 space-y-2.5">
                {loading ? (
                    <div className="flex items-center justify-center py-8 gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-neon-green" />
                        <span className="text-xs text-muted-light">Loading consensus…</span>
                    </div>
                ) : picks.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center gap-2">
                        <Users className="h-8 w-8 text-muted opacity-40" />
                        <p className="text-xs text-muted-light">No tips found for this day yet.</p>
                        <p className="text-[10px] text-muted">
                            {collecting ? "Collecting from the web now…" : "Tap Refresh Tips to search for today's picks."}
                        </p>
                    </div>
                ) : (
                    picks.map((pick, idx) => (
                        <div
                            key={`${pick.horse_name}-${idx}`}
                            className="rounded-xl border border-surface-border/40 bg-surface/50 p-3 space-y-2"
                        >
                            {/* Row 1: rank + name + votes */}
                            <div className="flex items-center gap-2">
                                <span className="shrink-0 w-5 text-center text-[10px] font-black text-muted">
                                    #{idx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="text-sm font-black text-text-primary leading-none">
                                            {pick.horse_name}
                                        </p>
                                        {pick.has_nap && (
                                            <Star className="h-3 w-3 text-neon-green fill-neon-green shrink-0" />
                                        )}
                                        {pick.tip_types?.map((tt) => (
                                            <span
                                                key={tt}
                                                className={`rounded border px-1 py-0.5 text-[8px] font-black tracking-widest ${TIP_TYPE_PILL[tt] || TIP_TYPE_PILL["Win"]}`}
                                            >
                                                {tt === "Each Way" ? "EW" : tt}
                                            </span>
                                        ))}
                                    </div>
                                    {pick.race_name && (
                                        <p className="text-[10px] text-muted-light mt-0.5 truncate">
                                            {pick.race_name}
                                            {pick.race_time && ` · ${pick.race_time}`}
                                        </p>
                                    )}
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-base font-black text-value-orange leading-none">
                                        {pick.consensus_votes}
                                    </p>
                                    <p className="text-[8px] text-muted uppercase tracking-widest">
                                        tips
                                    </p>
                                </div>
                            </div>

                            {/* Row 2: vote-strength bar */}
                            <div className="h-1 w-full rounded-full bg-surface-border/40 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-value-orange transition-all duration-500"
                                    style={{ width: `${Math.round((pick.consensus_votes / maxVotes) * 100)}%` }}
                                />
                            </div>

                            {/* Row 3: tipster name chips */}
                            {pick.tipsters?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {pick.tipsters.map((t) => (
                                        <span
                                            key={t}
                                            className="rounded-full bg-white/[0.04] border border-surface-border/60 px-2 py-0.5 text-[9px] text-muted-light"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
