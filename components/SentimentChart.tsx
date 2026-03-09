"use client";

import React, { useMemo } from "react";
import { MessageSquareQuote, CheckCircle2, TrendingUp } from "lucide-react";

interface TipsterPick {
    tipsterName: string;
    publication: string;
    tipType: string;
    confidence: string;
    reasoning?: string;
}

interface HorseData {
    id: string;
    name: string;
    odds: string;
    tipsterPicks?: TipsterPick[];
}

interface SentimentChartProps {
    horses: HorseData[];
}

export default function SentimentChart({ horses }: SentimentChartProps) {
    // 1. Filter horses that have actual tips
    // 2. Sort them by number of tips (descending)
    // 3. Take top 5 to display
    const topTippedHorses = useMemo(() => {
        if (!horses || horses.length === 0) return [];

        const tipped = horses.filter(h => h.tipsterPicks && h.tipsterPicks.length > 0);
        return tipped.sort((a, b) => (b.tipsterPicks?.length || 0) - (a.tipsterPicks?.length || 0)).slice(0, 5);
    }, [horses]);

    if (topTippedHorses.length === 0) {
        return (
            <div className="relative z-10 mx-4 mb-6 rounded-2xl glass-panel p-5 shadow-xl overflow-hidden flex flex-col items-center justify-center min-h-[150px]">
                <MessageSquareQuote className="h-6 w-6 text-muted-light mb-2 opacity-50" />
                <p className="text-xs font-medium text-muted uppercase tracking-widest">No Expert Sentiment Available</p>
            </div>
        );
    }

    return (
        <div className="relative z-10 mx-4 mb-6 rounded-2xl glass-panel p-5 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-mesh-liquid opacity-10 pointer-events-none" />

            <div className="relative z-10 mb-5 flex items-center justify-between">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">
                        Professional Sentiment
                    </h3>
                    <p className="text-[8px] font-black text-muted-light mt-1 uppercase tracking-widest flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-neon-green" /> Tipster Consensus Index
                    </p>
                </div>
            </div>

            <div className="relative z-10 flex flex-col gap-4">
                {topTippedHorses.map((horse) => (
                    <div key={horse.id} className="rounded-xl bg-black/40 border border-white/5 p-3 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-neon-green uppercase tracking-tight">{horse.name}</span>
                                <span className="px-1.5 py-0.5 rounded-full bg-surface-border text-[9px] font-mono-data text-text-secondary">{horse.odds}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-green/10 border border-neon-green/20">
                                <CheckCircle2 className="h-3 w-3 text-neon-green" />
                                <span className="text-[9px] font-black tracking-widest text-neon-green uppercase">{horse.tipsterPicks?.length} Tips</span>
                            </div>
                        </div>

                        {/* List the tipsters involved */}
                        <div className="flex flex-wrap gap-1 mb-3">
                            {horse.tipsterPicks?.map((tip, idx) => (
                                <span key={idx} className="text-[9px] font-semibold text-text-secondary bg-surface rounded px-1.5 py-0.5 border border-surface-border/50">
                                    {tip.tipsterName} {tip.tipType ? `(${tip.tipType})` : ''}
                                </span>
                            ))}
                        </div>

                        {/* Display an expert quote if available */}
                        {horse.tipsterPicks?.filter(t => t.reasoning && t.reasoning.length > 5).slice(0, 1).map((tip, idx) => (
                            <div key={idx} className="relative mt-2 p-3 rounded-lg bg-surface border-l-2 border-neon-green">
                                <MessageSquareQuote className="absolute top-2 right-2 h-4 w-4 text-white/5" />
                                <p className="text-[11px] text-muted-light italic leading-relaxed pr-5">
                                    "{tip.reasoning}"
                                </p>
                                <p className="text-[9px] font-bold text-neon-green/80 mt-1 uppercase tracking-wider">
                                    — {tip.tipsterName}, {tip.publication}
                                </p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
