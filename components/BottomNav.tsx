"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, TrendingUp, Ticket, Bot } from "lucide-react";

const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/races", label: "Races", icon: Trophy },
    { href: "/insights", label: "Insights", icon: TrendingUp, badge: true },
    { href: "/bets", label: "Bets", icon: Ticket, badge: true },
    { href: "/chat", label: "AI Chat", icon: Bot },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-crystal liquid-sheen border-t border-white/[0.06] overflow-hidden shadow-[0_-12px_40px_rgba(0,0,0,0.55),0_-1px_0_rgba(255,255,255,0.05)]">
            <div className="absolute inset-0 bg-mesh-liquid opacity-25 pointer-events-none" />
            <div
                className="relative z-10 mx-auto flex max-w-lg items-center justify-around py-1"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
            >
                {tabs.map((tab) => {
                    const isActive =
                        tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`relative flex flex-col items-center gap-0.5 min-w-[52px] px-3 py-2.5 transition-all duration-200 active:scale-[0.88] ${isActive ? "text-neon-green" : "text-muted hover:text-muted-light"
                                }`}
                        >
                            {/* Active background pill — liquid glass */}
                            {isActive && (
                                <span className="absolute inset-0 rounded-xl bg-neon-green/[0.08] border border-neon-green/[0.14] shadow-[inset_0_1px_0_rgba(0,255,136,0.1)]" />
                            )}

                            {/* Water ripple on active */}
                            {isActive && (
                                <span className="absolute inset-0 rounded-xl border border-neon-green/20 animate-liquid-pulse pointer-events-none" />
                            )}

                            {/* Notification dot */}
                            {tab.badge && !isActive && (
                                <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-neon-green shadow-[0_0_6px_rgba(0,255,136,0.8)] animate-pulse" />
                            )}

                            <Icon
                                className={`relative h-5 w-5 transition-all duration-200 ${isActive
                                    ? "drop-shadow-[0_0_10px_rgba(0,255,136,0.7)] scale-110"
                                    : ""
                                    }`}
                                strokeWidth={isActive ? 2.5 : 1.5}
                            />
                            <span
                                className={`relative text-[10px] font-semibold tracking-wide transition-all duration-200 ${isActive ? "text-neon-green drop-shadow-[0_0_6px_rgba(0,255,136,0.5)]" : ""
                                    }`}
                            >
                                {tab.label}
                            </span>

                            {/* Active indicator line — neon water line */}
                            {isActive && (
                                <span className="absolute -top-px left-1/2 h-[1.5px] w-10 -translate-x-1/2 rounded-full bg-neon-green shadow-[0_0_12px_rgba(0,255,136,0.9),0_0_24px_rgba(0,255,136,0.4)]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
