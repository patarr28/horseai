"use client";

import { useState, useEffect } from "react";
import { getValueBets } from "@/lib/value-engine";
import RaceCard from "@/components/RaceCard";
import Link from "next/link";
import { Zap, User, TrendingUp, Flame, Target, Loader2 } from "lucide-react";
import GeminiBestBet from "@/components/GeminiBestBet";

export default function HomePage() {
  const [activeDay, setActiveDay] = useState(0);
  const [timeDisplay, setTimeDisplay] = useState("");
  const [schedule, setSchedule] = useState<{ date: string; label: string; races: any[] }[]>([]);
  const [loading, setLoading] = useState(true);

  // Live "festival countdown/time" display
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeDisplay(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchRaces() {
      try {
        const FESTIVAL_DAYS = [
          { date: "2026-03-10", label: "TUE (DAY 1)" },
          { date: "2026-03-11", label: "WED (DAY 2)" },
          { date: "2026-03-12", label: "THU (DAY 3)" },
          { date: "2026-03-13", label: "FRI (DAY 4)" },
        ];

        const promises = FESTIVAL_DAYS.map(async (day) => {
          const res = await fetch(`/api/racing?date=${day.date}`);
          const data = await res.json();
          return { date: day.date, label: day.label, races: data.data || [] };
        });

        const scheduleData = await Promise.all(promises);
        setSchedule(scheduleData);
      } catch (error) {
        console.error("Failed to fetch races:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRaces();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center space-y-4">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-neon-green/10 border border-neon-green/30">
          <Loader2 className="h-6 w-6 animate-spin text-neon-green" />
          <div className="absolute inset-0 rounded-xl animate-pulse-glow" />
        </div>
        <p className="font-mono-data text-neon-green font-bold text-sm uppercase tracking-widest">Waking the AI...</p>
      </div>
    );
  }

  const currentDay = schedule[activeDay] || { races: [] };

  const allValueBets = getValueBets(currentDay.races);
  const topBanker = currentDay.races[0]?.horses?.find((h: any) =>
    h.signals.some((s: any) => s.type === "BANKER")
  )?.name ?? "N/A";
  const topValueBet = allValueBets[0];
  const valueBetsCount = allValueBets.filter((v) => v.edge > 20).length;

  return (
    <div className="animate-fade-in pb-24">
      {/* ── Premium Header ── */}
      <header className="relative overflow-hidden px-4 pt-5 pb-4">
        {/* Ambient glow behind header */}
        <div className="pointer-events-none absolute -top-10 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-neon-green/5 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Animated logo mark */}
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-neon-green/30 bg-neon-green/10">
              <Zap className="h-5 w-5 text-neon-green animate-pulse-glow" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-xl animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-text-primary leading-none">
                Festival Whisperer
              </h1>
              <p className="text-[10px] font-medium text-muted-light mt-0.5 tracking-wider uppercase">
                Cheltenham 2026 · AI Command Centre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live clock */}
            <div className="flex items-center gap-1.5 rounded-lg border border-neon-green/20 bg-neon-green/5 px-2.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
              <span className="font-mono-data text-[11px] font-semibold text-neon-green">
                {timeDisplay}
              </span>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border bg-surface transition-colors hover:border-neon-green/30">
              <User className="h-4 w-4 text-muted-light" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Intelligence Ribbon ── */}
      <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-neon-green/15 bg-gradient-to-r from-neon-green/5 via-neon-green/3 to-transparent">
        <div className="flex items-stretch divide-x divide-surface-border/50">
          <Link href="/insights" className="group flex flex-1 flex-col items-center gap-1 px-3 py-3 transition-colors hover:bg-neon-green/5">
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-neon-green" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-light">Banker</span>
            </div>
            <span className="text-xs font-bold text-neon-green truncate max-w-[72px]">{topBanker}</span>
          </Link>
          <Link href="/insights" className="group flex flex-1 flex-col items-center gap-1 px-3 py-3 transition-colors hover:bg-value-orange/5">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-value-orange" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-light">Value</span>
            </div>
            <span className="text-xs font-bold text-value-orange">{valueBetsCount} Bets</span>
          </Link>
          <Link href={`/horses/${topValueBet?.horse.id}`} className="group flex flex-1 flex-col items-center gap-1 px-3 py-3 transition-colors hover:bg-neon-green/5">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-neon-green" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-light">Top Edge</span>
            </div>
            <span className="text-xs font-bold text-neon-green">
              +{topValueBet?.edge}%
            </span>
          </Link>
        </div>
      </div>

      <GeminiBestBet date={currentDay?.date} />

      {/* ── Day Tabs ── */}
      <div className="sticky top-0 z-40 border-b border-surface-border/50 bg-terminal-bg/96 backdrop-blur-xl">
        <div className="flex gap-0 px-4">
          {schedule.map((day, i) => (
            <button
              key={day.date}
              onClick={() => setActiveDay(i)}
              className={`relative px-4 py-3 text-sm font-semibold transition-all ${activeDay === i
                ? "text-neon-green"
                : "text-muted hover:text-muted-light"
                }`}
            >
              {day.label}
              {activeDay === i && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(0,255,136,0.6)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Race Cards ── */}
      <div className="space-y-3 px-4 pt-4">
        {currentDay.races.length > 0 ? (
          currentDay.races.map((race, idx) => (
            <div
              key={race.id}
              className="animate-slide-up"
              style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "both" }}
            >
              <RaceCard race={race} />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-surface-border bg-surface animate-float">
              <span className="text-4xl">🏇</span>
            </div>
            <p className="text-sm font-semibold text-text-secondary">No races scheduled yet</p>
            <p className="mt-1 text-xs text-muted">Cards appear closer to race day</p>
          </div>
        )}
      </div>

      {/* ── Day Summary Strip ── */}
      {currentDay.races.length > 0 && (
        <div className="mx-4 mt-5 mb-2 rounded-2xl border border-surface-border bg-surface overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-surface-border/50">
            <div className="flex flex-col items-center py-4">
              <p className="text-2xl font-bold text-neon-green text-glow-green">
                {currentDay.races.length}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-light mt-0.5">Races</p>
            </div>
            <div className="flex flex-col items-center py-4">
              <p className="text-2xl font-bold text-value-orange">
                {currentDay.races.reduce((acc, r) => acc + r.runners, 0)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-light mt-0.5">Runners</p>
            </div>
            <div className="flex flex-col items-center py-4">
              <p className="text-2xl font-bold text-text-primary">
                {currentDay.races.reduce((acc, r) => acc + r.topSignals.length, 0)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-light mt-0.5">Signals</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
