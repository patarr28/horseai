"use client";

import { X, Beer, Heart, Flame, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AMOUNTS = [
    { id: "pint", label: "Buy a Pint", amount: "£5", icon: Beer, description: "Fuel the next feature update." },
    { id: "round", label: "Buy a Round", amount: "£15", icon: Flame, description: "Significant contribution to compute costs." },
    { id: "barrel", label: "Intelligence Patron", amount: "£50", icon: Heart, description: "Directly funds advanced data signals." }
];

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
    const [selectedAmount, setSelectedAmount] = useState<string | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] glass-panel-premium p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                <div className="absolute inset-0 bg-mesh-liquid opacity-30 pointer-events-none" />

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-48 w-48 rounded-full bg-neon-green/10 blur-3xl opacity-50" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 rounded-lg p-2 text-muted-light hover:bg-white/5 hover:text-white transition-all z-20"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Zap className="h-5 w-5 text-neon-green animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-green">Protocol V1.0</span>
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-text-primary">
                        Buy Dev a <span className="text-glow-green">Pint</span>
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                        Supporting the independent intelligence cycle. Your contributions keep the servers running and the models sharp.
                    </p>

                    <div className="mt-8 space-y-3">
                        {AMOUNTS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedAmount(item.id)}
                                className={`w-full flex items-center gap-4 rounded-2xl border p-4 transition-all text-left group overflow-hidden relative ${selectedAmount === item.id
                                        ? "bg-neon-green/10 border-neon-green/40 shadow-[0_0_20px_rgba(0,255,136,0.1)]"
                                        : "bg-white/5 border-white/5 hover:border-white/10"
                                    }`}
                            >
                                <div className={`p-3 rounded-xl transition-all ${selectedAmount === item.id
                                        ? "bg-neon-green text-terminal-bg"
                                        : "bg-black/40 text-neon-green border border-white/5"
                                    }`}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-black uppercase tracking-tight text-text-primary group-hover:text-neon-green transition-colors">{item.label}</h3>
                                    <p className="text-[10px] text-muted-light/70 uppercase font-black tracking-widest">{item.description}</p>
                                </div>
                                <div className="text-xl font-black text-white">{item.amount}</div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8">
                        <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-neon-green py-5 text-xs font-black uppercase tracking-[0.2em] text-terminal-bg shadow-[0_10px_30px_rgba(0,255,136,0.4)] hover:scale-[1.02] active:scale-95 transition-all">
                            Proceed with Google Pay
                        </button>
                    </div>

                    <div className="mt-8 flex items-start gap-4 rounded-xl bg-black/40 border border-white/5 p-5">
                        <ShieldCheck className="h-6 w-6 text-neon-green shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">Universal Commerce Protocol (UCP)</span>
                            <p className="text-[9px] leading-relaxed text-muted-light font-medium">
                                This transaction utilizes the **Google Universal Commerce Protocol (UCP)** for agentic-ready checkouts. Secure, tokenized payments processed via Google Pay encryption.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
