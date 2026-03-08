import { Horse, Race } from "@/lib/types";

// Value data mapping: horse ID -> { modelOdds, modelOddsDecimal, socialMentions }
const valueData: Record<string, { modelOdds: string; modelOddsDecimal: number; socialMentions: number }> = {
    h1: { modelOdds: "6/4", modelOddsDecimal: 2.5, socialMentions: 720 },
    h2: { modelOdds: "7/2", modelOddsDecimal: 4.5, socialMentions: 540 },
    h3: { modelOdds: "7/1", modelOddsDecimal: 8.0, socialMentions: 180 },
    h4: { modelOdds: "4/1", modelOddsDecimal: 5.0, socialMentions: 410 },
    h5: { modelOdds: "25/1", modelOddsDecimal: 26.0, socialMentions: 95 },
    h6: { modelOdds: "6/1", modelOddsDecimal: 7.0, socialMentions: 380 },
    h7: { modelOdds: "Evs", modelOddsDecimal: 2.0, socialMentions: 890 },
    h8: { modelOdds: "4/1", modelOddsDecimal: 5.0, socialMentions: 620 },
    h9: { modelOdds: "7/1", modelOddsDecimal: 8.0, socialMentions: 210 },
    h10: { modelOdds: "9/2", modelOddsDecimal: 5.5, socialMentions: 340 },
    h11: { modelOdds: "Evs", modelOddsDecimal: 2.0, socialMentions: 950 },
    h12: { modelOdds: "3/1", modelOddsDecimal: 4.0, socialMentions: 480 },
    h13: { modelOdds: "7/1", modelOddsDecimal: 8.0, socialMentions: 160 },
    h14: { modelOdds: "8/1", modelOddsDecimal: 9.0, socialMentions: 580 },
    h15: { modelOdds: "20/1", modelOddsDecimal: 21.0, socialMentions: 75 },
    h16: { modelOdds: "Evs", modelOddsDecimal: 2.0, socialMentions: 1240 },
    h17: { modelOdds: "7/2", modelOddsDecimal: 4.5, socialMentions: 290 },
    h18: { modelOdds: "6/1", modelOddsDecimal: 7.0, socialMentions: 440 },
    h19: { modelOdds: "20/1", modelOddsDecimal: 21.0, socialMentions: 510 },
    h20: { modelOdds: "10/1", modelOddsDecimal: 11.0, socialMentions: 420 },
};

export function getValueData(horseId: string) {
    return valueData[horseId] ?? { modelOdds: "N/A", modelOddsDecimal: 0, socialMentions: 0 };
}

export interface ValueBet {
    horse: Horse;
    race: Race;
    marketOdds: number;
    modelOdds: number;
    modelOddsDisplay: string;
    edge: number; // percentage edge
    socialMentions: number;
}

export function getValueBets(races: Race[]): ValueBet[] {
    const bets: ValueBet[] = [];
    for (const race of races) {
        for (const horse of race.horses) {
            const vd = getValueData(horse.id);
            const edge = ((horse.oddsDecimal - vd.modelOddsDecimal) / vd.modelOddsDecimal) * 100;
            bets.push({
                horse,
                race,
                marketOdds: horse.oddsDecimal,
                modelOdds: vd.modelOddsDecimal,
                modelOddsDisplay: vd.modelOdds,
                edge: Math.round(edge),
                socialMentions: vd.socialMentions,
            });
        }
    }
    // Sort by edge descending (biggest value first)
    return bets.sort((a, b) => b.edge - a.edge);
}

export interface SocialTrending {
    horse: Horse;
    race: Race;
    mentions: number;
    sentimentScore: number; // derived from positive - negative
    trend: "up" | "down" | "stable";
}

export function getSocialTrending(races: Race[]): SocialTrending[] {
    const items: SocialTrending[] = [];
    for (const race of races) {
        for (const horse of race.horses) {
            const vd = getValueData(horse.id);
            items.push({
                horse,
                race,
                mentions: vd.socialMentions,
                sentimentScore: horse.sentiment.positive - horse.sentiment.negative,
                trend: horse.stats.trend,
            });
        }
    }
    return items.sort((a, b) => b.mentions - a.mentions);
}
