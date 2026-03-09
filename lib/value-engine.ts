import { Horse, Race } from "@/lib/types";

// Value data mapping: horse ID -> { modelOdds, modelOddsDecimal, expertTipScore }
// Value data mapping: horse ID -> { modelOdds, modelOddsDecimal, expertTipScore }
// Covering key horses from mock-data.ts (Ballyburn, Hunters Yarn, Gaelic Warrior, etc.)
const valueData: Record<string, { modelOdds: string; modelOddsDecimal: number; expertTipScore: number }> = {
    h1: { modelOdds: "6/4", modelOddsDecimal: 2.5, expertTipScore: 720 }, // Ballyburn
    h2: { modelOdds: "4/1", modelOddsDecimal: 5.0, expertTipScore: 540 }, // Hunters Yarn
    h3: { modelOdds: "7/1", modelOddsDecimal: 8.0, expertTipScore: 180 },
    h4: { modelOdds: "4/1", modelOddsDecimal: 5.0, expertTipScore: 410 },
    h5: { modelOdds: "25/1", modelOddsDecimal: 26.0, expertTipScore: 95 },
    h6: { modelOdds: "6/1", modelOddsDecimal: 7.0, expertTipScore: 380 },
    h7: { modelOdds: "Evs", modelOddsDecimal: 2.0, expertTipScore: 890 },
    h8: { modelOdds: "4/1", modelOddsDecimal: 5.0, expertTipScore: 620 },
    h9: { modelOdds: "7/1", modelOddsDecimal: 8.0, expertTipScore: 210 },
    h10: { modelOdds: "9/2", modelOddsDecimal: 5.5, expertTipScore: 340 },
    h11: { modelOdds: "Evs", modelOddsDecimal: 2.0, expertTipScore: 950 },
    h12: { modelOdds: "3/1", modelOddsDecimal: 4.0, expertTipScore: 480 },
    h13: { modelOdds: "7/1", modelOddsDecimal: 8.0, expertTipScore: 160 },
    h14: { modelOdds: "8/1", modelOddsDecimal: 9.0, expertTipScore: 580 },
    h15: { modelOdds: "20/1", modelOddsDecimal: 21.0, expertTipScore: 75 },
    h16: { modelOdds: "Evs", modelOddsDecimal: 2.0, expertTipScore: 1240 },
    h17: { modelOdds: "7/2", modelOddsDecimal: 4.5, expertTipScore: 290 },
    h18: { modelOdds: "6/1", modelOddsDecimal: 7.0, expertTipScore: 440 },
    h19: { modelOdds: "20/1", modelOddsDecimal: 21.0, expertTipScore: 510 },
    h20: { modelOdds: "10/1", modelOddsDecimal: 11.0, expertTipScore: 420 },
};

export function getValueData(horseId: string) {
    return valueData[horseId] ?? { modelOdds: "N/A", modelOddsDecimal: 0, expertTipScore: 0 };
}

export interface ValueBet {
    horse: Horse;
    race: Race;
    marketOdds: number;
    modelOdds: number;
    modelOddsDisplay: string;
    edge: number;
    expertTipScore: number;
}

export function getValueBets(races: Race[]): ValueBet[] {
    const bets: ValueBet[] = [];
    for (const race of races) {
        for (const horse of race.horses) {
            const vd = getValueData(horse.id);
            if (vd.modelOddsDecimal === 0) continue; // Skip horses with no model data

            const edge = ((horse.oddsDecimal - vd.modelOddsDecimal) / vd.modelOddsDecimal) * 100;
            bets.push({
                horse,
                race,
                marketOdds: horse.oddsDecimal,
                modelOdds: vd.modelOddsDecimal,
                modelOddsDisplay: vd.modelOdds,
                edge: Math.round(edge),
                expertTipScore: vd.expertTipScore,
            });
        }
    }
    return bets.sort((a, b) => b.edge - a.edge);
}

export interface ExpertConsensus {
    horse: Horse;
    race: Race;
    expertTipScore: number;
    tipCount: number; // directly from EXPERT_TIP signal if available
    sentimentScore: number;
    trend: "up" | "down" | "stable";
}

/**
 * Replaces getSocialTrending — ranks horses by expert consensus score.
 * Derives tipCount from the horse's EXPERT_TIP signal if available.
 */
export function getExpertConsensus(races: Race[]): ExpertConsensus[] {
    const items: ExpertConsensus[] = [];
    for (const race of races) {
        for (const horse of race.horses) {
            const vd = getValueData(horse.id);

            // Check for EXPERT_TIP signal in the horse's live signals
            const expertSignal = horse.signals.find(s => s.type === 'EXPERT_TIP');
            const tipCount = expertSignal
                ? parseInt(expertSignal.label.replace(/\D/g, '')) || 1
                : 0;

            items.push({
                horse,
                race,
                expertTipScore: vd.expertTipScore,
                tipCount,
                sentimentScore: horse.sentiment.positive - horse.sentiment.negative,
                trend: horse.stats.trend,
            });
        }
    }
    // Sort by those with expert tips first, then by tip score
    return items.sort((a, b) => {
        if (b.tipCount !== a.tipCount) return b.tipCount - a.tipCount;
        return b.expertTipScore - a.expertTipScore;
    });
}

// Keep for backward compat if anything imports it
/** @deprecated Use getExpertConsensus instead */
export const getSocialTrending = getExpertConsensus;
