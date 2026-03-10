"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Zap, User, ExternalLink, Image as ImageIcon, X, Loader2, Bot } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    image?: string;
    affiliateLinks?: { label: string; url: string }[];
}

type BettingStyle = "favourites" | "value" | "nofavs" | "lucky15" | "smartacca";

const styleConfig: Record<BettingStyle, { icon: string; shortLabel: string; activeClass: string }> = {
    favourites: { icon: "🟢", shortLabel: "Favs", activeClass: "bg-neon-green text-terminal-bg" },
    value: { icon: "💎", shortLabel: "Value", activeClass: "bg-value-orange text-terminal-bg" },
    nofavs: { icon: "🚫", shortLabel: "No Favs", activeClass: "bg-risk-red text-white" },
    lucky15: { icon: "🎲", shortLabel: "L15", activeClass: "bg-steaming-purple text-white" },
    smartacca: { icon: "🧠", shortLabel: "Acca", activeClass: "bg-steaming-purple text-white" },
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
            content: "🏇 **Welcome to the Intel Hub**\n\nI'm now synced with the latest daily signals, expert tipsters, and market movers.\n\nAsk me for a prediction, analyze a race, or use **'Roast My Acca'** to see if your slip stands a chance.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [style, setStyle] = useState<BettingStyle>("favourites");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const sendMessage = useCallback(async (text: string, overrideImage?: File) => {
        const imageToUpload = overrideImage || selectedImage;
        if (!text.trim() && !imageToUpload) return;

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: text || (imageToUpload ? "Analyzing my betting slip..." : ""),
            image: imagePreview || undefined,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        clearImage();
        setIsTyping(true);

        try {
            const formData = new FormData();
            formData.append("message", text);
            formData.append("style", style);
            if (imageToUpload) {
                formData.append("image", imageToUpload);
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                {
                    id: `ai-${Date.now()}`,
                    role: "assistant",
                    content: data.content || "An error occurred.",
                    timestamp: new Date(),
                    affiliateLinks: (text.toLowerCase().includes('lucky') || text.toLowerCase().includes('acca')) ? affiliateBookies : undefined
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { id: `ai-${Date.now()}`, role: "assistant", content: "Failed to reach AI capabilities.", timestamp: new Date() },
            ]);
        } finally {
            setIsTyping(false);
        }
    }, [style, selectedImage, imagePreview]);

    const quickQuestions = [
        "🏆 Give me the NAP of the Day",
        "💡 Find the best Value Bet today",
        "🎲 Build me an optimal Lucky 15",
        "🔥 Roast My Acca",
        "📊 Course conditions & bias today",
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] animate-fade-in bg-terminal-bg">
            {/* Header */}
            <header className="shrink-0 px-4 pt-4 pb-3 border-b border-white/[0.06] glass-crystal liquid-sheen shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neon-green/30 bg-neon-green/[0.08] shadow-[0_0_18px_rgba(0,255,136,0.15),inset_0_1px_0_rgba(0,255,136,0.12)]">
                        <Bot className="h-6 w-6 text-neon-green drop-shadow-[0_0_6px_rgba(0,255,136,0.8)]" />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-text-primary leading-none tracking-tight uppercase">Analytic Intel Bot</h1>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse shadow-[0_0_4px_rgba(0,255,136,0.8)]" />
                            <p className="text-[10px] text-neon-green font-black uppercase tracking-widest">Updated with recent changes</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                    {(Object.entries(styleConfig) as [BettingStyle, typeof styleConfig[BettingStyle]][]).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setStyle(key)}
                            className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${style === key
                                ? `${cfg.activeClass} shadow-[0_0_12px_rgba(0,255,136,0.2),inset_0_1px_0_rgba(255,255,255,0.15)]`
                                : "bg-surface/60 border border-surface-border/60 text-muted-light hover:border-neon-green/30 backdrop-blur-sm"
                            }`}
                        >
                            <span className="text-xs">{cfg.icon}</span>
                            <span>{cfg.shortLabel}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 no-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 animate-slide-up ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${msg.role === "assistant"
                            ? "border-neon-green/25 bg-neon-green/[0.08] shadow-[0_0_12px_rgba(0,255,136,0.12),inset_0_1px_0_rgba(0,255,136,0.1)]"
                            : "border-surface-border/60 bg-surface/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                        }`}>
                            {msg.role === "assistant"
                                ? <Bot className="h-4 w-4 text-neon-green" />
                                : <User className="h-4 w-4 text-muted-light" />
                            }
                        </div>
                        <div className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "items-end flex flex-col" : ""}`}>
                            {msg.image && (
                                <div className="rounded-xl overflow-hidden border border-surface-border/60 mb-2 max-w-[200px] shadow-lg">
                                    <img src={msg.image} alt="Uploaded slip" className="w-full h-auto" />
                                </div>
                            )}
                            <div className={`rounded-2xl px-4 py-3.5 ${msg.role === "assistant"
                                ? "rounded-tl-none border border-white/[0.07] glass-water shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(0,255,136,0.04)] text-text-secondary"
                                : "rounded-tr-none border border-neon-green/20 bg-neon-green/[0.07] backdrop-blur-sm shadow-[inset_0_1px_0_rgba(0,255,136,0.08)] text-text-primary"
                            }`}>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                    {renderContent(msg.content)}
                                </div>
                                <p className="mt-2 text-[8px] font-mono-data text-muted uppercase tracking-widest opacity-50">
                                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>

                            {msg.affiliateLinks && (
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {msg.affiliateLinks.map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 rounded-lg border border-neon-green/25 bg-neon-green/[0.08] backdrop-blur-sm px-3 py-1.5 text-[9px] font-black text-neon-green transition-all hover:bg-neon-green/15 active:scale-95 uppercase tracking-wider shadow-[inset_0_1px_0_rgba(0,255,136,0.08)]"
                                        >
                                            <ExternalLink className="h-2.5 w-2.5" />
                                            {link.label} Market
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3 animate-fade-in">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-neon-green/25 bg-neon-green/[0.08] shadow-[0_0_12px_rgba(0,255,136,0.12)]">
                            <Bot className="h-4 w-4 text-neon-green animate-pulse" />
                        </div>
                        <div className="rounded-2xl rounded-tl-none border border-white/[0.07] glass-water px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                            <div className="flex gap-2 items-center">
                                <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_6px_rgba(0,255,136,0.8)] animate-bounce [animation-delay:0ms]" />
                                <span className="h-2 w-2 rounded-full bg-neon-green/70 shadow-[0_0_4px_rgba(0,255,136,0.5)] animate-bounce [animation-delay:150ms]" />
                                <span className="h-2 w-2 rounded-full bg-neon-green/40 shadow-[0_0_4px_rgba(0,255,136,0.3)] animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Input & Quick Chips */}
            <div className={`shrink-0 border-t ${messages.length > 1 ? 'border-white/[0.06]' : 'border-transparent'} glass-crystal liquid-sheen p-4 transition-all duration-300 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]`}>
                {/* Vertical Chips Layout for Mobile - Only show when chat is basically empty */}
                {messages.length <= 1 && (
                    <div className="flex flex-col gap-2 mb-4">
                        {quickQuestions.map((q) => (
                            <button
                                key={q}
                                onClick={() => {
                                    if (q.includes("Roast")) {
                                        fileInputRef.current?.click();
                                    } else {
                                        sendMessage(q);
                                    }
                                }}
                                className="w-full relative overflow-hidden group rounded-xl border border-surface-border/50 bg-surface/50 backdrop-blur-sm hover:bg-surface/70 hover:border-neon-green/35 px-4 py-3.5 text-left text-[11px] font-black uppercase tracking-wider text-muted-light transition-all active:scale-[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                            >
                                <span className="relative z-10 flex items-center justify-between">
                                    <span className="group-hover:text-neon-green transition-colors">{q}</span>
                                    <span className="text-neon-green/40 group-hover:text-neon-green transition-all">→</span>
                                </span>
                                <div className="absolute inset-0 z-0 bg-gradient-to-r from-neon-green/0 via-neon-green/[0.04] to-neon-green/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Preview Image */}
                {imagePreview && (
                    <div className="relative mb-3 inline-block">
                        <img src={imagePreview} className="h-20 w-20 object-cover rounded-xl border-2 border-neon-green/40 shadow-[0_0_16px_rgba(0,255,136,0.2)]" alt="Preview" />
                        <button onClick={clearImage} className="absolute -top-2 -right-2 bg-risk-red text-white rounded-full p-1 hover:scale-110 transition-transform shadow-lg active:scale-90">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-2.5">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-surface-border/60 bg-surface/60 backdrop-blur-sm text-muted-light hover:text-neon-green hover:border-neon-green/30 transition-all active:scale-90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    >
                        <ImageIcon className="h-5 w-5" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                            placeholder={imagePreview ? "Say something about this slip..." : "Ask about a race, horse, or market..."}
                            className="w-full rounded-xl border border-surface-border/60 bg-surface/70 backdrop-blur-md px-4 py-3 text-sm text-text-primary placeholder:text-muted/50 outline-none focus:border-neon-green/40 focus:shadow-[0_0_0_1px_rgba(0,255,136,0.15)] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.2)]"
                        />
                    </div>
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={(!input.trim() && !selectedImage) || isTyping}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neon-green text-terminal-bg shadow-[0_0_18px_rgba(0,255,136,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-90 disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none"
                    >
                        {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
