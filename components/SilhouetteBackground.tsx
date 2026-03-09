"use client";

import React from "react";

export default function SilhouetteBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.08]">
            {/* Horse Silhouette - Bottom Right */}
            <svg
                viewBox="0 0 200 200"
                className="absolute bottom-[-20px] right-[-50px] w-[300px] h-[300px] text-neon-green fill-current"
                aria-hidden="true"
            >
                <path d="M180,140 c-10,-5 -20,-10 -30,-5 c-5,2 -10,10 -15,15 c-5,5 -20,10 -30,5 c-10,-5 -15,-20 -15,-35 c0,-15 5,-30 15,-40 c10,-10 20,-15 30,-15 c10,0 25,10 35,20 c10,10 15,30 10,55 Z M50,160 c10,0 20,-5 25,-15 c5,-10 5,-20 0,-30 c-5,-10 -15,-15 -25,-15 c-10,0 -20,5 -25,15 c-5,10 -5,20 0,30 c5,10 15,15 25,15 Z" />
            </svg>

            {/* Gold Cup Silhouette - Top Left */}
            <svg
                viewBox="0 0 100 100"
                className="absolute top-[100px] left-[-30px] w-[200px] h-[200px] text-value-orange fill-current"
                aria-hidden="true"
            >
                <path d="M30,20 h40 v10 c0,15 -10,25 -20,25 s-20,-10 -20,-25 v-10 Z M50,55 v20 M35,75 h30 M25,30 c-5,0 -10,5 -10,10 s5,10 10,10 M75,30 c5,0 10,5 10,10 s-5,10 -10,10" />
            </svg>

            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
    );
}
