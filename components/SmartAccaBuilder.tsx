"use client";

import { useState } from "react";
import { Brain, Wand2, Zap, Rocket, Shield } from "lucide-react";

interface BetLeg {
    id: string;
    horseName: string;
    race: string;
    odds: string;
    aiProbability: number;
    weaknessLevel: "low" | "medium" | "high";
    crowdPickPercent?: number;
}

interface SmartAccaBuilderProps {
    onBuildAcca: (legs: BetLeg[]) => void;
    horses: any[];
}

type Profile = "banker" | "value" | "moonshot";

export default function SmartAccaBuilder({ onBuildAcca, horses }: SmartAccaBuilderProps) {
    const [generating, setGenerating] = useState(false);
    const [profile, setProfile] = useState<Profile>("banker");

    const allHorses = horses;

    const profiles = [
        { id: "banker", icon: Shield, label: "Banker Acca", desc: "Top AI probabilities only", color: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/20" },
        { id: "value", icon: Zap, label: "Value Hunter", desc: "Highest edge selections", color: "text-value-orange", bg: "bg-value-orange/10", border: "border-value-orange/20" },
        { id: "moonshot", icon: Rocket, label: "Moonshot", desc: "High risk, huge reward", color: "text-risk-red", bg: "bg-risk-red/10", border: "border-risk-red/20" }
    ];

    const generateAcca = () => {
        setGenerating(true);
        const snapshot = [...allHorses];
        setTimeout(() => {
            let selectedHorses: any[] = [];

            if (profile === "banker") {
                // Favorites: short-priced horses (up to ~4/1), pick top 3 by AI rating
                selectedHorses = snapshot
                    .filter(h => (h.oddsDecimal ?? 99) <= 5.0)
                    .sort((a, b) => b.aiRating - a.aiRating)
                    .slice(0, 3);
                // Fallback: top 3 by aiRating if not enough short-priced horses
                if (selectedHorses.length < 2) {
                    selectedHorses = snapshot.sort((a, b) => b.aiRating - a.aiRating).slice(0, 3);
                }
            } else if (profile === "value") {
                // Value range: 5/1 to 14/1, sort by aiRating descending
                selectedHorses = snapshot
                    .filter(h => (h.oddsDecimal ?? 0) > 5.0 && (h.oddsDecimal ?? 0) <= 15.0)
                    .sort((a, b) => b.aiRating - a.aiRating)
                    .slice(0, 3);
                if (selectedHorses.length < 2) {
                    selectedHorses = snapshot.sort((a, b) => b.aiRating - a.aiRating).slice(3, 6);
                }
            } else {
                // Moonshot: big outsiders (16/1+), random shuffle for excitement
                selectedHorses = snapshot
                    .filter(h => (h.oddsDecimal ?? 0) > 16.0)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4);
                if (selectedHorses.length < 2) {
                    selectedHorses = snapshot.sort((a, b) => a.aiRating - b.aiRating).slice(0, 4);
                }
            }

            const newLegs: BetLeg[] = selectedHorses.map(horse => ({
                id: `leg-${Date.now()}-${Math.random()}`,
                horseName: horse.name,
                race: horse.raceName,
                odds: horse.odds,
                aiProbability: horse.oddsDecimal > 0 ? Math.round(100 / horse.oddsDecimal) : 10,
                weaknessLevel: (horse.oddsDecimal ?? 99) <= 5 ? "low" : (horse.oddsDecimal ?? 99) <= 15 ? "medium" : "high",
                crowdPickPercent: horse.crowdPickPercent,
            }));

            onBuildAcca(newLegs);
            setGenerating(false);
        }, 1500);
    };

    return (
        <div className="rounded-3xl border border-neon-green/20 bg-surface/80 p-4 mb-4 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-neon-green animate-pulse-glow" />
                <h2 className="text-sm font-bold text-text-primary">Smart Acca Builder</h2>
            </div>

            <p className="text-xs text-muted-light mb-4">
                Let the AI scan all festival data and build an accumulator tailored to your risk profile.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
                {profiles.map(p => {
                    const Icon = p.icon;
                    const isActive = profile === p.id;
                    return (
                        <button
                            key={p.id}
                            onClick={() => setProfile(p.id as Profile)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${isActive ? `${p.bg} ${p.border} ${p.color}` : "border-surface-border bg-terminal-bg text-muted-light hover:border-surface-border-bright"}`}
                        >
                            <Icon className={`h-4 w-4 mb-1.5 ${isActive ? p.color : "text-muted"}`} />
                            <span className="text-[10px] font-bold text-center leading-tight">{p.label}</span>
                        </button>
                    );
                })}
            </div>

            <button
                onClick={generateAcca}
                disabled={generating}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all active:scale-[0.98] ${generating ? "bg-surface-border text-muted-light" : "bg-neon-green text-terminal-bg hover:bg-neon-green-dim shadow-[0_0_15px_rgba(0,255,136,0.3)]"}`}
            >
                {generating ? (
                    <>
                        <Wand2 className="h-4 w-4 animate-spin-slow" />
                        Analyzing Markets...
                    </>
                ) : (
                    <>
                        <Wand2 className="h-4 w-4" />
                        Generate Smart Acca
                    </>
                )}
            </button>
        </div>
    );
}
