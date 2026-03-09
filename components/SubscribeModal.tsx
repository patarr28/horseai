"use client";

import { useState } from "react";
import { X, Mail, CheckCircle2, Loader2, Zap } from "lucide-react";
import Image from "next/image";


interface SubscribeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("Intelligence Link Established. Check your inbox soon.");
                setTimeout(() => {
                    onClose();
                    setStatus("idle");
                    setEmail("");
                }, 3000);
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to establish link.");
            }
        } catch (err) {
            setStatus("error");
            setMessage("Network interference detected. Try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] glass-panel-premium p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="absolute inset-0 bg-mesh-liquid opacity-30 pointer-events-none" />
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 text-muted-light hover:bg-surface hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-neon-green/30 bg-black overflow-hidden shadow-[0_0_20px_rgba(0,255,136,0.2)]">
                        <Image src="/logo.png" alt="HorseRacingAi Logo" width={64} height={64} className="object-cover" />
                        <div className="absolute inset-0 rounded-2xl animate-pulse-glow mix-blend-overlay" />
                    </div>

                    <h2 className="text-xl font-black uppercase tracking-tighter text-text-primary">
                        Stay Ahead of the <span className="text-neon-green">Market</span>
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary leading-relaxed px-4">
                        Join our exclusive intelligence list for live data alerts, tipster consensus reports, and market deep-dives.
                    </p>

                    <p className="mt-1 text-[9px] font-bold text-muted-light uppercase tracking-widest leading-none px-6">
                        Data-first platform. Not gambling advice. <span className="text-risk-red">Gamble Responsibly.</span>
                    </p>

                    {status === "success" ? (
                        <div className="mt-8 flex flex-col items-center animate-bounce-in">
                            <CheckCircle2 className="h-12 w-12 text-neon-green mb-3" />
                            <p className="text-sm font-bold text-neon-green uppercase tracking-widest">{message}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted/60" />
                                <input
                                    type="email"
                                    required
                                    placeholder="your@intel.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-surface-border bg-surface pl-12 pr-4 py-4 text-sm text-text-primary outline-none focus:border-neon-green/40 transition-all shadow-inner"
                                />
                            </div>

                            {status === "error" && (
                                <p className="text-[10px] font-bold text-risk-red uppercase tracking-widest text-left pl-1">
                                    {message}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full rounded-xl bg-neon-green py-4 text-xs font-black uppercase tracking-widest text-terminal-bg shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {status === "loading" ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing Intelligence...
                                    </>
                                ) : (
                                    "Establish Intelligence Link"
                                )}
                            </button>
                        </form>
                    )}

                    <p className="mt-6 text-[9px] text-muted-light uppercase tracking-widest opacity-50">
                        Secure Transmission. No Noise. Just Data.
                    </p>
                </div>
            </div>
        </div>
    );
}
