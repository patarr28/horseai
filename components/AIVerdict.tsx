"use client";

import { useState } from "react";
import { Horse } from "@/lib/types";
import { ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";

interface AIVerdictProps {
    horse: Horse;
}

export default function AIVerdict({ horse }: AIVerdictProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [verdictData, setVerdictData] = useState({
        aiVerdict: horse.aiVerdict,
        pros: horse.pros,
        cons: horse.cons
    });

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/horse-verdict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(horse)
            });
            const data = await res.json();

            if (res.ok && data) {
                setVerdictData({
                    aiVerdict: data.aiVerdict || "Analysis completed.",
                    pros: Array.isArray(data.pros) ? data.pros : horse.pros,
                    cons: Array.isArray(data.cons) ? data.cons : horse.cons
                });
            } else {
                throw new Error(data.error || "Failed to generate analysis");
            }
        } catch (error) {
            console.error("AI Verdict Error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-4 relative">
            {/* Verdict Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-neon-green animate-pulse-glow" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neon-green">
                        AI Verdict
                    </h3>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 rounded-lg border border-neon-green/30 bg-neon-green/10 px-2.5 py-1.5 text-[10px] font-bold text-neon-green transition-all hover:bg-neon-green/20 disabled:opacity-50"
                >
                    <Sparkles className={`h-3 w-3 ${isGenerating ? "animate-spin-slow" : ""}`} />
                    {isGenerating ? "Analyzing..." : "Fresh Analysis"}
                </button>
            </div>

            {/* Verdict Text */}
            <div className={`transition-opacity duration-300 ${isGenerating ? "opacity-50" : "opacity-100"} rounded-xl border border-surface-border bg-surface/50 p-4`}>
                <p className="text-sm leading-relaxed text-text-secondary">
                    {verdictData.aiVerdict}
                </p>
            </div>

            {/* Pros & Cons */}
            <div className={`transition-opacity duration-300 ${isGenerating ? "opacity-50" : "opacity-100"} grid grid-cols-1 gap-3 sm:grid-cols-2`}>
                {/* Pros */}
                <div className="rounded-xl border border-neon-green/10 bg-neon-green/5 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-neon-green" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neon-green">
                            Pros
                        </span>
                    </div>
                    <ul className="space-y-2">
                        {verdictData.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-green/60" />
                                <span className="text-xs leading-relaxed text-text-secondary">
                                    {pro}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Cons */}
                <div className="rounded-xl border border-risk-red/10 bg-risk-red/5 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4 text-risk-red" />
                        <span className="text-xs font-bold uppercase tracking-wider text-risk-red">
                            Cons
                        </span>
                    </div>
                    <ul className="space-y-2">
                        {verdictData.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-risk-red/60" />
                                <span className="text-xs leading-relaxed text-text-secondary">
                                    {con}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
