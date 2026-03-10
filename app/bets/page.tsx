"use client";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { triggerHaptic } from "@/lib/haptics";
import {
    ClipboardPaste,
    AlertTriangle,
    Shield,
    Trash2,
    Plus,
    Users,
    Share2,
    Download,
    Zap,
    Loader2,
    Lightbulb,
    TrendingUp,
    ChevronRight
} from "lucide-react";
import SmartAccaBuilder from "@/components/SmartAccaBuilder";

interface BetLeg {
    id: string;
    horseName: string;
    race: string;
    odds: string;
    aiProbability: number;
    weaknessLevel: "low" | "medium" | "high";
    crowdPickPercent?: number;
}


function oddsToDecimal(odds: string): number {
    if (odds === "Evs") return 2.0;
    const parts = odds.split("/");
    if (parts.length === 2) return parseInt(parts[0]) / parseInt(parts[1]) + 1;
    return parseFloat(odds);
}

export default function BetsPage() {
    const [legs, setLegs] = useState<BetLeg[]>([]);
    const [stake, setStake] = useState("10");
    const [selectedHorse, setSelectedHorse] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [filterDay, setFilterDay] = useState("");
    const [filterRace, setFilterRace] = useState("");
    const slipRef = useRef<HTMLDivElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<{ riskLevel: string; advice: string; safeCashOut: number; letItRide: number } | null>(null);

    const [allHorses, setAllHorses] = useState<any[]>([]);

    useEffect(() => {
        async function fetchRaces() {
            const FESTIVAL_DAYS = ["2026-03-10", "2026-03-11", "2026-03-12", "2026-03-13"];
            try {
                const results = await Promise.all(
                    FESTIVAL_DAYS.map(date => fetch(`/api/racing?date=${date}`).then(r => r.json()))
                );
                const horses = results.flatMap((data, dayIdx) =>
                    (data.data || []).flatMap((race: any) =>
                        (race.horses || []).map((h: any) => ({
                            ...h,
                            raceName: `${race.time} ${race.name}`,
                            raceId: race.id,
                            raceDate: FESTIVAL_DAYS[dayIdx],
                        }))
                    )
                );
                setAllHorses(horses);
            } catch (error) {
                console.error("Failed to fetch races:", error);
            }
        }
        fetchRaces();
    }, []);

    const handleAnalyzeSlip = async () => {
        if (legs.length === 0) return;
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/analyze-slip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ legs, stake })
            });
            const data = await res.json();
            if (data.riskLevel) setAiAnalysis(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDownloadSlip = async () => {
        if (!slipRef.current) return;
        try {
            triggerHaptic('medium');
            const dataUrl = await toPng(slipRef.current, { cacheBust: true, backgroundColor: '#0a0f0a' });
            const link = document.createElement('a');
            link.download = 'festival-whisperer-slip.png';
            link.href = dataUrl;
            link.click();
            triggerHaptic('success');
        } catch (err) {
            console.error("Failed to generate bet slip image", err);
            triggerHaptic('error');
        }
    };

    // Betting recommendations derived from current slip
    interface BetRec {
        type: string;
        label: string;
        bets: number;
        unitStake: number;
        totalCost: number;
        potentialReturn: number;
        why: string;
        priority: "high" | "medium" | "low";
    }

    function getBettingRecommendations(legs: BetLeg[], stakeNum: number): BetRec[] {
        const recs: BetRec[] = [];
        const n = legs.length;
        if (n === 0) return recs;

        const decimalOdds = legs.map(l => oddsToDecimal(l.odds));
        const hasLongshot = decimalOdds.some(o => o >= 6.0);
        const avgOdds = decimalOdds.reduce((a, b) => a + b, 0) / n;
        const allShortPriced = decimalOdds.every(o => o < 4.0);

        // Each Way recommendation
        if (hasLongshot && n >= 1) {
            const ewLegs = legs.filter((_, i) => decimalOdds[i] >= 6.0);
            recs.push({
                type: "EW",
                label: "Each Way",
                bets: ewLegs.length * 2,
                unitStake: stakeNum,
                totalCost: ewLegs.length * 2 * stakeNum,
                potentialReturn: ewLegs.reduce((sum, _, i) => {
                    const placeOdds = 1 + (decimalOdds[legs.indexOf(ewLegs[i])] - 1) / 4;
                    return sum + stakeNum * placeOdds;
                }, 0),
                why: `${ewLegs.map(l => l.horseName).join(", ")} ${ewLegs.length === 1 ? "is" : "are"} priced at ${ewLegs.map((_, i) => decimalOdds[legs.indexOf(ewLegs[i])].toFixed(2) + "x").join(", ")}. At these odds the place part pays 1/4 odds — EW doubles your chances of a return if they finish in the places.`,
                priority: "high"
            });
        }

        // Multiple bet recommendations based on number of legs
        if (n === 2) {
            const d = decimalOdds[0] * decimalOdds[1];
            recs.push({
                type: "DBL",
                label: "Double",
                bets: 1,
                unitStake: stakeNum,
                totalCost: stakeNum,
                potentialReturn: stakeNum * d,
                why: `A double combines both selections into one bet — both must win. Combined odds of ${d.toFixed(1)}x give a potential £${(stakeNum * d).toFixed(2)} return from £${stakeNum}.`,
                priority: "high"
            });
        }

        if (n === 3) {
            const [o1, o2, o3] = decimalOdds;
            const trebleReturn = stakeNum * o1 * o2 * o3;
            recs.push({
                type: "TBL",
                label: "Treble",
                bets: 1,
                unitStake: stakeNum,
                totalCost: stakeNum,
                potentialReturn: trebleReturn,
                why: `All three must win. Best for ${allShortPriced ? "short-priced banker selections like yours" : "high-confidence selections"} — combined odds of ${(o1 * o2 * o3).toFixed(1)}x.`,
                priority: "high"
            });
            // Trixie: 3 doubles + 1 treble
            const trixieReturn = (stakeNum * o1 * o2) + (stakeNum * o1 * o3) + (stakeNum * o2 * o3) + (stakeNum * o1 * o2 * o3);
            recs.push({
                type: "TRX",
                label: "Trixie",
                bets: 4,
                unitStake: stakeNum,
                totalCost: 4 * stakeNum,
                potentialReturn: trixieReturn,
                why: `3 doubles + 1 treble (4 bets). You profit if any 2 of 3 win — much safer than a straight treble. Costs £${(4 * stakeNum).toFixed(2)} but pays out even if one selection lets you down.`,
                priority: avgOdds > 4 ? "high" : "medium"
            });
            // Patent: 3 singles + 3 doubles + 1 treble
            const patentReturn = decimalOdds.reduce((s, o) => s + stakeNum * o, 0)
                + (stakeNum * o1 * o2) + (stakeNum * o1 * o3) + (stakeNum * o2 * o3)
                + (stakeNum * o1 * o2 * o3);
            recs.push({
                type: "PAT",
                label: "Patent",
                bets: 7,
                unitStake: stakeNum,
                totalCost: 7 * stakeNum,
                potentialReturn: patentReturn,
                why: `3 singles + 3 doubles + 1 treble (7 bets). Every winner returns something — the safest full-cover bet with 3 selections. Even a single winner covers part of the stake.`,
                priority: "medium"
            });
        }

        if (n === 4) {
            const [o1, o2, o3, o4] = decimalOdds;
            const fourfoldReturn = stakeNum * o1 * o2 * o3 * o4;
            recs.push({
                type: "FOLD",
                label: "Fourfold Acca",
                bets: 1,
                unitStake: stakeNum,
                totalCost: stakeNum,
                potentialReturn: fourfoldReturn,
                why: `All four must win for the maximum return of £${fourfoldReturn.toFixed(2)}. High risk but maximum reward — best if you're very confident in all four.`,
                priority: allShortPriced ? "high" : "low"
            });
            // Yankee: 6 doubles + 4 trebles + 1 fourfold = 11 bets
            const doubles = [
                [o1,o2],[o1,o3],[o1,o4],[o2,o3],[o2,o4],[o3,o4]
            ].reduce((s, [a,b]) => s + stakeNum * a * b, 0);
            const trebles = [
                [o1,o2,o3],[o1,o2,o4],[o1,o3,o4],[o2,o3,o4]
            ].reduce((s, [a,b,c]) => s + stakeNum * a * b * c, 0);
            const yankeeReturn = doubles + trebles + fourfoldReturn;
            recs.push({
                type: "YNK",
                label: "Yankee",
                bets: 11,
                unitStake: stakeNum,
                totalCost: 11 * stakeNum,
                potentialReturn: yankeeReturn,
                why: `6 doubles + 4 trebles + 1 fourfold (11 bets, no singles). Pays if at least 2 win. Costs £${(11 * stakeNum).toFixed(2)} — popular festival bet as it protects against one or two losers.`,
                priority: "high"
            });
            // Lucky 15: Yankee + 4 singles = 15 bets
            const singles = decimalOdds.reduce((s, o) => s + stakeNum * o, 0);
            const lucky15Return = singles + doubles + trebles + fourfoldReturn;
            recs.push({
                type: "L15",
                label: "Lucky 15",
                bets: 15,
                unitStake: stakeNum,
                totalCost: 15 * stakeNum,
                potentialReturn: lucky15Return,
                why: `4 singles + 6 doubles + 4 trebles + 1 fourfold (15 bets). Every single winner returns something — many bookmakers offer a consolation bonus if only one wins. The classic Cheltenham festival bet for 4 selections.`,
                priority: "high"
            });
        }

        if (n === 5) {
            recs.push({
                type: "L31",
                label: "Lucky 31",
                bets: 31,
                unitStake: stakeNum,
                totalCost: 31 * stakeNum,
                potentialReturn: 0,
                why: `5 singles + 10 doubles + 10 trebles + 5 fourfolds + 1 fivefold (31 bets). Full coverage — pays on any single winner and scales up beautifully if more land. Costs £${(31 * stakeNum).toFixed(2)}.`,
                priority: "medium"
            });
            const fivefoldReturn = stakeNum * decimalOdds.reduce((a, b) => a * b, 1);
            recs.push({
                type: "FOLD5",
                label: "Fivefold Acca",
                bets: 1,
                unitStake: stakeNum,
                totalCost: stakeNum,
                potentialReturn: fivefoldReturn,
                why: `All 5 must win but the potential return is huge at £${fivefoldReturn.toFixed(2)} from just £${stakeNum}. High risk — combine with a Lucky 31 for safety.`,
                priority: "low"
            });
        }

        if (n >= 6) {
            const accumReturn = stakeNum * decimalOdds.reduce((a, b) => a * b, 1);
            recs.push({
                type: "ACCUM",
                label: `${n}-fold Accumulator`,
                bets: 1,
                unitStake: stakeNum,
                totalCost: stakeNum,
                potentialReturn: accumReturn,
                why: `All ${n} must win. The potential return of £${accumReturn.toFixed(2)} from £${stakeNum} is exceptional — but the probability drops with each leg added. Consider a Lucky 63 (6 selections) for full coverage.`,
                priority: "medium"
            });
        }

        return recs.sort((a, b) => {
            const p = { high: 0, medium: 1, low: 2 };
            return p[a.priority] - p[b.priority];
        });
    }

    const stakeNum = Math.max(parseFloat(stake) || 10, 0.01);
    const betRecs = getBettingRecommendations(legs, stakeNum);

    const accumProb = legs.reduce((acc, leg) => acc * (leg.aiProbability / 100), 1);
    const combinedProb = Math.round(accumProb * 100 * 100) / 100;
    const totalOddsDecimal = legs.reduce((acc, leg) => acc * oddsToDecimal(leg.odds), 1);
    const potentialReturn = (parseFloat(stake || "0") * totalOddsDecimal).toFixed(2);
    const profit = (parseFloat(potentialReturn) - parseFloat(stake || "0")).toFixed(2);

    const weakestLeg = legs.length > 0 ? legs.reduce(
        (weakest, leg) => leg.aiProbability < weakest.aiProbability ? leg : weakest,
        legs[0]
    ) : null;

    const riskLevel = aiAnalysis?.riskLevel || (combinedProb > 10 ? "Low" : combinedProb > 3 ? "Medium" : "High");
    const riskColor = riskLevel === "Low" ? "text-neon-green" : riskLevel === "Medium" ? "text-value-orange" : riskLevel === "High" ? "text-risk-red" : "text-steaming-purple";
    const riskBg = riskLevel === "Low" ? "bg-neon-green/10 border-neon-green/20" : riskLevel === "Medium" ? "bg-value-orange/10 border-value-orange/20" : riskLevel === "High" ? "bg-risk-red/10 border-risk-red/20" : "bg-steaming-purple/10 border-steaming-purple/20";

    const removeLeg = (id: string) => {
        setLegs(legs.filter((l) => l.id !== id));
        setAiAnalysis(null);
    };

    const addHorse = () => {
        if (!selectedHorse) return;
        const horse = allHorses.find((h) => h.id === selectedHorse);
        if (!horse) return;
        const newLeg: BetLeg = {
            id: `leg-${Date.now()}`,
            horseName: horse.name,
            race: horse.raceName,
            odds: horse.odds,
            aiProbability: Math.round(100 / horse.oddsDecimal),
            weaknessLevel: horse.confidence >= 70 ? "low" : horse.confidence >= 50 ? "medium" : "high",
            crowdPickPercent: horse.crowdPickPercent,
        };
        setLegs([...legs, newLeg]);
        setSelectedHorse("");
        setShowPicker(false);
        setAiAnalysis(null);
    };

    return (
        <div className="animate-fade-in pb-28">
            {/* Header */}
            <header className="relative overflow-hidden px-4 pt-5 pb-4">
                <div className="pointer-events-none absolute -top-8 right-0 h-24 w-24 rounded-full bg-value-orange/6 blur-2xl" />
                <div className="relative">
                    <div className="flex items-center gap-2">
                        <ClipboardPaste className="h-5 w-5 text-value-orange" />
                        <h1 className="text-lg font-bold text-text-primary">Bet Slip Analyser</h1>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-light">AI-powered acca analysis & risk assessment</p>
                </div>
            </header>

            {/* Smart Acca Builder */}
            <div className="mx-4">
                <SmartAccaBuilder horses={allHorses} onBuildAcca={(newLegs) => {
                    setLegs(newLegs);
                    setAiAnalysis(null);
                }} />
            </div>

            {/* ── Bet Legs ── */}
            <div className="mx-4 space-y-2 p-4 rounded-3xl bg-terminal-bg border border-neon-green/10 shadow-lg" ref={slipRef}>
                {/* Branding for the exported image */}
                <div className="hidden pb-4 text-center items-center justify-center gap-2" style={{ display: 'none' }} id="export-branding">
                    <Zap className="h-5 w-5 text-neon-green" />
                    <span className="font-bold text-text-primary tracking-widest text-sm uppercase">Festival Whisperer 3.0</span>
                </div>
                {legs.map((leg, idx) => {
                    const isWeakest = weakestLeg?.id === leg.id && legs.length > 1;
                    const probColor = leg.aiProbability >= 50 ? "text-neon-green" : leg.aiProbability >= 30 ? "text-value-orange" : "text-risk-red";
                    const probBarColor = leg.aiProbability >= 50 ? "bg-neon-green" : leg.aiProbability >= 30 ? "bg-value-orange" : "bg-risk-red";
                    const borderColor = isWeakest ? "border-risk-red/30" : leg.weaknessLevel === "low" ? "border-neon-green/15" : "border-value-orange/15";

                    return (
                        <div
                            key={leg.id}
                            className={`rounded-2xl border ${borderColor} bg-surface overflow-hidden animate-slide-up`}
                            style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
                        >
                            <div className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terminal-bg font-mono-data text-[11px] font-bold text-muted-light border border-surface-border">
                                            {idx + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-text-primary truncate">{leg.horseName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[10px] text-muted truncate">{leg.race}</p>
                                                {leg.crowdPickPercent !== undefined && (
                                                    <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-neon-green/10 border border-neon-green/30 px-1.5 py-0.5 text-[9px] font-bold text-neon-green">
                                                        <Users className="h-2.5 w-2.5" />
                                                        {leg.crowdPickPercent}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right">
                                            <p className="font-mono-data text-base font-bold text-neon-green">{leg.odds}</p>
                                            <p className={`text-[10px] font-bold ${probColor}`}>{leg.aiProbability}%</p>
                                        </div>
                                        <button
                                            onClick={() => removeLeg(leg.id)}
                                            className="rounded-lg p-1.5 text-muted hover:bg-risk-red/10 hover:text-risk-red transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Probability bar */}
                                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-terminal-bg">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${probBarColor}`}
                                        style={{ width: `${leg.aiProbability}%` }}
                                    />
                                </div>
                            </div>

                            {/* Weakest leg callout */}
                            {isWeakest && (
                                <div className="flex items-center gap-1.5 bg-risk-red/8 border-t border-risk-red/20 px-3 py-1.5">
                                    <AlertTriangle className="h-3 w-3 text-risk-red shrink-0" />
                                    <span className="text-[10px] font-bold text-risk-red">
                                        ⚠ Weakest Leg — only {leg.aiProbability}% AI probability
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Add Horse */}
                {!showPicker ? (
                    <button
                        onClick={() => setShowPicker(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-surface-border bg-surface/50 py-3.5 text-xs font-semibold text-muted-light transition-all hover:border-neon-green/30 hover:text-neon-green active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4" />
                        Add Selection
                    </button>
                ) : (() => {
                    const DAY_LABELS: Record<string, string> = {
                        "2026-03-10": "Tue 10 Mar — Day 1",
                        "2026-03-11": "Wed 11 Mar — Day 2",
                        "2026-03-12": "Thu 12 Mar — Day 3",
                        "2026-03-13": "Fri 13 Mar — Day 4",
                    };
                    const racesForDay = filterDay
                        ? [...new Map(
                            allHorses
                                .filter(h => h.raceDate === filterDay)
                                .map(h => [h.raceId, { id: h.raceId, name: h.raceName }])
                          ).values()]
                        : [];
                    const horsesForRace = filterDay && filterRace
                        ? allHorses.filter(h => h.raceDate === filterDay && h.raceId === filterRace && !legs.find(l => l.horseName === h.name))
                        : [];
                    return (
                        <div className="rounded-2xl border border-neon-green/20 bg-surface p-3 space-y-2 animate-fade-in">
                            {/* Step 1: Day */}
                            <select
                                value={filterDay}
                                onChange={e => { setFilterDay(e.target.value); setFilterRace(""); setSelectedHorse(""); }}
                                className="w-full rounded-xl border border-surface-border bg-terminal-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green/50 transition-colors"
                            >
                                <option value="">1. Select a day...</option>
                                {Object.entries(DAY_LABELS).map(([date, label]) => (
                                    <option key={date} value={date}>{label}</option>
                                ))}
                            </select>
                            {/* Step 2: Race */}
                            {filterDay && (
                                <select
                                    value={filterRace}
                                    onChange={e => { setFilterRace(e.target.value); setSelectedHorse(""); }}
                                    className="w-full rounded-xl border border-surface-border bg-terminal-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green/50 transition-colors"
                                >
                                    <option value="">2. Select a race...</option>
                                    {racesForDay.map(race => (
                                        <option key={race.id} value={race.id}>{race.name}</option>
                                    ))}
                                </select>
                            )}
                            {/* Step 3: Horse */}
                            {filterRace && (
                                <select
                                    value={selectedHorse}
                                    onChange={e => setSelectedHorse(e.target.value)}
                                    className="w-full rounded-xl border border-surface-border bg-terminal-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green/50 transition-colors"
                                >
                                    <option value="">3. Select a horse...</option>
                                    {horsesForRace.map(h => (
                                        <option key={h.id} value={h.id}>{h.name} — {h.odds}</option>
                                    ))}
                                </select>
                            )}
                            <div className="flex gap-2">
                                <button onClick={addHorse} disabled={!selectedHorse} className="flex-1 rounded-xl bg-neon-green py-2 text-xs font-bold text-terminal-bg disabled:opacity-30 transition-opacity">
                                    Add
                                </button>
                                <button onClick={() => { setShowPicker(false); setFilterDay(""); setFilterRace(""); setSelectedHorse(""); }} className="flex-1 rounded-xl border border-surface-border py-2 text-xs font-semibold text-muted-light">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* ── Stake Input ── */}
            <div className="mx-4 mt-4 rounded-2xl border border-surface-border bg-surface p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-light">Stake</p>
                    <div className="flex items-center gap-1.5">
                        <span className="font-mono-data text-muted-light">£</span>
                        <input
                            type="number"
                            value={stake}
                            onChange={(e) => setStake(e.target.value)}
                            className="w-20 rounded-xl border border-surface-border bg-terminal-bg px-2 py-1.5 text-right font-mono-data text-lg font-bold text-neon-green outline-none focus:border-neon-green/50 transition-colors"
                        />
                    </div>
                </div>
                <div className="flex gap-1.5">
                    {["5", "10", "25", "50", "100"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStake(s)}
                            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all active:scale-95 ${stake === s
                                ? "bg-neon-green text-terminal-bg shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                                : "border border-surface-border text-muted-light hover:text-neon-green"
                                }`}
                        >
                            £{s}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Betting Recommendations ── */}
            {legs.length > 0 && betRecs.length > 0 && (
                <div className="mx-4 mt-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-value-orange" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-value-orange">Bet Type Recommendations</h2>
                    </div>
                    <div className="space-y-2">
                        {betRecs.map((rec) => {
                            const priorityBorder = rec.priority === "high" ? "border-neon-green/25" : rec.priority === "medium" ? "border-value-orange/20" : "border-surface-border";
                            const priorityBadge = rec.priority === "high" ? "bg-neon-green/15 text-neon-green border-neon-green/30" : rec.priority === "medium" ? "bg-value-orange/15 text-value-orange border-value-orange/30" : "bg-surface-border/40 text-muted-light border-surface-border";
                            const priorityLeft = rec.priority === "high" ? "bg-neon-green" : rec.priority === "medium" ? "bg-value-orange" : "bg-surface-border";
                            return (
                                <div key={rec.type} className={`rounded-2xl border ${priorityBorder} bg-surface overflow-hidden`}>
                                    <div className={`h-0.5 w-full ${priorityLeft}`} />
                                    <div className="p-3">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className={`shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-black tracking-wider ${priorityBadge}`}>
                                                    {rec.type}
                                                </span>
                                                <span className="text-sm font-bold text-text-primary">{rec.label}</span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[9px] text-muted uppercase tracking-wider">{rec.bets} bet{rec.bets > 1 ? "s" : ""} @ £{rec.unitStake}</p>
                                                <p className="font-mono-data text-xs font-bold text-text-primary">Cost: £{rec.totalCost.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-text-secondary mb-2">{rec.why}</p>
                                        {rec.potentialReturn > 0 && (
                                            <div className="flex items-center justify-between rounded-xl bg-terminal-bg border border-surface-border px-3 py-2">
                                                <span className="text-[10px] text-muted-light uppercase tracking-wider">Max Return</span>
                                                <div className="flex items-center gap-1.5">
                                                    <TrendingUp className="h-3 w-3 text-neon-green" />
                                                    <span className="font-mono-data text-sm font-bold text-neon-green">£{rec.potentialReturn.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="mt-2 text-[10px] text-muted text-center">For entertainment only — please gamble responsibly</p>
                </div>
            )}

            {/* ── AI Analysis Panel ── */}
            {legs.length > 0 && (
                <div className="mx-4 mt-4 space-y-3 animate-fade-in">

                    {/* Hero Return Display */}
                    <div className="relative overflow-hidden rounded-2xl border border-neon-green/25 bg-gradient-to-br from-neon-green/8 via-neon-green/4 to-transparent p-5">
                        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-neon-green/10 blur-xl" />
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-light">If All Land</p>
                                <p className="font-mono-data text-4xl font-bold text-neon-green text-glow-green">
                                    £{potentialReturn}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-light">
                                    Profit: <span className="font-semibold text-neon-green">+£{profit}</span>
                                </p>
                            </div>
                            <div className="text-right space-y-2">
                                <div>
                                    <p className="text-[10px] text-muted">Combined Odds</p>
                                    <p className="font-mono-data text-xl font-bold text-text-primary">{totalOddsDecimal.toFixed(1)}x</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted">Legs</p>
                                    <p className="font-mono-data text-xl font-bold text-text-primary">{legs.length}</p>
                                </div>
                                {/* WhatsApp Share — PRD requirement */}
                                <div className="flex flex-col gap-1.5">
                                    <button
                                        onClick={handleDownloadSlip}
                                        className="flex items-center justify-center gap-1.5 rounded-xl bg-neon-green/15 border border-neon-green/30 px-3 py-1.5 text-[10px] font-bold text-neon-green transition-all hover:bg-neon-green/25 active:scale-95"
                                    >
                                        <Download className="h-3 w-3" />
                                        Save Slip
                                    </button>
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(`🏇 My Cheltenham Bet Slip\n${legs.map((l, i) => `${i + 1}. ${l.horseName} @ ${l.odds}`).join('\n')}\n\n💰 Potential Return: £${potentialReturn} from £${stake}\n\n📲 Festival Whisperer AI`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 px-3 py-1.5 text-[10px] font-bold text-[#25D366] transition-all hover:bg-[#25D366]/25 active:scale-95"
                                    >
                                        <Share2 className="h-3 w-3" />
                                        Share
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Risk + Probability row */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-2xl border border-surface-border bg-surface p-4">
                            <p className="text-[10px] uppercase tracking-wider text-muted-light">AI Probability</p>
                            <p className="font-mono-data mt-1 text-2xl font-bold text-value-orange">{combinedProb}%</p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-terminal-bg">
                                <div
                                    className="h-full rounded-full bg-value-orange/60"
                                    style={{ width: `${Math.min(combinedProb * 5, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className={`rounded-2xl border ${riskBg} p-4`}>
                            <p className="text-[10px] uppercase tracking-wider text-muted-light">Risk Level</p>
                            <p className={`font-mono-data mt-1 text-2xl font-bold ${riskColor}`}>{riskLevel}</p>
                            <div className="mt-2 flex gap-1">
                                {["Low", "Medium", "High", "Extreme"].map((r) => (
                                    <div
                                        key={r}
                                        className={`h-1.5 flex-1 rounded-full transition-all ${riskLevel === r
                                            ? r === "Low" ? "bg-neon-green" : r === "Medium" ? "bg-value-orange" : r === "High" ? "bg-risk-red" : "bg-steaming-purple"
                                            : "bg-surface-border"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Analysis trigger */}
                    {!aiAnalysis && (
                        <button
                            onClick={handleAnalyzeSlip}
                            disabled={isAnalyzing}
                            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-neon-green/30 bg-neon-green/10 py-3.5 text-sm font-bold text-neon-green shadow-[0_0_15px_rgba(0,255,136,0.1)] transition-all hover:bg-neon-green/20"
                        >
                            <Zap className={`h-4 w-4 ${isAnalyzing ? "animate-pulse" : ""}`} />
                            {isAnalyzing ? "AI Evaluator Running..." : "Run AI Risk Evaluation"}
                        </button>
                    )}

                    {/* Cash Out Advice */}
                    {aiAnalysis && (
                        <div className="rounded-2xl border border-value-orange/20 bg-value-orange/5 p-4 animate-slide-up">
                            <div className="flex items-center gap-2 mb-3">
                                <Shield className="h-4 w-4 text-value-orange" />
                                <span className="text-xs font-bold uppercase tracking-wider text-value-orange">
                                    AI Risk Assessment
                                </span>
                            </div>
                            <p className="text-xs leading-relaxed text-text-secondary mb-4">
                                {aiAnalysis.advice}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-3 text-center">
                                    <p className="text-[9px] uppercase tracking-wider text-muted-light">Safe Cash Out</p>
                                    <p className="font-mono-data text-xl font-bold text-neon-green">
                                        £{(parseFloat(potentialReturn) * (aiAnalysis.safeCashOut / 100)).toFixed(2)}
                                    </p>
                                    <p className="text-[9px] text-muted mt-0.5">{aiAnalysis.safeCashOut}% of max return</p>
                                </div>
                                <div className="rounded-xl border border-value-orange/20 bg-value-orange/5 p-3 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-value-orange/5" />
                                    <p className="relative text-[9px] uppercase tracking-wider text-muted-light">Let It Ride</p>
                                    <p className="relative font-mono-data text-xl font-bold text-value-orange">
                                        £{(parseFloat(potentialReturn) * (aiAnalysis.letItRide / 100)).toFixed(2)}
                                    </p>
                                    <p className="relative text-[9px] text-muted mt-0.5">{aiAnalysis.letItRide}% of max return</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
