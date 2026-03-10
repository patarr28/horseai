"use client";

import { useState, useEffect } from "react";
import RaceCard from "@/components/RaceCard";
import { Zap, TrendingUp, Flame, Target, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GeminiBestBet from "@/components/GeminiBestBet";
import SilhouetteBackground from "@/components/SilhouetteBackground";
import SentimentChart from "@/components/SentimentChart";
import MarketMovers from "@/components/MarketMovers";
import SubscribeModal from "@/components/SubscribeModal";
import SponsorshipModal from "@/components/SponsorshipModal";
import DonationModal from "@/components/DonationModal";
import DailyAIOutlook from "@/components/DailyAIOutlook";
import ConsensusBoard from "@/components/ConsensusBoard";





export default function HomePage() {
  const [activeDay, setActiveDay] = useState(0);
  const [activeRace, setActiveRace] = useState(0);
  const [schedule, setSchedule] = useState<{ date: string; label: string; races: any[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isSponsorOpen, setIsSponsorOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);




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

  // 1. All horses across the day
  const allHorses = currentDay.races.flatMap((r: any) => r.horses || []);

  // Horse of the Day: Highest AI Rating with a decent win probability
  const sortedByAi = [...allHorses].sort((a, b) => b.aiRating - a.aiRating);
  const horseOfTheDay = sortedByAi[0];

  // Lots of Buzz: Highest crowdPick
  const sortedByBuzz = [...allHorses].sort((a, b) => b.crowdPickPercent - a.crowdPickPercent);
  const buzzingHorse = sortedByBuzz[0];

  // Longshot: High AI Rating but decimal odds > 10.0
  const longshots = allHorses.filter((h: any) => h.oddsDecimal > 10.0);
  const sortedLongshots = [...longshots].sort((a, b) => b.aiRating - a.aiRating);
  const topLongshot = sortedLongshots[0];

  const totalRaces = currentDay.races.length;
  const totalRunners = allHorses.length;
  const selectedRace = currentDay.races[activeRace] || currentDay.races[0] || null;



  return (
    <div className="relative min-h-screen bg-terminal-bg animate-fade-in pb-24">
      <SilhouetteBackground />

      {/* ── Sticky Nav Block: Banner + Header + Day Tabs + Race Time Picker ── */}
      <div className="sticky top-0 z-[60] w-full">

        {/* Banner */}
        <div className="relative z-10 bg-neon-green/[0.07] border-b border-neon-green/[0.15] px-4 py-2 flex items-center justify-between overflow-hidden liquid-sheen backdrop-blur-2xl">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <Zap className="h-3 w-3 text-neon-green relative z-10" />
              <div className="absolute inset-0 rounded-full animate-liquid-pulse opacity-50" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neon-green drop-shadow-[0_0_5px_rgba(0,255,136,0.35)]">
              Intelligence Advantage Active
            </span>
          </div>
          <span className="text-[8px] font-bold text-muted-light uppercase tracking-tighter opacity-70">
            Data Only. <span className="text-risk-red font-black opacity-100">Gamble Safely.</span>
          </span>
        </div>

        {/* Header */}
        <header className="relative overflow-hidden px-4 pt-3 pb-3 bg-black/85 backdrop-blur-2xl border-b border-white/[0.06] liquid-sheen">
          <div className="pointer-events-none absolute -top-12 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full bg-neon-green/[0.06] blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,255,136,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] border border-neon-green/35">
                <Image src="/logo.png" alt="HorseRacingAi Logo" width={36} height={36} className="object-cover" />
                <div className="absolute inset-0 rounded-xl animate-liquid-pulse mix-blend-overlay opacity-40" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-text-primary leading-none">HorseRacingAi</h1>
                <p className="text-[9px] font-bold text-neon-green/75 mt-0.5 tracking-widest uppercase drop-shadow-[0_0_4px_rgba(0,255,136,0.3)]">Data-Driven Racing Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setIsDonationOpen(true)} className="rounded-lg px-2.5 py-1.5 text-[8px] font-black uppercase text-value-orange border border-value-orange/30 bg-value-orange/[0.06] transition-all active:scale-90 shadow-[inset_0_1px_0_rgba(255,149,0,0.1)]">Support</button>
              <button onClick={() => setIsSponsorOpen(true)} className="rounded-lg px-2.5 py-1.5 text-[8px] font-black uppercase text-text-primary border border-white/[0.08] bg-white/[0.04] transition-all active:scale-90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">Sponsor</button>
              <button onClick={() => setIsSubscribeOpen(true)} className="rounded-lg px-2.5 py-1.5 text-[8px] font-black uppercase text-black bg-neon-green transition-all active:scale-90 shadow-[0_0_14px_rgba(0,255,136,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]">Join</button>
            </div>
          </div>
        </header>

        {/* Day Tabs */}
        <div className="bg-black/90 backdrop-blur-2xl border-b border-white/[0.05]">
          <div className="flex gap-0 px-2 overflow-x-auto no-scrollbar">
            {schedule.map((day, i) => (
              <button
                key={day.date}
                onClick={() => { setActiveDay(i); setActiveRace(0); }}
                className={`relative flex-1 px-3 py-2.5 min-h-[40px] text-[10px] font-black whitespace-nowrap transition-all active:scale-95 ${activeDay === i
                  ? "text-neon-green drop-shadow-[0_0_6px_rgba(0,255,136,0.4)]"
                  : "text-muted hover:text-muted-light"
                }`}
              >
                {day.label}
                {activeDay === i && (
                  <>
                    <span className="absolute bottom-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(0,255,136,0.8)]" />
                    <span className="absolute inset-0 bg-neon-green/[0.05]" />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Race Time Picker */}
        {currentDay.races.length > 0 && (
          <div className="bg-black/95 backdrop-blur-2xl border-b border-white/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
              {currentDay.races.map((race: any, i: number) => (
                <button
                  key={race.id}
                  onClick={() => setActiveRace(i)}
                  className={`shrink-0 flex flex-col items-center rounded-xl px-3 py-1.5 min-w-[56px] transition-all active:scale-95 border ${activeRace === i
                    ? "bg-neon-green/[0.12] border-neon-green/35 shadow-[0_0_10px_rgba(0,255,136,0.12),inset_0_1px_0_rgba(0,255,136,0.1)]"
                    : "bg-surface/40 border-surface-border/40 hover:border-neon-green/20"
                  }`}
                >
                  <span className={`text-[11px] font-black font-mono-data leading-none ${activeRace === i ? "text-neon-green drop-shadow-[0_0_4px_rgba(0,255,136,0.6)]" : "text-text-primary"}`}>
                    {race.time || `R${i + 1}`}
                  </span>
                  <span className={`text-[8px] font-bold mt-0.5 leading-none max-w-[52px] truncate ${activeRace === i ? "text-neon-green/70" : "text-muted"}`}>
                    {race.name?.split(" ").slice(-1)[0] || `Race ${i + 1}`}
                  </span>
                  {activeRace === i && (
                    <span className="mt-1 h-0.5 w-4 rounded-full bg-neon-green shadow-[0_0_6px_rgba(0,255,136,0.8)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <SubscribeModal isOpen={isSubscribeOpen} onClose={() => setIsSubscribeOpen(false)} />
      <SponsorshipModal isOpen={isSponsorOpen} onClose={() => setIsSponsorOpen(false)} />
      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />

      {/* ── Daily AI Intel ── */}
      <section className="relative z-10 pt-4">
        <DailyAIOutlook races={currentDay.races} dayLabel={currentDay.label} />
      </section>

      <div className="section-divider" />

      {/* ── Intelligence Ribbon ── */}
      <div className="mx-4 mb-4 grid grid-cols-3 gap-3">
        <Link href={`/horses/${horseOfTheDay?.id}`} className="group flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full border border-neon-green/40 bg-neon-green/10 flex items-center justify-center shadow-[0_0_14px_rgba(0,255,136,0.15)] group-active:scale-95 transition-transform">
            <Flame className="h-5 w-5 text-neon-green animate-signal-buzz" />
          </div>
          <div className="text-center px-1">
            <p className="text-[7px] font-black uppercase tracking-wider text-muted-light mb-0.5">Horse of Day</p>
            <p className="text-[9px] font-black text-neon-green leading-tight text-glow-green break-words hyphens-auto">{horseOfTheDay?.name || "N/A"}</p>
          </div>
        </Link>
        <Link href={`/horses/${buzzingHorse?.id}`} className="group flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full border border-value-orange/40 bg-value-orange/10 flex items-center justify-center shadow-[0_0_14px_rgba(255,136,0,0.15)] group-active:scale-95 transition-transform">
            <TrendingUp className="h-5 w-5 text-value-orange animate-pulse" />
          </div>
          <div className="text-center px-1">
            <p className="text-[7px] font-black uppercase tracking-wider text-muted-light mb-0.5">Market Buzz</p>
            <p className="text-[9px] font-black text-value-orange leading-tight break-words hyphens-auto">{buzzingHorse?.name || "N/A"}</p>
          </div>
        </Link>
        <Link href={`/horses/${topLongshot?.id}`} className="group flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full border border-neon-green/40 bg-neon-green/10 flex items-center justify-center shadow-[0_0_14px_rgba(0,255,136,0.15)] group-active:scale-95 transition-transform">
            <Target className="h-5 w-5 text-neon-green" />
          </div>
          <div className="text-center px-1">
            <p className="text-[7px] font-black uppercase tracking-wider text-muted-light mb-0.5">Longshot</p>
            <p className="text-[9px] font-black text-neon-green leading-tight break-words hyphens-auto">{topLongshot?.name || "N/A"}</p>
            {topLongshot?.odds && <p className="text-[8px] font-mono text-neon-green/70 mt-0.5">({topLongshot.odds})</p>}
          </div>
        </Link>
      </div>

      <div className="section-divider" />

      {/* ── Smart Forecast ── */}
      <section className="space-y-6">
        <div className="px-4">
          <span className="section-label-shield shadow-[0_0_20px_rgba(0,255,136,0.15)]">Proprietary Forecasts</span>
        </div>
        <GeminiBestBet date={currentDay?.date} />
        <MarketMovers horses={allHorses} />
        <SentimentChart horses={allHorses} />
      </section>

      <div className="section-divider" />

      {/* ── Tipster Consensus Board ── */}
      <section className="space-y-0">
        <div className="px-4 mb-3">
          <span className="section-label-shield">Live Tipster Consensus</span>
        </div>
        <ConsensusBoard date={currentDay.date} />
      </section>

      <div className="section-divider" />

      {/* ── Selected Race Card ── */}
      <section className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="section-label-shield">Race Card</span>
          {currentDay.races.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface/50 border border-surface-border/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <span className="text-[9px] font-black text-neon-green font-mono-data">{activeRace + 1}</span>
              <span className="text-[9px] text-muted">/</span>
              <span className="text-[9px] font-bold text-muted">{totalRaces}</span>
              <span className="text-[8px] text-muted ml-0.5 uppercase tracking-widest">races</span>
              <span className="mx-1 h-3 w-px bg-surface-border/60" />
              <span className="text-[8px] text-muted uppercase tracking-widest">{totalRunners} runners</span>
            </div>
          )}
        </div>

        {selectedRace ? (
          <div className="animate-slide-up">
            <RaceCard race={selectedRace} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-surface-border bg-surface animate-float">
              <span className="text-4xl">🏇</span>
            </div>
            <p className="text-sm font-semibold text-text-secondary">No races scheduled yet</p>
            <p className="mt-1 text-xs text-muted">Cards appear closer to race day</p>
          </div>
        )}

        {/* Day summary strip */}
        {currentDay.races.length > 0 && (
          <div className="mt-6 rounded-2xl glass-panel relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-mesh-liquid opacity-20 pointer-events-none" />
            <div className="relative z-10 grid grid-cols-3 divide-x divide-surface-border/30">
              <div className="flex flex-col items-center py-4">
                <p className="text-2xl font-black text-neon-green text-glow-green">{totalRaces}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-light mt-1 px-2 py-0.5 rounded bg-neon-green/5 border border-neon-green/10">Races</p>
              </div>
              <div className="flex flex-col items-center py-4">
                <p className="text-2xl font-black text-value-orange">{totalRunners}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-light mt-1 px-2 py-0.5 rounded bg-value-orange/5 border border-value-orange/10">Runners</p>
              </div>
              <div className="flex flex-col items-center py-4">
                <p className="text-2xl font-black text-white">{currentDay.races.reduce((acc: number, r: any) => acc + r.topSignals.length, 0)}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-light mt-1 px-2 py-0.5 rounded bg-white/5 border border-white/10">Signals</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
