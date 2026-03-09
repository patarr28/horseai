"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    size?: "sm" | "md" | "lg";
    variant?: "outline" | "ghost" | "solid";
    className?: string;
}

export default function ShareButton({
    title,
    text,
    url,
    size = "md",
    variant = "outline",
    className = ""
}: ShareButtonProps) {
    const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");

    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: shareUrl,
                });
                setStatus("shared");
                setTimeout(() => setStatus("idle"), 2000);
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    copyToClipboard();
                }
            }
        } else {
            copyToClipboard();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${text} ${shareUrl}`);
        setStatus("copied");
        setTimeout(() => setStatus("idle"), 2000);
    };

    const sizeClasses = {
        sm: "p-1.5 text-[9px]",
        md: "p-2 text-[10px]",
        lg: "px-4 py-2 text-xs",
    };

    const variantClasses = {
        outline: "border border-neon-green/30 bg-neon-green/5 text-neon-green hover:bg-neon-green/10",
        ghost: "text-muted-light hover:text-neon-green hover:bg-neon-green/5",
        solid: "bg-neon-green text-terminal-bg font-bold shadow-[0_0_15px_rgba(0,255,136,0.2)]",
    };

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShare();
            }}
            className={`flex items-center gap-1.5 rounded-lg transition-all active:scale-95 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        >
            {status === "copied" ? (
                <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="uppercase tracking-widest font-black">Copied</span>
                </>
            ) : status === "shared" ? (
                <>
                    <Check className="h-3.5 w-3.5" />
                    <span className="uppercase tracking-widest font-black">Shared</span>
                </>
            ) : (
                <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="uppercase tracking-widest font-black">Share</span>
                </>
            )}
        </button>
    );
}
