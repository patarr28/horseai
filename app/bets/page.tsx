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
    Loader2
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

const demoLegs: BetLeg[] = [
    { id: "1", horseName: "Ballyburn", race: "13:30 Supreme Novices' Hurdle", odds: "6/4", aiProbability: 62, weaknessLevel: "low", crowdPickPercent: 42 },
    { id: "2", horseName: "Majborough", race: "14:10 Arkle Challenge Trophy", odds: "Evs", aiProbability: 58, weaknessLevel: "low", crowdPickPercent: 38 },
    { id: "3", horseName: "Stage Star", race: "14:50 Ultima Handicap Chase", odds: "12/1", aiProbability: 18, weaknessLevel: "high", crowdPickPercent: 9 },
    { id: "4", horseName: "Galopin Des Champs", race: "15:30 Gold Cup Chase", odds: "Evs", aiProbability: 55, weaknessLevel: "low", crowdPickPercent: 51 },
];

function oddsToDecimal(odds: string): number {
    if (odds === "Evs") return 2.0;
    const parts = odds.split("/");
    if (parts.length === 2) return parseInt(parts[0]) / parseInt(parts[1]) + 1;
    return parseFloat(odds);
}

export default function BetsPage() {
    const [legs, setLegs] = useState<BetLeg[]>(demoLegs);
    const [stake, setStake] = useState("10");
    const [selectedHorse, setSelectedHorse] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const slipRef = useRef<HTMLDivElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<{ riskLevel: string; advice: string; safeCashOut: number; letItRide: number } | null>(null);

    const [allHorses, setAllHorses] = useState<any[]>([]);

    useEffect(() => {
        async function fetchRaces() {
            try {
                const res = await fetch("/api/racing");
                const data = await res.json();
                const horses = (data.data || []).flatMap((race: any) =>
                    race.horses.map((h: any) => ({ ...h, raceName: `${race.time} ${race.name}`, raceId: race.id }))
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
                <SmartAccaBuilder onBuildAcca={(newLegs) => {
                    setLegs(newLegs);
                    setAiAnalysis(null); // reset analysis on new acca
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
                                                    <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-social-blue/10 border border-social-blue/20 px-1.5 py-0.5 text-[9px] font-bold text-social-blue">
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
                ) : (
                    <div className="rounded-2xl border border-neon-green/20 bg-surface p-3 space-y-2 animate-fade-in">
                        <select
                            value={selectedHorse}
                            onChange={(e) => setSelectedHorse(e.target.value)}
                            className="w-full rounded-xl border border-surface-border bg-terminal-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green/50 transition-colors"
                        >
                            <option value="">Select a horse...</option>
                            {allHorses
                                .filter((h) => !legs.find((l) => l.horseName === h.name))
                                .map((h) => (
                                    <option key={h.id} value={h.id}>
                                        {h.name} — {h.odds} ({h.raceName})
                                    </option>
                                ))}
                        </select>
                        <div className="flex gap-2">
                            <button onClick={addHorse} disabled={!selectedHorse} className="flex-1 rounded-xl bg-neon-green py-2 text-xs font-bold text-terminal-bg disabled:opacity-30 transition-opacity">
                                Add
                            </button>
                            <button onClick={() => setShowPicker(false)} className="flex-1 rounded-xl border border-surface-border py-2 text-xs font-semibold text-muted-light">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
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
                                        href={`whatsapp://send?text=${encodeURIComponent(`🏇 My Cheltenham Bet Slip\n${legs.map((l, i) => `${i + 1}. ${l.horseName} @ ${l.odds}`).join('\n')}\n\n💰 Potential Return: £${potentialReturn} from £${stake}\n\n📲 Festival Whisperer AI`)}`}
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
