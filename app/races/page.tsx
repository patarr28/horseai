"use client";

import { useState, useEffect, useMemo } from "react";
import RaceCard from "@/components/RaceCard";
import { Trophy, Search, X, Loader2, Users, SwatchBook, GraduationCap, Filter } from "lucide-react";
import { Race, Horse } from "@/lib/types";

type FilterType = "All" | "Jockeys" | "Horses" | "Trainers";

export default function RacesPage() {
    const [query, setQuery] = useState("");
    const [races, setRaces] = useState<Race[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>("All");

    useEffect(() => {
        async function load() {
            try {
                // Fetch all 4 days of the festival to ensure robust search
                const FESTIVAL_DAYS = [
                    "2026-03-10",
                    "2026-03-11",
                    "2026-03-12",
                    "2026-03-13",
                ];

                const promises = FESTIVAL_DAYS.map(async (date) => {
                    const res = await fetch(`/api/racing?date=${date}`);
                    const json = await res.json();
                    return json.data || [];
                });

                const allDaysRaces = (await Promise.all(promises)).flat();
                setRaces(allDaysRaces);
            } catch (err) {
                console.error("Error loading festival races:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Optimized filtering and sorting logic
    const filteredResults = useMemo(() => {
        let results = [...races];
        const q = query.toLowerCase().trim();

        if (q || activeFilter !== "All") {
            results = results.filter((race) => {
                const matchesQuery = !q ||
                    race.name.toLowerCase().includes(q) ||
                    race.time.includes(q) ||
                    race.horses.some((h) =>
                        h.name.toLowerCase().includes(q) ||
                        h.jockey.toLowerCase().includes(q) ||
                        h.trainer.toLowerCase().includes(q)
                    );

                if (!matchesQuery) return false;

                // Handle specific filters
                if (activeFilter === "Horses") {
                    return race.horses.some(h => h.name.toLowerCase().includes(q));
                }
                if (activeFilter === "Jockeys") {
                    return race.horses.some(h => h.jockey.toLowerCase().includes(q));
                }
                if (activeFilter === "Trainers") {
                    return race.horses.some(h => h.trainer.toLowerCase().includes(q));
                }

                return true;
            });
        }

        return results;
    }, [races, query, activeFilter]);

    const filterOptions = [
        { id: "Jockeys", icon: Users, label: "Jockeys" },
        { id: "Horses", icon: SwatchBook, label: "Horses" },
        { id: "Trainers", icon: GraduationCap, label: "Trainers" },
    ] as const;

    if (loading) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
                <p className="text-sm font-medium text-muted">Indexing Festival Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-24">
            {/* Header */}
            <header className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-neon-green" />
                    <h1 className="text-lg font-bold text-text-primary italic tracking-tight uppercase">Festival Explorer</h1>
                    <span className="ml-auto font-mono-data text-[10px] px-2 py-0.5 rounded bg-neon-green/10 border border-neon-green/20 text-neon-green animate-pulse">
                        4-DAY LIVE STREAM
                    </span>
                </div>
            </header>

            {/* Sticky Search & Filters */}
            <div className="sticky top-0 z-30 bg-terminal-bg/80 backdrop-blur-md px-4 pb-4 pt-2 border-b border-surface-border/50">
                <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2.5 transition-all focus-within:border-neon-green/40 focus-within:ring-1 focus-within:ring-neon-green/20">
                    <Search className="h-4 w-4 shrink-0 text-muted" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Scan entries, metrics, or teams..."
                        className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-muted/60 outline-none"
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="text-muted hover:text-text-primary transition-colors">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Filter Row */}
                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button
                        onClick={() => setActiveFilter("All")}
                        className={`flex whitespace-nowrap items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === "All"
                                ? "bg-neon-green text-terminal-bg shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                                : "bg-surface border border-surface-border text-muted-light hover:border-neon-green/30"
                            }`}
                    >
                        <Filter className="h-3 w-3" />
                        All Results
                    </button>
                    {filterOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setActiveFilter(opt.id as FilterType)}
                            className={`flex whitespace-nowrap items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === opt.id
                                    ? "bg-neon-green text-terminal-bg shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                                    : "bg-surface border border-surface-border text-muted-light hover:border-neon-green/30"
                                }`}
                        >
                            <opt.icon className="h-3 w-3" />
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Meta */}
            {query && (
                <div className="px-4 py-3">
                    <p className="text-[10px] font-mono-data text-muted-light uppercase tracking-widest">
                        Found {filteredResults.length} tactical matches for <span className="text-neon-green">"{query}"</span>
                    </p>
                </div>
            )}

            {/* Race Cards */}
            <div className="space-y-4 px-4 mt-2">
                {filteredResults.length > 0 ? (
                    filteredResults.map((race, idx) => (
                        <div
                            key={race.id}
                            className="animate-slide-up"
                            style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
                        >
                            <RaceCard race={race} />
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full border border-surface-border flex items-center justify-center mb-4 opacity-50">
                            <Search className="h-6 w-6 text-muted" />
                        </div>
                        <p className="text-sm font-black text-text-primary uppercase tracking-widest">No Intelligence Found</p>
                        <p className="text-[10px] text-muted-light mt-2 uppercase tracking-tight">Try adjusting your filters or query</p>
                    </div>
                )}
            </div>
        </div>
    );
}
