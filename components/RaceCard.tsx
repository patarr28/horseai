"use client";

import Link from "next/link";
import { Race } from "@/lib/types";
import SignalBadge from "./SignalBadge";
import { Clock, Users, ChevronRight, TrendingUp, Sparkles, Scale, Info, Timer, Zap, Trophy, Star, TrendingDown } from "lucide-react";
import ShareButton from "./ShareButton";

interface RaceCardProps {
    race: Race;
}

// Signal-colored left border
const signalBorderColor: Record<string, string> = {
    BANKER: "border-l-neon-green",
    VALUE_BET: "border-l-value-orange",
    STEAMING: "border-l-steaming-purple",
    PUNDIT_PICK: "border-l-neon-green",
    DRIFTING: "border-l-risk-red",
    EXPERT_TIP: "border-l-neon-green",
    OVERHYPED: "border-l-risk-red",
    MARKET_MOVER: "border-l-steaming-purple",
};

const signalGlow: Record<string, string> = {
    BANKER: "hover:shadow-[0_0_24px_rgba(0,255,136,0.12)]",
    VALUE_BET: "hover:shadow-[0_0_24px_rgba(255,149,0,0.12)]",
    STEAMING: "hover:shadow-[0_0_24px_rgba(191,90,242,0.12)]",
    PUNDIT_PICK: "hover:shadow-[0_0_24px_rgba(0,255,136,0.12)]",
    DRIFTING: "hover:shadow-[0_0_24px_rgba(255,59,48,0.12)]",
};

export default function RaceCard({ race }: RaceCardProps) {
    const topSignal = race.topSignals[0]?.type ?? "EXPERT_TIP";
    const borderColor = signalBorderColor[topSignal] ?? "border-l-surface-border";
    const glowClass = signalGlow[topSignal] ?? "";

    // Top horse odds for the card
    const topHorse = race.horses[0];

    const getGoingComment = (going: string) => {
        const lc = going.toLowerCase();
        if (lc.includes("heavy")) return " (Bring your wellies!)";
        if (lc.includes("soft")) return " (Bit of a slog today)";
        if (lc.includes("good to soft")) return " (Nice and cushy)";
        if (lc.includes("good")) return " (Perfect for a sprint!)";
        if (lc.includes("firm")) return " (Like running on road)";
        return " (How muddy is it?)";
    };

    const aiPick = [...(race.horses || [])].sort((a, b) => b.aiRating - a.aiRating)[0];
    const sortedByOdds = [...(race.horses || [])].sort((a, b) => a.oddsDecimal - b.oddsDecimal);
    const fav = sortedByOdds[0];

    return (
        <Link href={`/races/${race.id}`} className="group block">
            <div
                className={`relative overflow-hidden rounded-2xl glass-panel border-l-4 ${borderColor} shadow-xl transition-all duration-300 ${glowClass} hover:border-surface-border-bright active:scale-[0.98] hover:shadow-2xl`}
            >
                {/* Mesh background */}
                <div className="absolute inset-0 bg-mesh-liquid opacity-[0.05] pointer-events-none" />
                {/* Silhouette Watermarks */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0">
                    <svg
                        viewBox="0 0 200 200"
                        className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[120%] text-neon-green fill-current rotate-[-15deg]"
                    >
                        <path d="M180,140 c-10,-5 -20,-10 -30,-5 c-5,2 -10,10 -15,15 c-5,5 -20,10 -30,5 c-10,-5 -15,-20 -15,-35 c0,-15 5,-30 15,-40 c10,-10 20,-15 30,-15 c10,0 25,10 35,20 c10,10 15,30 10,55 Z M50,160 c10,0 20,-5 25,-15 c5,-10 5,-20 0,-30 c-5,-10 -15,-15 -25,-15 c-10,0 -20,5 -25,15 c-5,10 -5,20 0,30 c5,10 15,15 25,15 Z" />
                    </svg>
                    <svg
                        viewBox="0 0 100 100"
                        className="absolute top-[20%] left-[-20%] w-[80%] h-[80%] text-value-orange fill-current opacity-40"
                    >
                        <path d="M30,20 h40 v10 c0,15 -10,25 -20,25 s-20,-10 -20,-25 v-10 Z M50,55 v20 M35,75 h30 M25,30 c-5,0 -10,5 -10,10 s5,10 10,10 M75,30 c5,0 10,5 10,10 s-5,10 -10,10" />
                    </svg>
                </div>

                {/* Subtle gradient overlay */}
                <div className="relative z-10 pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />

                {/* Dynamic Badge System Overlay */}
                <div className="absolute left-0 top-0 z-20 flex flex-col gap-1.5 p-3">
                    {race.marketMover && (
                        <div className="flex items-center gap-1.5 rounded-md bg-steaming-purple/90 px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-white shadow-lg backdrop-blur-md border border-white/20 animate-pulse-glow">
                            <TrendingUp className="h-3.5 w-3.5" /> Market Mover
                        </div>
                    )}
                    {aiPick && aiPick.aiRating >= 90 && (
                        <div className="flex items-center gap-1.5 rounded-md bg-neon-green/90 px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-terminal-bg shadow-lg backdrop-blur-md border border-white/20">
                            <Sparkles className="h-3.5 w-3.5" /> Market AI Tips
                        </div>
                    )}
                    {race.horses.some(h => h.signals.some(s => s.type === "EXPERT_TIP" || s.type === "PUNDIT_PICK")) && (
                        <div className="flex items-center gap-1.5 rounded-md bg-value-orange/90 px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-white shadow-lg backdrop-blur-md border border-white/20">
                            <Star className="h-3.5 w-3.5" /> High Pro Recommendation
                        </div>
                    )}
                    <div className="absolute right-0 top-0 z-20 flex flex-col gap-1.5 p-3">
                        <ShareButton
                            title={`Race Intel: ${race.name}`}
                            text={`Check the pro analysis for the ${race.name} at ${race.time}!`}
                            variant="ghost"
                            size="sm"
                        />
                    </div>
                </div>

                {/* Race Header */}
                <div className="relative z-10 p-4 pb-3">
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-base font-bold text-text-primary pr-2 leading-tight">
                            {race.name}
                        </h3>
                        {race.grade && (
                            <span className="shrink-0 rounded-md border border-surface-border bg-terminal-bg px-2 py-0.5 text-[10px] font-bold text-muted-light">
                                {race.grade}
                            </span>
                        )}
                    </div>

                    <div className="flex items-end justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-mono-data text-sm font-bold text-text-secondary">
                                    {race.time}
                                </span>
                            </div>
                        </div>

                        {/* Meta right */}
                        <div className="shrink-0 text-right space-y-1">
                            <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-light">
                                <Clock className="h-3 w-3 text-neon-green/70" />
                                <span className="font-mono-data font-semibold">{race.distance}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-light">
                                <Timer className="h-3 w-3 text-value-orange/70" />
                                <span className="font-mono-data font-semibold">Avg: {race.averageTime || "TBA"}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-light">
                                <Users className="h-3 w-3 text-white/50" />
                                <span>{race.runners} Runners</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 text-[11px] font-medium text-muted">
                        Track: <span className="text-text-secondary">{race.going}</span>
                        <span className="text-neon-green/80 italic">{getGoingComment(race.going)}</span>
                    </div>
                </div>

                {/* AI vs FAV Showdown */}
                {aiPick && fav && (
                    <div className="relative z-10 border-t border-surface-border/40 px-4 py-3 bg-neon-green/5">
                        <h4 className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-light mb-2">
                            <Scale className="h-3 w-3 text-neon-green" /> The Matchup
                        </h4>
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] text-neon-green uppercase mb-0.5 font-bold tracking-wider">AI Pick</p>
                                <p className="text-sm font-bold text-text-primary truncate">{aiPick.name}</p>
                                <p className="font-mono-data text-xs font-semibold text-muted-light mt-0.5">{aiPick.odds}</p>
                            </div>
                            <div className="text-[10px] italic text-muted px-3">VS</div>
                            <div className="flex-1 min-w-0 text-right">
                                <p className="text-[9px] text-value-orange uppercase mb-0.5 font-bold tracking-wider">Market Fav</p>
                                <p className="text-sm font-bold text-text-primary truncate">{fav.name}</p>
                                <p className="font-mono-data text-xs font-semibold text-muted-light mt-0.5">{fav.odds}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Power Favorite & Newcomers */}
                {(race.favoriteDetails || (race.notableNewcomers && race.notableNewcomers.length > 0)) && (
                    <div className="relative z-10 border-t border-surface-border/40 p-4 space-y-4">
                        {race.favoriteDetails && (
                            <div className="rounded-xl border border-value-orange/30 bg-value-orange/5 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trophy className="h-3 w-3 text-value-orange" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-value-orange">The Power Favorite</h4>
                                </div>
                                <p className="text-sm font-bold text-text-primary mb-1">{race.favoriteDetails.name}</p>
                                <p className="text-[11px] text-muted-light leading-relaxed">{race.favoriteDetails.detail}</p>
                            </div>
                        )}

                        {race.notableNewcomers && race.notableNewcomers.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-light mb-3 flex items-center gap-2">
                                    <Sparkles className="h-3 w-3 text-neon-green" /> Newcomers With A Chance
                                </h4>
                                <div className="space-y-2">
                                    {race.notableNewcomers.map((newcomer, idx) => (
                                        <div key={idx} className="flex flex-col gap-0.5 pl-3 border-l-2 border-neon-green/30">
                                            <p className="text-xs font-bold text-text-primary">{newcomer.name}</p>
                                            <p className="text-[10px] text-muted-light italic">{newcomer.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Race Intel & Legacy */}
                <div className="relative z-10 border-t border-surface-border/40 px-4 py-3 bg-terminal-bg/50">
                    <div className="flex items-center gap-1.5 mb-3 text-muted-light">
                        <Zap className="h-3 w-3 text-neon-green" />
                        <span className="text-[10px] uppercase tracking-wider font-bold">Pro Intel & Strategy</span>
                    </div>

                    <div className="space-y-4">
                        {race.lastWinners && race.lastWinners.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-neon-green mb-2">Race Legacy</h4>
                                <div className="space-y-2">
                                    {race.lastWinners.map((winner, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <span className="text-[10px] font-mono text-muted shrink-0 w-8">{winner.year}</span>
                                            <div>
                                                <p className="text-xs font-bold text-text-primary">{winner.name}</p>
                                                <p className="text-[10px] text-muted-light italic leading-tight mt-0.5">{winner.fact}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {race.historyFact && (
                            <div>
                                <h4 className="text-[9px] font-bold uppercase tracking-wider text-neon-green/80 mb-1">Race History</h4>
                                <p className="text-xs text-muted-light leading-relaxed flex items-start gap-1.5"><Info className="h-3 w-3 shrink-0 mt-0.5 text-neon-green/50" />{race.historyFact}</p>
                            </div>
                        )}

                        {race.runnerFacts && race.runnerFacts.length > 0 && (
                            <div>
                                <h4 className="text-[9px] font-bold uppercase tracking-wider text-neon-green/80 mb-1">Runner Intel</h4>
                                <ul className="space-y-1">
                                    {race.runnerFacts.map((fact, idx) => (
                                        <li key={idx} className="text-xs text-muted-light leading-relaxed flex items-start gap-1.5"><Info className="h-3 w-3 shrink-0 mt-0.5 text-neon-green/50" />{fact}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {race.lookOutFor && race.lookOutFor.length > 0 && (
                            <div>
                                <h4 className="text-[9px] font-bold uppercase tracking-wider text-value-orange/80 mb-1">Things To Look Out For</h4>
                                <ul className="space-y-1">
                                    {race.lookOutFor.map((fact, idx) => (
                                        <li key={idx} className="text-xs text-muted-light leading-relaxed flex items-start gap-1.5"><Sparkles className="h-3 w-3 shrink-0 mt-0.5 text-value-orange/50" />{fact}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {race.wildCard && (
                            <div className="rounded-lg border border-steaming-purple/20 bg-steaming-purple/5 p-2.5">
                                <h4 className="text-[9px] font-bold uppercase tracking-wider text-steaming-purple mb-1">Wild Card Chance: {race.wildCard.name}</h4>
                                <p className="text-xs text-steaming-purple/80 leading-relaxed">{race.wildCard.reason}</p>
                            </div>
                        )}

                        {/* Fallback for legacy cached data during hot-reload */}
                        {(!race.historyFact && race.vitalFacts && race.vitalFacts.length > 0) && (
                            <ul className="space-y-1 list-none">
                                {race.vitalFacts.map((fact, idx) => (
                                    <li key={idx} className="text-xs text-muted-light flex items-start gap-1.5 leading-relaxed">
                                        <Info className="h-3.5 w-3.5 text-neon-green shrink-0 mt-0.5" /> {fact}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Go Arrow on hover */}
                <div className="absolute right-4 top-4 opacity-0 transition-all duration-200 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 bg-surface rounded-full p-1 shadow-md border border-neon-green/20">
                    <ChevronRight className="h-4 w-4 text-neon-green" />
                </div>
            </div>
        </Link>
    );
}
