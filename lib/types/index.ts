export type SignalType =
  | "BANKER"
  | "VALUE_BET"
  | "STEAMING"
  | "DRIFTING"
  | "OVERHYPED"
  | "PUNDIT_PICK"
  | "EXPERT_TIP"
  | "MARKET_MOVER";

export interface Signal {
  type: SignalType;
  label: string;
  detail?: string;
}

export interface TipsterPick {
  tipsterName: string;
  publication: string;
  tipType: 'NAP' | 'NB' | 'EACH_WAY' | 'VALUE' | 'LONGSHOT';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning?: string;
}

export interface Horse {
  id: string;
  number: number;
  name: string;
  jockey: string;
  trainer: string;
  form: string;
  odds: string;
  oddsDecimal: number;
  bestOdds?: {
    bookmaker: string;
    fractional: string;
    decimal: number;
    url: string;
  } | null;
  aiRating: number;
  crowdPickPercent: number;
  signals: Signal[];
  tipsterPicks?: TipsterPick[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  stats: {
    speed: number;
    stamina: "Low" | "Medium" | "High" | "Elite";
    trend: "up" | "down" | "stable";
    fastestMileTime?: string;
  };
  aiInsight: string;
  silkColor: string;
  silkUrl?: string;
  jockeyUrl?: string;
  plainEnglishInsights?: string[];
  // Phase 2: Horse Profile fields
  aiVerdict: string;
  pros: string[];
  cons: string[];
  confidence: number;
  age: number;
  weight: string;
  rating: number;
  trackRecord: {
    courseWins: number;
    courseRuns: number;
    distanceWins: number;
    distanceRuns: number;
    goingWins: number;
    goingRuns: number;
  };
  recentRuns: {
    date: string;
    course: string;
    position: string;
    distance: string;
    going: string;
    odds: string;
  }[];
}

export interface Race {
  id: string;
  time: string;
  name: string;
  grade?: string;
  distance: string;
  going: string;
  runners: number;
  horses: Horse[];
  topSignals: Signal[];
  bankerPick?: string;
  valuePick?: string;
  marketMover?: string;
  punditPick?: string;
  status: "upcoming" | "live" | "result";
  averageTime?: string;
  historyFact?: string;
  runnerFacts?: string[];
  lookOutFor?: string[];
  wildCard?: { name: string; reason: string };
  vitalFacts?: string[]; // Legacy fallback
  lastWinners?: { year: number; name: string; fact: string }[];
  favoriteDetails?: { name: string; detail: string };
  notableNewcomers?: { name: string; reason: string }[];
}

export interface DaySchedule {
  label: string;
  date: string;
  races: Race[];
}
