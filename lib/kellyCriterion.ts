/**
 * Calculates the Kelly Criterion recommendation for a bet.
 * 
 * @param probability The true probability of winning (0 to 1). e.g. 0.20 for 20%
 * @param decimalOdds The decimal odds offered by the bookmaker. e.g. 5.0 for 4/1
 * @param fraction The Kelly fraction to use (e.g. 0.5 for Half-Kelly to reduce variance). Default is 0.25 (Quarter-Kelly) for racing.
 * @returns The percentage of bankroll to wager (0 to 100). Returns 0 if there's no edge.
 */
export function calculateKellyStake(probability: number, decimalOdds: number, fraction: number = 0.25): number {
    // Edge = (Probability * Odds) - 1
    const edge = (probability * decimalOdds) - 1;

    if (edge <= 0) {
        return 0; // No value, do not bet
    }

    // Kelly Percentage = Edge / (Odds - 1)
    const b = decimalOdds - 1;
    let kellyPct = edge / b;

    // Apply fractional Kelly to reduce variance/risk of ruin
    kellyPct = kellyPct * fraction;

    // Cap at a sensible max bet (e.g., 5% of bankroll per race)
    const finalPct = Math.min(kellyPct * 100, 5.0);

    return Number(finalPct.toFixed(2));
}

/**
 * Helper to generate a human-readable staking recommendation
 */
export function getStakingAdvice(winProb: number, odds: number): { units: string; advice: string } {
    const stakePct = calculateKellyStake(winProb / 100, odds);

    if (stakePct === 0) {
        return { units: "0 U", advice: "No value. Skip this bet." };
    }

    if (stakePct < 0.5) {
        return { units: "0.25 U", advice: "Small fun stake only." };
    }

    if (stakePct < 1.0) {
        return { units: "0.5 U", advice: "Half unit stake. Marginal value." };
    }

    if (stakePct < 2.5) {
        return { units: "1 U", advice: "Solid value. Standard 1 unit stake." };
    }

    return { units: "2 U", advice: "Strong edge. Max 2 unit stake." };
}
