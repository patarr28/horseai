"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Zap, User, ExternalLink } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    affiliateLinks?: { label: string; url: string }[];
}

// PRD-specified betting styles (gemini.mmd §6 Phase 6)
type BettingStyle = "favourites" | "value" | "nofavs" | "lucky15" | "smartacca";

const styleConfig: Record<BettingStyle, { icon: string; shortLabel: string; activeClass: string }> = {
    favourites: { icon: "🟢", shortLabel: "Favs", activeClass: "bg-neon-green text-terminal-bg" },
    value: { icon: "💎", shortLabel: "Value", activeClass: "bg-value-orange text-terminal-bg" },
    nofavs: { icon: "🚫", shortLabel: "No Favs", activeClass: "bg-risk-red text-white" },
    lucky15: { icon: "🎲", shortLabel: "L15", activeClass: "bg-steaming-purple text-white" },
    smartacca: { icon: "🧠", shortLabel: "Acca", activeClass: "bg-social-blue text-white" },
};

const affiliateBookies = [
    { label: "Bet365", url: "https://www.bet365.com/en/sports/horseracing" },
    { label: "Paddy Power", url: "https://www.paddypower.com/horse-racing" },
    { label: "Sky Bet", url: "https://m.skybet.com/horse-racing" },
];

function renderContent(content: string): React.ReactNode[] {
    return content.split("**").map((part, i) =>
        i % 2 === 1 ? (
            <strong key={i} className="font-semibold text-text-primary">{part}</strong>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "🏇 **Welcome to Festival Whisperer AI**\n\nI've analysed every runner, crunched the odds, and tracked live sentiment.\n\nSelect your betting style then ask me anything.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [style, setStyle] = useState<BettingStyle>("favourites");
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;
        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: text,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, style })
            });
            const data = await response.json();

            // Re-append affiliate links contextually
            const lower = text.toLowerCase();
            let affiliateLinks: { label: string; url: string }[] | undefined = undefined;
            if (lower.includes('lucky') || lower.includes('acca') || lower.includes('banker') || lower.includes('value')) {
                affiliateLinks = affiliateBookies;
            }

            setMessages((prev) => [
                ...prev,
                { id: `ai-${Date.now()}`, role: "assistant", content: data.content || "An error occurred.", timestamp: new Date(), affiliateLinks },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { id: `ai-${Date.now()}`, role: "assistant", content: "Failed to reach AI capabilities. Please ensure the API is running.", timestamp: new Date() },
            ]);
        } finally {
            setIsTyping(false);
        }
    }, [style]);

    const quickQuestions = [
        "Who's the banker?", "Best value bets", "Gold Cup preview",
        "Build me a Lucky 15", "Build me an acca", "Who to avoid?",
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] animate-fade-in">
            {/* Header */}
            <header className="shrink-0 px-4 pt-4 pb-3 border-b border-surface-border/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neon-green/30 bg-neon-green/10">
                        <Zap className="h-5 w-5 text-neon-green" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-text-primary leading-none">AI Assistant</h1>
                        <p className="text-[10px] text-neon-green font-medium mt-0.5">● Online · Festival 2026</p>
                    </div>
                </div>

                {/* PRD's 5 Betting Styles */}
                <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
                    {(Object.entries(styleConfig) as [BettingStyle, typeof styleConfig[BettingStyle]][]).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setStyle(key)}
                            className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all active:scale-95 ${style === key ? cfg.activeClass : "border border-surface-border text-muted hover:text-text-primary"
                                }`}
                        >
                            <span>{cfg.icon}</span>
                            <span>{cfg.shortLabel}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" style={{ scrollbarWidth: "none" }}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2.5 animate-slide-up ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${msg.role === "assistant" ? "border-neon-green/30 bg-neon-green/10" : "border-surface-border bg-surface"
                            }`}>
                            {msg.role === "assistant"
                                ? <Zap className="h-3.5 w-3.5 text-neon-green" strokeWidth={2.5} />
                                : <User className="h-3.5 w-3.5 text-muted-light" />
                            }
                        </div>
                        <div className="max-w-[84%] space-y-2">
                            <div className={`rounded-2xl px-4 py-3 ${msg.role === "assistant"
                                ? "rounded-tl-md border border-surface-border bg-surface"
                                : "rounded-tr-md border border-neon-green/20 bg-neon-green/8"
                                }`}>
                                <div className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
                                    {renderContent(msg.content)}
                                </div>
                                <p className="mt-1.5 text-[9px] text-muted">
                                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                            {/* Affiliate links — PRD §10 */}
                            {msg.affiliateLinks && (
                                <div className="flex gap-1.5 flex-wrap">
                                    {msg.affiliateLinks.map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 rounded-full border border-neon-green/25 bg-neon-green/8 px-2.5 py-1 text-[10px] font-bold text-neon-green transition-all hover:bg-neon-green/15 active:scale-95"
                                        >
                                            <ExternalLink className="h-2.5 w-2.5" />
                                            Bet on {link.label}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-2.5 animate-fade-in">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neon-green/30 bg-neon-green/10">
                            <Zap className="h-3.5 w-3.5 text-neon-green animate-pulse" strokeWidth={2.5} />
                        </div>
                        <div className="rounded-2xl rounded-tl-md border border-surface-border bg-surface px-4 py-3">
                            <div className="flex gap-1 items-center">
                                <span className="h-2 w-2 rounded-full bg-neon-green/60 animate-bounce [animation-delay:0ms]" />
                                <span className="h-2 w-2 rounded-full bg-neon-green/60 animate-bounce [animation-delay:150ms]" />
                                <span className="h-2 w-2 rounded-full bg-neon-green/60 animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
                <div className="shrink-0 px-4 pb-2">
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                        {quickQuestions.map((q) => (
                            <button
                                key={q}
                                onClick={() => sendMessage(q)}
                                className="shrink-0 rounded-full border border-neon-green/20 bg-neon-green/6 px-3.5 py-1.5 text-xs font-semibold text-neon-green transition-all hover:bg-neon-green/12 active:scale-95"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="shrink-0 border-t border-surface-border bg-terminal-bg/95 backdrop-blur-xl px-4 py-3">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                        placeholder="Ask about any race, horse, or bet..."
                        className="flex-1 rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-muted outline-none focus:border-neon-green/40 transition-colors"
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isTyping}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-green text-terminal-bg transition-all hover:bg-neon-green-dim disabled:opacity-30 active:scale-90"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
