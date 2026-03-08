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
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-border/60 bg-terminal-bg/96 backdrop-blur-2xl">
            <div className="mx-auto flex max-w-lg items-center justify-around py-1 pb-safe">
                {tabs.map((tab) => {
                    const isActive =
                        tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`relative flex flex-col items-center gap-0.5 px-4 py-2 transition-all duration-200 active:scale-90 ${isActive ? "text-neon-green" : "text-muted hover:text-muted-light"
                                }`}
                        >
                            {/* Active background pill */}
                            {isActive && (
                                <span className="absolute inset-0 rounded-xl bg-neon-green/8 border border-neon-green/10" />
                            )}

                            {/* Notification dot */}
                            {tab.badge && !isActive && (
                                <span className="absolute right-3 top-1.5 h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
                            )}

                            <Icon
                                className={`relative h-5 w-5 transition-all duration-200 ${isActive
                                        ? "drop-shadow-[0_0_8px_rgba(0,255,136,0.6)] scale-110"
                                        : ""
                                    }`}
                                strokeWidth={isActive ? 2.5 : 1.5}
                            />
                            <span
                                className={`relative text-[10px] font-semibold tracking-wide transition-all duration-200 ${isActive ? "text-neon-green" : ""
                                    }`}
                            >
                                {tab.label}
                            </span>

                            {/* Active indicator line */}
                            {isActive && (
                                <span className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-neon-green shadow-[0_0_10px_rgba(0,255,136,0.7)]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
