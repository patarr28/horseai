"use client";

import { useMemo } from "react";
import { Horse, Race } from "@/lib/types";
import { getValueBets } from "@/lib/value-engine";
import { Zap, Target, TrendingUp, ShieldCheck, BarChart3, Star, AlertTriangle, Share2 } from "lucide-react";

interface DailyAIOutlookProps {
    races: Race[];
    dayLabel: string;
}

interface OutlookAnalytics {
    banker: Horse;
    valuePlay: any; // Using any for value engine return or a basic interface
    isSleeperValue: boolean;
    recommendedBetType: "Win" | "E/W";
    watchlist: Horse[];
    expertFave: Horse;
    systemSignalHorse: Horse;
    grade: string;
    gradeColor: string;
    summary: string;
}

export default function DailyAIOutlook({ races, dayLabel }: DailyAIOutlookProps) {
    const handleShare = async (analytics: OutlookAnalytics) => {
        const shareText = `🏇 ${dayLabel} AI Intel Grade: ${analytics.grade}\n\n` +
            `🎯 Banker: ${analytics.banker.name} (${analytics.banker.odds})\n` +
            `💎 Value: ${analytics.valuePlay?.horse.name} (${analytics.valuePlay?.horse.odds})\n` +
            `📊 Result: ${analytics.summary}\n\n` +
            `Powered by Festival Whisperer AI 🤖`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Festival Whisperer - ${dayLabel} Intel`,
                    text: shareText,
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(shareText);
            alert("Intel copied to clipboard!");
        }
    };

    const analytics = useMemo<OutlookAnalytics | null>(() => {
        if (!races || races.length === 0) return null;

        const allHorses = races.flatMap((r) => r.horses);
        const valueBets = getValueBets(races);

        // 1. The Banker (The strongest pick)
        const potentialBankers = allHorses.filter(h =>
            h.signals?.some(s => s.type === 'BANKER' || s.type === 'EXPERT_TIP' || s.type === 'PUNDIT_PICK')
        );
        const banker = (potentialBankers.length > 0
            ? [...potentialBankers].sort((a, b) => b.aiRating - a.aiRating)[0]
            : [...allHorses].sort((a, b) => b.aiRating - a.aiRating)[0]) as Horse;

        // 2. Best Value (Exploitative Edge)
        let valuePlay: any = valueBets?.[0] || null;
        let isSleeperValue = false;

        // If no traditional value bet found, suggest a "Sleeper" 
        // Logic: Target the "Value Sweet Spot" (4/1 to 25/1) with the highest AI rating
        if (!valuePlay) {
            const potentialSleepers = allHorses
                .filter(h => {
                    const isNotBanker = h.id !== banker?.id;
                    const inPriceBracket = h.oddsDecimal >= 4.0 && h.oddsDecimal <= 25.0;
                    return isNotBanker && inPriceBracket && h.aiRating > 60;
                })
                .sort((a, b) => b.aiRating - a.aiRating); // Pick the most reliable one in that bracket

            // Fallback to a wider bracket if the sweet spot is empty
            const sleeper = potentialSleepers[0] || allHorses
                .filter(h => h.id !== banker?.id && h.oddsDecimal <= 50.0)
                .sort((a, b) => b.aiRating - a.aiRating)[0];

            if (sleeper) {
                isSleeperValue = true;
                valuePlay = {
                    horse: sleeper,
                    race: races.find(r => r.horses.some(h => h.id === sleeper.id))!,
                    edge: 0,
                    marketOdds: sleeper.oddsDecimal,
                    modelOdds: sleeper.oddsDecimal,
                    modelOddsDisplay: sleeper.odds,
                    expertTipScore: 0
                };
            }
        }

        // 3. The Watchlist
        const watchlist = [...allHorses]
            .filter(h => (h.sentiment?.positive || 0) > 60)
            .sort((a, b) => (b.aiRating || 0) - (a.aiRating || 0))
            .slice(0, 3);

        // 4. Specialized Data Rows (Consensus / System)
        const potentialExperts = allHorses.filter(h => h.signals?.some(s => s.type === 'EXPERT_TIP' || s.type === 'PUNDIT_PICK'));
        const expertFave = potentialExperts.sort((a, b) => (b.aiRating || 0) - (a.aiRating || 0))[0] || banker;

        const systemSignalHorse = [...allHorses]
            .filter(h => h.id !== banker?.id)
            .sort((a, b) => (b.aiRating || 0) - (a.aiRating || 0))[0] || allHorses.sort((a, b) => (b.aiRating || 0) - (a.aiRating || 0))[1] || banker;

        // 5. Day Grade
        const sortedForGrade = [...allHorses].sort((a, b) => (b.aiRating || 0) - (a.aiRating || 0));
        const top5Avg = sortedForGrade.slice(0, 5).reduce((acc, h) => acc + (h.aiRating || 0), 0) / Math.min(5, allHorses.length || 1);

        let grade = "C";
        let gradeColor = "text-value-orange";
        if (top5Avg > 85) { grade = "A+"; gradeColor = "text-neon-green"; }
        else if (top5Avg > 75) { grade = "A"; gradeColor = "text-neon-green"; }
        else if (top5Avg > 65) { grade = "B"; gradeColor = "text-neon-green"; }

        // Written summary generation with robust fallbacks to avoid "undefined"
        const bName = banker?.name || "top contender";
        const bRating = (banker?.aiRating || "high").toString();
        const vName = valuePlay?.horse?.name || "Best Value";
        const vRace = valuePlay?.race?.name || "today's card";
        const vEdge = (valuePlay?.edge || "strong").toString();
        const eName = expertFave?.name || "expert pick";
        const sName = systemSignalHorse?.name || "system highlight";

        const summaryText = `Today's card features ${races.length} races with ${allHorses.length} runners. ${bName} is the primary "Banker" with a ${bRating}% AI rating. For best value, our data highlights ${vName} in the ${vRace}${isSleeperValue ? '.' : ` with a ${vEdge}% edge.`} Expert consensus favors ${eName}, while ${sName} flags as a tactical system highlight.`;

        const valueHorse = valuePlay?.horse;
        const recommendedBetType = (valueHorse?.oddsDecimal >= 6.0) ? "E/W" : "Win";

        return {
            banker,
            valuePlay,
            isSleeperValue,
            recommendedBetType,
            watchlist,
            expertFave,
            systemSignalHorse,
            grade,
            gradeColor,
            summary: summaryText
        } as OutlookAnalytics;
    }, [races]);

    if (!analytics) return null;

    return (
        <div className="relative z-10 mx-4 mb-4 mt-2 overflow-hidden rounded-xl glass-water liquid-sheen caustic-spot p-4 shadow-xl">
            <div className="absolute inset-0 bg-mesh-liquid opacity-25 pointer-events-none" />
            <div className="relative z-10">
                {/* Ultra Compact Header */}
                <div className="flex items-center justify-between mb-2.5 border-b border-white/[0.06] pb-2.5">
                    <div className="flex items-center gap-2">
                        <Zap className="h-2.5 w-2.5 text-neon-green animate-pulse drop-shadow-[0_0_4px_rgba(0,255,136,0.8)]" />
                        <h2 className="text-[10px] font-black uppercase tracking-tight text-text-primary">
                            {dayLabel} <span className="text-muted-light font-normal italic">Daily Intel</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface/50 hover:bg-surface/70 active:scale-95 transition-all border border-surface-border/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                            onClick={() => handleShare(analytics)}
                        >
                            <Share2 className="h-2.5 w-2.5 text-neon-green" />
                            <span className="text-[7px] font-black uppercase tracking-widest text-text-primary">Send</span>
                        </button>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface/30 border border-surface-border/20">
                            <span className="text-[8px] font-bold text-muted-light uppercase tracking-widest leading-none">Grade</span>
                            <span className={`text-xs font-black leading-none ${analytics.gradeColor}`}>{analytics.grade}</span>
                        </div>
                    </div>
                </div>

                {/* Written Summary */}
                <div className="mb-3 rounded-lg p-2.5 border border-white/[0.04] bg-black/30 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <p className="text-[10px] leading-relaxed text-text-secondary">
                        {analytics.summary}
                    </p>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="rounded-lg border border-neon-green/20 bg-neon-green/[0.06] p-2.5 shadow-[inset_0_1px_0_rgba(0,255,136,0.08)]">
                        <span className="text-[8px] font-black uppercase tracking-widest text-neon-green/70 block mb-1">Banker</span>
                        <h3 className="text-xs font-black uppercase text-white truncate leading-tight">{analytics.banker?.name}</h3>
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] font-black text-neon-green font-mono-data">{analytics.banker?.odds}</span>
                            <span className="text-[8px] text-neon-green/50 font-mono-data">{analytics.banker?.aiRating}</span>
                        </div>
                    </div>
                    <div className="rounded-lg border border-value-orange/20 bg-value-orange/[0.06] p-2.5 shadow-[inset_0_1px_0_rgba(255,149,0,0.08)]">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-value-orange/70">Best Value</span>
                            <span className="text-[7px] font-black px-1 py-0.5 rounded bg-value-orange/20 text-value-orange border border-value-orange/30">
                                {analytics.recommendedBetType}
                            </span>
                        </div>
                        <h3 className="text-xs font-black uppercase text-white truncate leading-tight">{analytics.valuePlay?.horse.name || "Pending"}</h3>
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] font-black text-value-orange font-mono-data">{analytics.valuePlay?.horse.odds || "-"}</span>
                            <span className="text-[8px] text-value-orange/50">
                                {analytics.isSleeperValue ? "AI Signal" : `+${analytics.valuePlay?.edge || 0}%`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Signals */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between rounded-lg bg-surface/30 px-2.5 py-1.5 border border-surface-border/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        <div className="flex items-center gap-1.5">
                            <Star className="h-3 w-3 text-value-orange" />
                            <span className="text-[8px] font-bold text-muted-light uppercase tracking-wide">Expert Pick</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-white italic truncate max-w-[80px]">{analytics.expertFave?.name}</span>
                            <span className="text-[9px] font-mono-data font-bold text-value-orange shrink-0">{analytics.expertFave?.odds}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface/30 px-2.5 py-1.5 border border-surface-border/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        <div className="flex items-center gap-1.5">
                            <Target className="h-3 w-3 text-neon-green" />
                            <span className="text-[8px] font-bold text-muted-light uppercase tracking-wide">AI Analyse</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-white italic truncate max-w-[80px]">{analytics.systemSignalHorse?.name}</span>
                            <span className="text-[9px] font-mono-data font-bold text-neon-green shrink-0">{analytics.systemSignalHorse?.odds}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
