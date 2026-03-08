import { useState, useEffect } from "react";
import { Sparkles, Loader2, Info } from "lucide-react";

interface AIRacePreviewProps {
    race: any;
}

export default function AIRacePreview({ race }: AIRacePreviewProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPreview() {
            try {
                const res = await fetch('/api/race-preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(race)
                });
                if (res.ok) {
                    const data = await res.json();
                    setPreview(data.preview);
                }
            } catch (error) {
                console.error("Failed to fetch race preview:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPreview();
    }, [race.id]);

    if (loading) {
        return (
            <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-neon-green/10 bg-surface/50 p-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-neon-green/10">
                        <Loader2 className="h-4 w-4 animate-spin text-neon-green" />
                        <div className="absolute inset-0 rounded-lg animate-pulse-glow" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 rounded bg-neon-green/20 animate-pulse" />
                        <div className="h-2 w-full rounded bg-surface border border-surface-border animate-pulse" />
                        <div className="h-2 w-5/6 rounded bg-surface border border-surface-border animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!preview) return null;

    return (
        <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-neon-green/20 bg-gradient-to-br from-neon-green/5 to-surface p-4 relative">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-green/20 border border-neon-green/40 shadow-[0_0_15px_rgba(0,255,136,0.15)]">
                        <Sparkles className="h-4 w-4 text-neon-green" />
                    </div>
                </div>
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-neon-green mb-1.5 flex items-center gap-1.5">
                        AI Race Preview <Info className="w-3 h-3 text-neon-green/50" />
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        {preview}
                    </p>
                </div>
            </div>
        </div>
    );
}
