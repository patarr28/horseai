"use client";

import { useState, useEffect } from "react";
import { getValueBets } from "@/lib/value-engine";
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





export default function HomePage() {
  const [activeDay, setActiveDay] = useState(0);
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

  // Analytics for the Day Summary
  const totalRaces = currentDay.races.length;
  const totalRunners = allHorses.length;
  const daySummaryText = totalRaces > 0
    ? `A dynamic ${totalRaces}-race card featuring ${totalRunners} runners. Today's standout metric is ${horseOfTheDay?.name}'s commanding AI rating, while ${topLongshot ? `${topLongshot.name} offers intriguing value at ${topLongshot.odds}` : 'markets remain tight across the board'}.`
    : "No races scheduled for this day.";



  return (
    <div className="relative min-h-screen bg-terminal-bg animate-fade-in pb-24">
      <SilhouetteBackground />

      {/* ── Intelligence Advantage Banner ── */}
      <div className="sticky top-0 z-[60] w-full">
        <div className="relative z-10 bg-neon-green/10 border-b border-neon-green/20 px-4 py-2 flex items-center justify-between overflow-hidden backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-neon-green animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neon-green">
              Intelligence Advantage Active
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-3">
              <span className="text-[9px] font-medium text-text-secondary">
                <span className="text-neon-green font-bold">●</span> Live Data Tracking
              </span>
              <span className="text-[9px] font-medium text-text-secondary">
                <span className="text-neon-green font-bold">●</span> Tipster Consensus
              </span>
              <span className="text-[9px] font-medium text-text-secondary">
                <span className="text-neon-green font-bold">●</span> AI Analytics
              </span>
            </div>
            <div className="flex items-center gap-2 border-l border-neon-green/20 pl-4">
              <span className="text-[8px] font-bold text-muted-light uppercase tracking-tighter opacity-80 leading-none">
                Not Advice. Data Only. <span className="text-risk-red">Gamble Safely.</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Premium Header ── */}
        <header className="relative overflow-hidden px-4 pt-5 pb-4 bg-terminal-bg/90 backdrop-blur-xl border-b border-surface-border/30">
          {/* Ambient glow behind header */}
          <div className="pointer-events-none absolute -top-10 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-neon-green/5 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Animated logo mark */}
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-neon-green/40 bg-black overflow-hidden shadow-[0_0_15px_rgba(0,255,136,0.15)]">
                <Image src="/logo.png" alt="HorseRacingAi Logo" width={40} height={40} className="object-cover" />
                <div className="absolute inset-0 rounded-xl animate-pulse-glow mix-blend-overlay" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-text-primary leading-none">
                  HorseRacingAi
                </h1>
                <p className="text-[10px] font-medium text-neon-green/80 mt-0.5 tracking-wider uppercase">
                  Data-Driven Racing Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDonationOpen(true)}
                className="rounded px-2.5 py-1 text-[9px] font-bold uppercase text-value-orange border border-value-orange/30 bg-value-orange/5 hover:bg-value-orange/10 transition-all active:scale-95"
              >
                Buy Dev a Pint
              </button>
              <button
                onClick={() => setIsSponsorOpen(true)}
                className="rounded px-2.5 py-1 text-[9px] font-bold uppercase text-text-primary border border-surface-border bg-surface hover:text-neon-green hover:border-neon-green/30 transition-all active:scale-95"
              >
                Sponsor Us
              </button>
              <button
                onClick={() => setIsSubscribeOpen(true)}
                className="rounded px-2.5 py-1 text-[9px] font-bold uppercase text-terminal-bg bg-neon-green hover:bg-neon-green/80 transition-all active:scale-95 shadow-[0_0_10px_rgba(0,255,136,0.2)]"
              >
                Join Email List
              </button>
            </div>
          </div>
        </header>
      </div>

      <SubscribeModal isOpen={isSubscribeOpen} onClose={() => setIsSubscribeOpen(false)} />
      <SponsorshipModal isOpen={isSponsorOpen} onClose={() => setIsSponsorOpen(false)} />
      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />


      {/* ── Daily AI Intel Context ── */}
      <section className="relative z-10 pt-4">
        <DailyAIOutlook races={currentDay.races} dayLabel={currentDay.label} />
      </section>

      <div className="section-divider" />

      {/* ── The Intelligence Advantage ── */}
      <section className="relative z-10 mx-4 mb-8 mt-2 overflow-hidden rounded-2xl glass-panel p-6 shadow-2xl">
        <div className="absolute inset-0 bg-mesh-liquid opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="section-label-shield">Proprietary Advantage</span>
            </div>
            <h3 className="text-base font-black uppercase tracking-tighter text-text-primary leading-tight">
              Why use <span className="text-glow-green">HorseRacingAi?</span>
            </h3>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed">
              We don't just show you data; we weaponize it. Our engine aggregates these high-fidelity streams into a single **Consensus Score**, stripping away market noise to reveal the <span className="text-neon-green font-bold">true mathematical value</span> hidden from the public.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-neon-green shadow-[0_0_5px_rgba(0,255,136,1)]" />
                <span className="text-[9px] font-black text-text-primary uppercase tracking-widest">Live Feed</span>
              </div>
              <p className="text-[10px] text-muted-light leading-tight">Micro-second metadata and real-time API odds tracking.</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-neon-green shadow-[0_0_5px_rgba(0,255,136,1)]" />
                <span className="text-[9px] font-black text-text-primary uppercase tracking-widest">Tipster Engine</span>
              </div>
              <p className="text-[10px] text-muted-light leading-tight">Aggregated consensus from 12+ elite specialists.</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-neon-green shadow-[0_0_5px_rgba(0,255,136,1)]" />
                <span className="text-[9px] font-black text-text-primary uppercase tracking-widest">Gemini AI Core</span>
              </div>
              <p className="text-[10px] text-muted-light leading-tight">Deep-pattern recognition and ancestry metrics.</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-neon-green shadow-[0_0_5px_rgba(0,255,136,1)]" />
                <span className="text-[9px] font-black text-text-primary uppercase tracking-widest">Social Signals</span>
              </div>
              <p className="text-[10px] text-muted-light leading-tight">Sentiment analysis from X and live parade ring buzz.</p>
            </div>
          </div>

          <div className="rounded-xl bg-neon-green/5 border border-neon-green/10 p-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-neon-green mb-2 flex items-center gap-2">
              <Zap className="h-3 w-3" /> Meet Your AI Intelligence Officer
            </h4>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
              Need a clinical **Bet Helper**? Chat with our bot to dissect any race. Feeling lucky? Tell it your dog's name, or a birthday, and find matching <span className="text-neon-green font-bold">"Luck Picks"</span> instantly.
            </p>
            <div className="pt-3 border-t border-neon-green/10">
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Beyond chat, access our **Full Race Overviews** and **Detailed AI Reviews** for every runner on the card, providing a 360° tactical breakdown before you place a single bet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Intelligence Ribbon ── */}
      <div className="mx-4 mb-4 overflow-hidden rounded-2xl glass-panel relative p-1 shadow-xl">
        <div className="absolute inset-0 bg-mesh-liquid opacity-10 pointer-events-none" />
        <div className="relative z-10 flex items-stretch divide-x divide-surface-border/30">
          <Link href={`/horses/${horseOfTheDay?.id}`} className="group flex flex-1 flex-col items-center gap-1 px-3 py-3 transition-colors hover:bg-neon-green/10">
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-neon-green animate-signal-buzz" />
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-light">Horse of Day</span>
            </div>
            <span className="text-xs font-black text-neon-green truncate max-w-[80px] text-glow-green">{horseOfTheDay?.name || "N/A"}</span>
          </Link>
          <Link href={`/horses/${buzzingHorse?.id}`} className="group flex flex-1 flex-col items-center gap-1 px-3 py-3 transition-colors hover:bg-value-orange/10">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-value-orange animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-light">Market Buzz</span>
            </div>
            <span className="text-xs font-black text-value-orange truncate max-w-[80px]">{buzzingHorse?.name || "N/A"}</span>
          </Link>
          <Link href={`/horses/${topLongshot?.id}`} className="group flex flex-1 flex-col items-center gap-1 px-3 py-3 transition-colors hover:bg-neon-green/10 text-center">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Target className="h-3 w-3 text-neon-green" />
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-light">Longshot</span>
            </div>
            <span className="text-xs font-black text-neon-green truncate max-w-[80px]">
              {topLongshot?.name || "N/A"} <span className="text-[9px] opacity-80 font-mono">({topLongshot?.odds || "-"})</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="section-divider" />

      {/* ── Smart Forecast Components ── */}
      <section className="space-y-6">
        <div className="px-4">
          <span className="section-label-shield shadow-[0_0_20px_rgba(0,255,136,0.15)]">Proprietary Forecasts</span>
        </div>
        <GeminiBestBet date={currentDay?.date} />
        <MarketMovers horses={allHorses} />
        <SentimentChart horses={allHorses} />
      </section>

      <div className="section-divider" />

      {/* ── Main Schedule ── */}
      <section>
        <div className="px-4 mb-4">
          <span className="section-label-shield">Race Schedule</span>
        </div>

        {/* ── Day Tabs ── */}
        <div className="sticky top-[124px] z-40 border-b border-surface-border/50 bg-terminal-bg/96 backdrop-blur-xl">
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
          <div className="mx-4 mt-8 mb-4 rounded-2xl glass-panel relative overflow-hidden shadow-2xl border-neon-green/10">
            <div className="absolute inset-0 bg-mesh-liquid opacity-20 pointer-events-none" />
            <div className="relative z-10 grid grid-cols-3 divide-x divide-surface-border/30">
              <div className="flex flex-col items-center py-5">
                <p className="text-2xl font-black text-neon-green text-glow-green">
                  {currentDay.races.length}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-light mt-1.5 px-2 py-0.5 rounded bg-neon-green/5 border border-neon-green/10">Races</p>
              </div>
              <div className="flex flex-col items-center py-5">
                <p className="text-2xl font-black text-value-orange">
                  {currentDay.races.reduce((acc, r) => acc + r.runners, 0)}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-light mt-1.5 px-2 py-0.5 rounded bg-value-orange/5 border border-value-orange/10">Runners</p>
              </div>
              <div className="flex flex-col items-center py-5">
                <p className="text-2xl font-black text-white">
                  {currentDay.races.reduce((acc, r) => acc + r.topSignals.length, 0)}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-light mt-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10">Signals</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
