"use client";

import { X, Trophy, Star, Crown, ChevronRight, Zap } from "lucide-react";

interface SponsorshipModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TIERS = [
    {
        name: "Silver Partner",
        price: "£49/mo",
        icon: Trophy,
        color: "text-slate-400",
        features: ["Featured in daily email list", "Brand logo on race pages", "Discord access"],
    },
    {
        name: "Gold Partner",
        price: "£149/mo",
        icon: Star,
        color: "text-value-orange",
        features: ["Top-of-page banner placement", "AI-generated 'Sponsor Picks'", "Priority API access"],
        recommended: true
    },
    {
        name: "Platinum Elite",
        price: "£499/mo",
        icon: Crown,
        color: "text-neon-green",
        features: ["Full platform skinning", "Direct Tipster API integration", "Custom data dashboards"],
    }
];

export default function SponsorshipModal({ isOpen, onClose }: SponsorshipModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] glass-panel-premium p-10 shadow-[0_0_100px_rgba(0,0,0,0.9)]">
                <div className="absolute inset-0 bg-mesh-liquid opacity-40 pointer-events-none" />
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-neon-green/5 blur-3xl" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 text-muted-light hover:bg-surface hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <Zap className="h-5 w-5 text-neon-green animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-green">Monetization Engine</span>
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-text-primary">
                        Partner with <span className="text-glow-green">Intelligence</span>
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary max-w-md">
                        Scale your reach by sponsoring the world's most advanced horse racing data terminal. Reach elite punters and data-syndicates.
                    </p>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {TIERS.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative flex flex-col rounded-xl border p-5 transition-all hover:scale-[1.02] ${tier.recommended
                                    ? "bg-neon-green/5 border-neon-green/30 shadow-[0_0_20px_rgba(0,255,136,0.1)]"
                                    : "bg-surface/50 border-surface-border hover:border-neon-green/20"
                                    }`}
                            >
                                {tier.recommended && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-neon-green px-3 py-0.5 text-[8px] font-black uppercase tracking-widest text-terminal-bg">
                                        Most Popular
                                    </div>
                                )}

                                <tier.icon className={`h-8 w-8 ${tier.color} mb-4`} />
                                <h3 className="text-sm font-black uppercase tracking-tight text-text-primary">{tier.name}</h3>
                                <p className="text-xl font-black text-neon-green mt-1">{tier.price}</p>

                                <ul className="mt-4 space-y-2 flex-1">
                                    {tier.features.map((f) => (
                                        <li key={f} className="text-[10px] text-muted-light flex items-center gap-2">
                                            <ChevronRight className="h-2 w-2 text-neon-green" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <button className="mt-6 w-full rounded-lg bg-surface-border py-2.5 text-[10px] font-black uppercase tracking-widest text-text-primary transition-all hover:bg-neon-green hover:text-terminal-bg">
                                    Apply Now
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-surface-border/30 pt-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-light uppercase tracking-widest">Custom Partnership?</span>
                            <span className="text-xs text-text-secondary">Direct channel open for enterprise scale.</span>
                        </div>
                        <a
                            href="mailto:partners@horseracingai.com"
                            className="rounded-xl border border-neon-green/40 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-neon-green transition-all hover:bg-neon-green/5"
                        >
                            Contact Intelligence Office
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
