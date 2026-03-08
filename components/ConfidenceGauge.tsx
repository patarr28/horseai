"use client";

interface ConfidenceGaugeProps {
    score: number;
    size?: "sm" | "lg";
}

export default function ConfidenceGauge({
    score,
    size = "lg",
}: ConfidenceGaugeProps) {
    const radius = size === "lg" ? 54 : 32;
    const stroke = size === "lg" ? 6 : 4;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const color =
        score >= 80
            ? "#00ff88"
            : score >= 60
                ? "#ff9500"
                : "#ff3b30";

    const bgColor =
        score >= 80
            ? "rgba(0,255,136,0.08)"
            : score >= 60
                ? "rgba(255,149,0,0.08)"
                : "rgba(255,59,48,0.08)";

    const glowColor =
        score >= 80
            ? "rgba(0,255,136,0.3)"
            : score >= 60
                ? "rgba(255,149,0,0.3)"
                : "rgba(255,59,48,0.3)";

    const label =
        score >= 85
            ? "Very High"
            : score >= 70
                ? "High"
                : score >= 55
                    ? "Moderate"
                    : score >= 40
                        ? "Low"
                        : "Very Low";

    const svgSize = radius * 2;
    const textSize = size === "lg" ? "text-2xl" : "text-sm";
    const labelSize = size === "lg" ? "text-[10px]" : "text-[8px]";

    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className="relative"
                style={{
                    filter: `drop-shadow(0 0 12px ${glowColor})`,
                }}
            >
                <svg
                    height={svgSize}
                    width={svgSize}
                    className="-rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        stroke="rgba(255,255,255,0.05)"
                        fill={bgColor}
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    {/* Progress circle */}
                    <circle
                        stroke={color}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className={`${textSize} font-bold tabular-nums`}
                        style={{ color }}
                    >
                        {score}
                    </span>
                    {size === "lg" && (
                        <span className="text-[10px] text-muted-light">/100</span>
                    )}
                </div>
            </div>
            {size === "lg" && (
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-muted-light">
                        Confidence
                    </p>
                    <p
                        className={`${labelSize} font-semibold uppercase tracking-wider`}
                        style={{ color }}
                    >
                        {label}
                    </p>
                </div>
            )}
        </div>
    );
}
