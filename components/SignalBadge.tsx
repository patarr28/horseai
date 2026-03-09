"use client";

import { Signal } from "@/lib/types";

interface SignalBadgeProps {
    type: Signal["type"];
    label: string;
    size?: "sm" | "md";
}

const config: Record<
    Signal["type"],
    { emoji: string; color: string; bg: string; border: string; glow?: string; animate?: string }
> = {
    BANKER: {
        emoji: "🔥",
        color: "text-neon-green",
        bg: "bg-neon-green/10",
        border: "border-neon-green/30",
        glow: "shadow-[0_0_10px_rgba(0,255,136,0.2)]",
        animate: "animate-pulse-glow",
    },
    VALUE_BET: {
        emoji: "🐎",
        color: "text-value-orange",
        bg: "bg-value-orange/10",
        border: "border-value-orange/30",
        glow: "shadow-[0_0_8px_rgba(255,149,0,0.15)]",
        animate: "animate-pulse-glow-orange",
    },
    STEAMING: {
        emoji: "📈",
        color: "text-neon-green",
        bg: "bg-neon-green/8",
        border: "border-neon-green/25",
    },
    PUNDIT_PICK: {
        emoji: "📣",
        color: "text-value-orange",
        bg: "bg-value-orange/10",
        border: "border-value-orange/25",
    },
    EXPERT_TIP: {
        emoji: "🎯",
        color: "text-neon-green",
        bg: "bg-neon-green/10",
        border: "border-neon-green/40",
        glow: "shadow-[0_0_12px_rgba(57,255,20,0.25)]",
        animate: "animate-pulse-glow",
    },
    DRIFTING: {
        emoji: "📉",
        color: "text-risk-red",
        bg: "bg-risk-red/10",
        border: "border-risk-red/30",
    },
    OVERHYPED: {
        emoji: "🚨",
        color: "text-risk-red",
        bg: "bg-risk-red/10",
        border: "border-risk-red/30",
    },
    MARKET_MOVER: {
        emoji: "📊",
        color: "text-steaming-purple",
        bg: "bg-steaming-purple/10",
        border: "border-steaming-purple/30",
    },
};

export default function SignalBadge({ type, label, size = "md" }: SignalBadgeProps) {
    const cfg = config[type] ?? config.EXPERT_TIP;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wider transition-all
        ${cfg.bg} ${cfg.border} ${cfg.color} ${cfg.glow ?? ""} ${cfg.animate ?? ""}
        ${size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"}
      `}
        >
            <span>{cfg.emoji}</span>
            {label}
        </span>
    );
}
