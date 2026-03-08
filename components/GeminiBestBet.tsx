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
        <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-neon-green/30 bg-gradient-to-br from-neon-green/10 via-surface to-surface relative group">
            {/* Background glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-neon-green/20 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />

            <div className="relative p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-green/20 border border-neon-green/50">
                            <Sparkles className="h-4 w-4 text-neon-green" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neon-green">Gemini Best Bet</h3>
                            <p className="text-[10px] text-muted-light">Nap of the Day</p>
                        </div>
                    </div>
                    <div className="rounded border border-neon-green/20 bg-neon-green/5 px-2 py-1 text-center">
                        <span className="block text-xs font-bold text-neon-green">{bet.odds}</span>
                    </div>
                </div>

                <div className="mb-3">
                    <h4 className="text-xl font-bold text-text-primary mb-1">{bet.horseName}</h4>
                    <p className="text-xs text-muted-light font-mono-data">{bet.raceTime} Race</p>
                </div>

                <div className="rounded-xl border border-surface-border bg-black/40 p-3 mb-3">
                    <p className="text-sm text-text-secondary leading-relaxed italic border-l-2 border-neon-green/50 pl-3">
                        "{bet.reasoning}"
                    </p>
                </div>

            </div>
        </div>
    );
}
