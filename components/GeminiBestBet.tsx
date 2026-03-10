import { useState, useEffect } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BestBet {
    horseName: string;
    raceTime: string;
    odds: string;
    reasoning: string;
}

export default function GeminiBestBet({ date }: { date?: string }) {
    const [bet, setBet] = useState<BestBet | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBestBet() {
            try {
                const res = await fetch(`/api/nap-of-the-day${date ? `?date=${date}` : ''}`);
                if (res.ok) {
                    const data = await res.json();
                    setBet(data);
                }
            } catch (error) {
                console.error("Failed to fetch Gemini best bet:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBestBet();
    }, [date]);

    if (loading) {
        return (
            <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-neon-green/10 bg-surface/50 p-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-neon-green/10">
                        <Loader2 className="h-5 w-5 animate-spin text-neon-green" />
                        <div className="absolute inset-0 rounded-xl animate-pulse-glow" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-neon-green/10 animate-pulse" />
                        <div className="h-3 w-1/2 rounded bg-surface border border-surface-border animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!bet) return null;

    return (
        <div className="mx-4 mb-3 overflow-hidden rounded-xl glass-water liquid-sheen caustic-spot relative group shadow-xl transition-all duration-300 animate-depth-breathe">
            <div className="absolute inset-0 bg-mesh-liquid opacity-15 pointer-events-none" />

            <div className="relative p-4 z-10">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-green/15 border border-neon-green/25 shadow-[inset_0_1px_0_rgba(0,255,136,0.15),0_0_12px_rgba(0,255,136,0.1)]">
                            <Sparkles className="h-4 w-4 text-neon-green" />
                        </div>
                        <div>
                            <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-neon-green leading-none text-glow-green">Algorithmic Standout</h3>
                            <p className="text-[7px] font-bold text-muted-light uppercase tracking-widest mt-0.5 opacity-70">Top-Rated Consensus</p>
                        </div>
                    </div>
                    <div className="rounded-lg border border-neon-green/25 bg-neon-green/10 px-2.5 py-1.5 flex items-center justify-center shadow-[inset_0_1px_0_rgba(0,255,136,0.12),0_0_10px_rgba(0,255,136,0.08)]">
                        <span className="text-sm font-black text-neon-green font-mono-data leading-none">{bet.odds}</span>
                    </div>
                </div>

                <div className="mb-3">
                    <h4 className="text-xl font-black text-text-primary mb-1 tracking-tight text-glow-green uppercase leading-tight">{bet.horseName}</h4>
                    <p className="text-[8px] text-muted-light font-black uppercase tracking-widest border-l-2 border-neon-green/40 pl-2 opacity-80">{bet.raceTime} · Logic Prompt Synthesis</p>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-black/50 p-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <p className="text-[10px] text-text-secondary leading-relaxed font-medium italic opacity-90">
                        "{bet.reasoning}"
                    </p>
                </div>
            </div>
        </div>
    );
}
