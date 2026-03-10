"use client";

import { Signal } from "@/lib/types";

interface SignalBadgeProps {
    type: Signal["type"];
    label: string;
    size?: "sm" | "md";
}

const config: Record<
    Signal["type"],
    { emoji: string; color: string; bg: string; border: string; glow?: string; animate?: string; inset?: string }
> = {
    BANKER: {
        emoji: "🔥",
        color: "text-neon-green",
        bg: "bg-neon-green/[0.12]",
        border: "border-neon-green/35",
        glow: "shadow-[0_0_12px_rgba(0,255,136,0.25),inset_0_1px_0_rgba(0,255,136,0.15)]",
        animate: "animate-pulse-glow",
    },
    VALUE_BET: {
        emoji: "🐎",
        color: "text-value-orange",
        bg: "bg-value-orange/[0.12]",
        border: "border-value-orange/35",
        glow: "shadow-[0_0_10px_rgba(255,149,0,0.2),inset_0_1px_0_rgba(255,149,0,0.12)]",
        animate: "animate-pulse-glow-orange",
    },
    STEAMING: {
        emoji: "📈",
        color: "text-neon-green",
        bg: "bg-neon-green/[0.08]",
        border: "border-neon-green/25",
        glow: "shadow-[inset_0_1px_0_rgba(0,255,136,0.08)]",
    },
    PUNDIT_PICK: {
        emoji: "📣",
        color: "text-value-orange",
        bg: "bg-value-orange/10",
        border: "border-value-orange/25",
        glow: "shadow-[inset_0_1px_0_rgba(255,149,0,0.08)]",
    },
    EXPERT_TIP: {
        emoji: "🎯",
        color: "text-neon-green",
        bg: "bg-neon-green/[0.12]",
        border: "border-neon-green/40",
        glow: "shadow-[0_0_14px_rgba(57,255,20,0.3),inset_0_1px_0_rgba(0,255,136,0.18)]",
        animate: "animate-pulse-glow",
    },
    DRIFTING: {
        emoji: "📉",
        color: "text-risk-red",
        bg: "bg-risk-red/10",
        border: "border-risk-red/30",
        glow: "shadow-[inset_0_1px_0_rgba(255,59,48,0.08)]",
    },
    OVERHYPED: {
        emoji: "🚨",
        color: "text-risk-red",
        bg: "bg-risk-red/10",
        border: "border-risk-red/30",
        glow: "shadow-[inset_0_1px_0_rgba(255,59,48,0.08)]",
    },
    MARKET_MOVER: {
        emoji: "📊",
        color: "text-steaming-purple",
        bg: "bg-steaming-purple/[0.12]",
        border: "border-steaming-purple/35",
        glow: "shadow-[0_0_10px_rgba(139,92,246,0.2),inset_0_1px_0_rgba(139,92,246,0.12)]",
    },
};

export default function SignalBadge({ type, label, size = "md" }: SignalBadgeProps) {
    const cfg = config[type] ?? config.EXPERT_TIP;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border font-black uppercase tracking-wider transition-all backdrop-blur-sm
        ${cfg.bg} ${cfg.border} ${cfg.color} ${cfg.glow ?? ""} ${cfg.animate ?? ""}
        ${size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"}
      `}
        >
            <span className="text-[11px]">{cfg.emoji}</span>
            <span className="tracking-[0.08em]">{label}</span>
        </span>
    );
}
