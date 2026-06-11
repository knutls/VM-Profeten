export interface SimMatch {
  num?: number;
  round: string;
  date: string;
  time: string;
  group?: string;
  ground: string;
  team1: string;
  team2: string;
  /** Resolved team names, used for knockout placeholders like "1A" or "W74" */
  resolvedTeam1: string;
  resolvedTeam2: string;
  score1: number;
  score2: number;
  scorers1: string[];
  scorers2: string[];
  /** Set when the match required penalties to decide a winner */
  penalties?: { score1: number; score2: number };
  winner?: string;
  loser?: string;
}

export interface Standing {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface ScorerStat {
  name: string;
  team: string;
  goals: number;
}

export interface KnockoutRound {
  round: string;
  matches: SimMatch[];
}

export interface SimulationResult {
  groupMatches: Record<string, SimMatch[]>;
  standings: Record<string, Standing[]>;
  knockout: KnockoutRound[];
  topScorers: ScorerStat[];
  champion: string;
  runnerUp: string;
  thirdPlace: string;
  fourthPlace: string;
  totalGoals: number;
  totalMatches: number;
  bestThirdPlaced: Standing[];
}
