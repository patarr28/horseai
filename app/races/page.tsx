"use client";

import { useState, useEffect } from "react";
import RaceCard from "@/components/RaceCard";
import { Trophy, Search, X, Loader2 } from "lucide-react";
import { Race } from "@/lib/types";

export default function RacesPage() {
    const [query, setQuery] = useState("");
    const [races, setRaces] = useState<Race[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/racing');
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();
                setRaces(json.data || []);
            } catch (err) {
                console.error("Error loading live races:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = races.filter((race) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        // Match on race name, time, grade, or any horse name / jockey / trainer
        if (race.name.toLowerCase().includes(q)) return true;
        if (race.time.includes(q)) return true;
        if (race.grade?.toLowerCase().includes(q)) return true;
        if (race.horses.some((h) =>
            h.name.toLowerCase().includes(q) ||
            h.jockey.toLowerCase().includes(q) ||
            h.trainer.toLowerCase().includes(q)
        )) return true;
        return false;
    });

    if (loading) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
                <p className="text-sm font-medium text-muted">Loading Live Racecards...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-24">
            {/* Header */}
            <header className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-neon-green" />
                    <h1 className="text-lg font-bold text-text-primary">All Races</h1>
                    <span className="ml-auto font-mono-data text-xs px-2 py-0.5 rounded bg-surface border border-surface-border text-neon-green shadow-[0_0_8px_rgba(20,241,149,0.2)]">
                        LIVE DATA
                    </span>
                </div>
            </header>

            {/* Functional Search */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2.5 transition-colors focus-within:border-neon-green/40">
                    <Search className="h-4 w-4 shrink-0 text-muted" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search races, horses, jockeys, trainers..."
                        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-muted outline-none"
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="text-muted hover:text-text-primary transition-colors">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                {query && (
                    <p className="mt-1.5 px-1 text-[10px] text-muted-light">
                        {filtered.length} match{filtered.length !== 1 ? "es" : ""} for "{query}"
                    </p>
                )}
            </div>

            {/* Race Cards */}
            <div className="space-y-3 px-4">
                {filtered.length > 0 ? (
                    filtered.map((race, idx) => (
                        <div
                            key={race.id}
                            className="animate-slide-up"
                            style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
                        >
                            <RaceCard race={race} />
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center">
                        <p className="text-2xl mb-2">🔍</p>
                        <p className="text-sm font-semibold text-text-primary">No results found</p>
                        <p className="text-xs text-muted-light mt-1">Try a horse name, jockey, or race time</p>
                    </div>
                )}
            </div>
        </div>
    );
}
