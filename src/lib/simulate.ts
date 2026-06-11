import fixtures from "../data/fixtures2026.json";
import { TEAMS_BY_NAME, GROUPS } from "../data/teams";
import { PLAYERS } from "../data/players";
import type {
  SimMatch,
  Standing,
  ScorerStat,
  KnockoutRound,
  SimulationResult,
} from "./types";

interface RawMatch {
  round: string;
  date: string;
  time: string;
  team1: string;
  team2: string;
  group?: string;
  ground: string;
  num?: number;
}

const RAW_MATCHES = fixtures.matches as RawMatch[];

/** Sample from a Poisson distribution with the given mean (Knuth's algorithm). */
function poissonSample(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k += 1;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

/** Expected goals for a team given its rating and the opponent's rating. */
function expectedGoals(rating: number, opponentRating: number): number {
  const base = 1.16;
  const factor = Math.pow(2, (rating - opponentRating) / 12);
  return base * Math.sqrt(factor);
}

// Each squad lists a starting XI in [GK, 4 x DF, 3 x MF, 3 x FW] order.
// Scale raw weights by position so that, in aggregate, forwards account for
// most goals, with midfielders and defenders chipping in realistically.
const POSITION_MULTIPLIERS = [1, 0.5, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1, 1, 1];

function pickScorer(team: string): string {
  const squad = PLAYERS[team];
  if (!squad || squad.length === 0) return `Player (${team})`;
  const weights = squad.map((p, i) => p.weight * (POSITION_MULTIPLIERS[i] ?? 1));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < squad.length; i++) {
    r -= weights[i];
    if (r <= 0) return squad[i].name;
  }
  return squad[squad.length - 1].name;
}

function simulateScore(
  team1: string,
  team2: string,
): { score1: number; score2: number; scorers1: string[]; scorers2: string[] } {
  const r1 = TEAMS_BY_NAME[team1]?.rating ?? 65;
  const r2 = TEAMS_BY_NAME[team2]?.rating ?? 65;
  const score1 = poissonSample(expectedGoals(r1, r2));
  const score2 = poissonSample(expectedGoals(r2, r1));
  const scorers1 = Array.from({ length: score1 }, () => pickScorer(team1));
  const scorers2 = Array.from({ length: score2 }, () => pickScorer(team2));
  return { score1, score2, scorers1, scorers2 };
}

function newStanding(team: string): Standing {
  return { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
}

function applyResult(standing: Standing, gf: number, ga: number) {
  standing.played += 1;
  standing.gf += gf;
  standing.ga += ga;
  standing.gd = standing.gf - standing.ga;
  if (gf > ga) {
    standing.won += 1;
    standing.points += 3;
  } else if (gf === ga) {
    standing.drawn += 1;
    standing.points += 1;
  } else {
    standing.lost += 1;
  }
}

function compareStandings(a: Standing, b: Standing): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return Math.random() - 0.5;
}

// The 8 "best third-placed" Round of 32 placeholders, each listing the
// groups eligible to fill that slot, e.g. "3A/B/C/D/F".
function thirdPlaceCandidateGroups(placeholder: string): string[] {
  return placeholder.slice(1).split("/");
}

function isThirdPlacePlaceholder(team: string): boolean {
  return /^3[A-L](\/[A-L])*$/.test(team);
}

function isGroupRankPlaceholder(team: string): { group: string; rank: number } | null {
  const m = /^([12])([A-L])$/.exec(team);
  if (!m) return null;
  return { rank: Number(m[1]), group: m[2] };
}

function isWinnerLoserPlaceholder(team: string): { kind: "W" | "L"; num: number } | null {
  const m = /^([WL])(\d+)$/.exec(team);
  if (!m) return null;
  return { kind: m[1] as "W" | "L", num: Number(m[2]) };
}

function simulateKnockoutMatch(team1: string, team2: string): {
  score1: number;
  score2: number;
  scorers1: string[];
  scorers2: string[];
  penalties?: { score1: number; score2: number };
  winner: string;
  loser: string;
} {
  const result = simulateScore(team1, team2);
  if (result.score1 !== result.score2) {
    const winner = result.score1 > result.score2 ? team1 : team2;
    const loser = winner === team1 ? team2 : team1;
    return { ...result, winner, loser };
  }

  // Extra time: a bit less likely to score
  const r1 = TEAMS_BY_NAME[team1]?.rating ?? 65;
  const r2 = TEAMS_BY_NAME[team2]?.rating ?? 65;
  const et1 = poissonSample(expectedGoals(r1, r2) * 0.33);
  const et2 = poissonSample(expectedGoals(r2, r1) * 0.33);
  const finalScore1 = result.score1 + et1;
  const finalScore2 = result.score2 + et2;
  const scorers1 = [...result.scorers1, ...Array.from({ length: et1 }, () => pickScorer(team1))];
  const scorers2 = [...result.scorers2, ...Array.from({ length: et2 }, () => pickScorer(team2))];

  if (finalScore1 !== finalScore2) {
    const winner = finalScore1 > finalScore2 ? team1 : team2;
    const loser = winner === team1 ? team2 : team1;
    return { score1: finalScore1, score2: finalScore2, scorers1, scorers2, winner, loser };
  }

  // Penalty shootout: small bias towards the higher-rated team
  const ratingBias = (r1 - r2) / 200;
  let p1 = 0;
  let p2 = 0;
  do {
    p1 = 3 + Math.floor(Math.random() * 3);
    p2 = 3 + Math.floor(Math.random() * 3);
    if (Math.random() < 0.5 + ratingBias) p1 += 1;
    else p2 += 1;
  } while (p1 === p2);
  const winner = p1 > p2 ? team1 : team2;
  const loser = winner === team1 ? team2 : team1;
  return {
    score1: finalScore1,
    score2: finalScore2,
    scorers1,
    scorers2,
    penalties: { score1: p1, score2: p2 },
    winner,
    loser,
  };
}

export function simulateWorldCup(): SimulationResult {
  // ---- Group stage ----
  const standings: Record<string, Standing[]> = {};
  for (const group of Object.keys(GROUPS)) {
    standings[group] = GROUPS[group].map((t) => newStanding(t.name));
  }
  const standingsByTeam = new Map<string, Standing>();
  for (const group of Object.values(standings)) {
    for (const s of group) standingsByTeam.set(s.team, s);
  }

  const groupMatches: Record<string, SimMatch[]> = {};
  let totalGoals = 0;
  let totalMatches = 0;
  const scorerTotals = new Map<string, ScorerStat>();

  function recordScorers(team: string, scorers: string[]) {
    for (const name of scorers) {
      const key = `${name}|${team}`;
      const existing = scorerTotals.get(key);
      if (existing) existing.goals += 1;
      else scorerTotals.set(key, { name, team, goals: 1 });
    }
  }

  for (const raw of RAW_MATCHES) {
    if (!raw.group) continue;
    const groupKey = raw.group.replace("Group ", "");
    const { score1, score2, scorers1, scorers2 } = simulateScore(raw.team1, raw.team2);
    totalGoals += score1 + score2;
    totalMatches += 1;
    recordScorers(raw.team1, scorers1);
    recordScorers(raw.team2, scorers2);

    const match: SimMatch = {
      round: raw.round,
      date: raw.date,
      time: raw.time,
      group: groupKey,
      ground: raw.ground,
      team1: raw.team1,
      team2: raw.team2,
      resolvedTeam1: raw.team1,
      resolvedTeam2: raw.team2,
      score1,
      score2,
      scorers1,
      scorers2,
    };
    (groupMatches[groupKey] ??= []).push(match);

    applyResult(standingsByTeam.get(raw.team1)!, score1, score2);
    applyResult(standingsByTeam.get(raw.team2)!, score2, score1);
  }

  for (const group of Object.keys(standings)) {
    standings[group] = [...standings[group]].sort(compareStandings);
  }

  // ---- Best third-placed teams ----
  const thirdPlaced = Object.values(standings)
    .map((group) => group[2])
    .sort(compareStandings);
  const bestThirdPlaced = thirdPlaced.slice(0, 8);

  // Map group letter -> standings, for resolving "1A" / "2A" / "3A" placeholders
  function resolveGroupRank(group: string, rank: number): string {
    return standings[group][rank - 1].team;
  }

  // ---- Knockout stage ----
  // The "Match for third place" and "Final" fixtures have no `num` of their
  // own (nothing references them via W/L placeholders), so assign synthetic
  // ones to keep them in the knockout stage.
  const KNOCKOUT_ROUNDS = [
    "Round of 32",
    "Round of 16",
    "Quarter-final",
    "Semi-final",
    "Match for third place",
    "Final",
  ];
  const knockoutRaw = RAW_MATCHES.filter((m) => KNOCKOUT_ROUNDS.includes(m.round))
    .map((m, i) => ({ ...m, num: m.num ?? 1000 + i }))
    .sort((a, b) => (a.num ?? 0) - (b.num ?? 0));

  // Assign the 8 qualified third-placed teams to the Round of 32 slots that
  // accept a "best third place" team. Most-constrained-slot-first heuristic.
  const ro32ThirdSlots = knockoutRaw
    .filter((m) => m.round === "Round of 32")
    .flatMap((m) => [
      { match: m, side: "team1" as const, placeholder: m.team1 },
      { match: m, side: "team2" as const, placeholder: m.team2 },
    ])
    .filter((s) => isThirdPlacePlaceholder(s.placeholder));

  const slotsWithCandidates = ro32ThirdSlots
    .map((s) => ({
      ...s,
      candidates: thirdPlaceCandidateGroups(s.placeholder),
    }))
    .sort((a, b) => a.candidates.length - b.candidates.length);

  const remainingThirds = [...bestThirdPlaced];
  const slotAssignment = new Map<string, string>(); // placeholder key -> team name

  for (const slot of slotsWithCandidates) {
    const idx = remainingThirds.findIndex((s) =>
      slot.candidates.includes(TEAMS_BY_NAME[s.team]?.group ?? ""),
    );
    const chosen = idx >= 0 ? remainingThirds.splice(idx, 1)[0] : remainingThirds.shift();
    const key = `${slot.match.num}|${slot.side}`;
    if (chosen) slotAssignment.set(key, chosen.team);
  }

  const matchResults = new Map<number, SimMatch>();
  const knockoutByRound = new Map<string, SimMatch[]>();

  function resolvePlaceholder(team: string, matchNum: number, side: "team1" | "team2"): string {
    const groupRank = isGroupRankPlaceholder(team);
    if (groupRank) return resolveGroupRank(groupRank.group, groupRank.rank);

    if (isThirdPlacePlaceholder(team)) {
      return slotAssignment.get(`${matchNum}|${side}`) ?? team;
    }

    const winnerLoser = isWinnerLoserPlaceholder(team);
    if (winnerLoser) {
      const ref = matchResults.get(winnerLoser.num);
      if (!ref) return team;
      return winnerLoser.kind === "W" ? ref.winner! : ref.loser!;
    }

    return team;
  }

  for (const raw of knockoutRaw) {
    const team1 = resolvePlaceholder(raw.team1, raw.num!, "team1");
    const team2 = resolvePlaceholder(raw.team2, raw.num!, "team2");

    const { score1, score2, scorers1, scorers2, penalties, winner, loser } =
      simulateKnockoutMatch(team1, team2);

    totalGoals += score1 + score2;
    totalMatches += 1;
    recordScorers(team1, scorers1);
    recordScorers(team2, scorers2);

    const match: SimMatch = {
      num: raw.num,
      round: raw.round,
      date: raw.date,
      time: raw.time,
      ground: raw.ground,
      team1: raw.team1,
      team2: raw.team2,
      resolvedTeam1: team1,
      resolvedTeam2: team2,
      score1,
      score2,
      scorers1,
      scorers2,
      penalties,
      winner,
      loser,
    };

    matchResults.set(raw.num!, match);
    (knockoutByRound.get(raw.round) ?? knockoutByRound.set(raw.round, []).get(raw.round)!).push(
      match,
    );
  }

  const roundOrder = [
    "Round of 32",
    "Round of 16",
    "Quarter-final",
    "Semi-final",
    "Match for third place",
    "Final",
  ];
  const knockout: KnockoutRound[] = roundOrder
    .filter((round) => knockoutByRound.has(round))
    .map((round) => ({ round, matches: knockoutByRound.get(round)! }));

  const final = knockoutByRound.get("Final")![0];
  const thirdPlaceMatch = knockoutByRound.get("Match for third place")![0];

  const topScorers = [...scorerTotals.values()]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 15);

  return {
    groupMatches,
    standings,
    knockout,
    topScorers,
    champion: final.winner!,
    runnerUp: final.loser!,
    thirdPlace: thirdPlaceMatch.winner!,
    fourthPlace: thirdPlaceMatch.loser!,
    totalGoals,
    totalMatches,
    bestThirdPlaced,
  };
}
