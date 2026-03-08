export type SignalType =
  | "BANKER"
  | "VALUE_BET"
  | "STEAMING"
  | "DRIFTING"
  | "OVERHYPED"
  | "PUNDIT_PICK"
  | "SOCIAL_BUZZ"
  | "MARKET_MOVER";

export interface Signal {
  type: SignalType;
  label: string;
  detail?: string;
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
  aiRating: number;
  crowdPickPercent: number;
  signals: Signal[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  stats: {
    speed: number;
    stamina: "Low" | "Medium" | "High" | "Elite";
    trend: "up" | "down" | "stable";
  };
  aiInsight: string;
  silkColor: string;
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
}

export interface DaySchedule {
  label: string;
  date: string;
  races: Race[];
}
