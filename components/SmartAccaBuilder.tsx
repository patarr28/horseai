"use client";

import { useState } from "react";
import { Brain, Wand2, Zap, Rocket, Shield } from "lucide-react";
import { cheltenhamDay1 } from "@/lib/mock-data";

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
}

type Profile = "banker" | "value" | "moonshot";

export default function SmartAccaBuilder({ onBuildAcca }: SmartAccaBuilderProps) {
    const [generating, setGenerating] = useState(false);
    const [profile, setProfile] = useState<Profile>("banker");

    const allHorses = cheltenhamDay1.flatMap((race) =>
        race.horses.map((h) => ({ ...h, raceName: `${race.time} ${race.name}`, raceId: race.id }))
    );

    const profiles = [
        { id: "banker", icon: Shield, label: "Banker Acca", desc: "Top AI probabilities only", color: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/20" },
        { id: "value", icon: Zap, label: "Value Hunter", desc: "Highest edge selections", color: "text-value-orange", bg: "bg-value-orange/10", border: "border-value-orange/20" },
        { id: "moonshot", icon: Rocket, label: "Moonshot", desc: "High risk, huge reward", color: "text-risk-red", bg: "bg-risk-red/10", border: "border-risk-red/20" }
    ];

    const generateAcca = () => {
        setGenerating(true);
        // Simulate AI thinking time
        setTimeout(() => {
            let selectedHorses = [];

            if (profile === "banker") {
                selectedHorses = [...allHorses].filter(h => h.confidence >= 75).sort((a, b) => b.confidence - a.confidence).slice(0, 3);
            } else if (profile === "value") {
                selectedHorses = [...allHorses].filter(h => h.confidence >= 50 && h.confidence <= 75).sort((a, b) => b.confidence - a.confidence).slice(0, 3);
            } else {
                selectedHorses = [...allHorses].filter(h => h.confidence < 40).sort(() => 0.5 - Math.random()).slice(0, 4);
            }

            const newLegs: BetLeg[] = selectedHorses.map(horse => ({
                id: `leg-${Date.now()}-${horse.id}`,
                horseName: horse.name,
                race: horse.raceName,
                odds: horse.odds,
                aiProbability: Math.round(100 / horse.oddsDecimal),
                weaknessLevel: horse.confidence >= 70 ? "low" : horse.confidence >= 50 ? "medium" : "high",
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
