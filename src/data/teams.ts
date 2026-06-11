export interface TeamInfo {
  name: string;
  group: string;
  /** Approximate overall strength rating (higher = stronger) */
  rating: number;
  /** ISO 3166-1 alpha-2 code, used to render the flag emoji */
  iso: string;
}

// Approximate strength ratings based on FIFA World Ranking / squad quality.
// Used purely to weight the local match simulation.
export const TEAMS: TeamInfo[] = [
  // Group A
  { name: "Mexico", group: "A", rating: 75, iso: "MX" },
  { name: "South Korea", group: "A", rating: 75, iso: "KR" },
  { name: "Czech Republic", group: "A", rating: 71, iso: "CZ" },
  { name: "South Africa", group: "A", rating: 64, iso: "ZA" },

  // Group B
  { name: "Switzerland", group: "B", rating: 77, iso: "CH" },
  { name: "Canada", group: "B", rating: 74, iso: "CA" },
  { name: "Bosnia & Herzegovina", group: "B", rating: 71, iso: "BA" },
  { name: "Qatar", group: "B", rating: 67, iso: "QA" },

  // Group C
  { name: "Brazil", group: "C", rating: 90, iso: "BR" },
  { name: "Morocco", group: "C", rating: 80, iso: "MA" },
  { name: "Scotland", group: "C", rating: 73, iso: "GB-SCT" },
  { name: "Haiti", group: "C", rating: 60, iso: "HT" },

  // Group D
  { name: "USA", group: "D", rating: 77, iso: "US" },
  { name: "Turkey", group: "D", rating: 76, iso: "TR" },
  { name: "Australia", group: "D", rating: 70, iso: "AU" },
  { name: "Paraguay", group: "D", rating: 69, iso: "PY" },

  // Group E
  { name: "Germany", group: "E", rating: 85, iso: "DE" },
  { name: "Ivory Coast", group: "E", rating: 76, iso: "CI" },
  { name: "Ecuador", group: "E", rating: 75, iso: "EC" },
  { name: "Curaçao", group: "E", rating: 60, iso: "CW" },

  // Group F
  { name: "Netherlands", group: "F", rating: 85, iso: "NL" },
  { name: "Japan", group: "F", rating: 78, iso: "JP" },
  { name: "Sweden", group: "F", rating: 73, iso: "SE" },
  { name: "Tunisia", group: "F", rating: 71, iso: "TN" },

  // Group G
  { name: "Belgium", group: "G", rating: 82, iso: "BE" },
  { name: "Egypt", group: "G", rating: 74, iso: "EG" },
  { name: "Iran", group: "G", rating: 71, iso: "IR" },
  { name: "New Zealand", group: "G", rating: 63, iso: "NZ" },

  // Group H
  { name: "Spain", group: "H", rating: 91, iso: "ES" },
  { name: "Uruguay", group: "H", rating: 80, iso: "UY" },
  { name: "Saudi Arabia", group: "H", rating: 69, iso: "SA" },
  { name: "Cape Verde", group: "H", rating: 65, iso: "CV" },

  // Group I
  { name: "France", group: "I", rating: 89, iso: "FR" },
  { name: "Senegal", group: "I", rating: 78, iso: "SN" },
  { name: "Norway", group: "I", rating: 76, iso: "NO" },
  { name: "Iraq", group: "I", rating: 64, iso: "IQ" },

  // Group J
  { name: "Argentina", group: "J", rating: 90, iso: "AR" },
  { name: "Austria", group: "J", rating: 76, iso: "AT" },
  { name: "Algeria", group: "J", rating: 75, iso: "DZ" },
  { name: "Jordan", group: "J", rating: 63, iso: "JO" },

  // Group K
  { name: "Portugal", group: "K", rating: 87, iso: "PT" },
  { name: "Colombia", group: "K", rating: 79, iso: "CO" },
  { name: "Uzbekistan", group: "K", rating: 65, iso: "UZ" },
  { name: "DR Congo", group: "K", rating: 64, iso: "CD" },

  // Group L
  { name: "England", group: "L", rating: 88, iso: "GB-ENG" },
  { name: "Croatia", group: "L", rating: 81, iso: "HR" },
  { name: "Ghana", group: "L", rating: 70, iso: "GH" },
  { name: "Panama", group: "L", rating: 66, iso: "PA" },
];

export const TEAMS_BY_NAME: Record<string, TeamInfo> = Object.fromEntries(
  TEAMS.map((t) => [t.name, t]),
);

export const GROUPS: Record<string, TeamInfo[]> = TEAMS.reduce(
  (acc, team) => {
    (acc[team.group] ??= []).push(team);
    return acc;
  },
  {} as Record<string, TeamInfo[]>,
);

/** Renders a flag emoji for a given ISO code (falls back to a ball for sub-national teams). */
export function flagEmoji(iso: string): string {
  if (iso === "GB-SCT") return "🏴";
  if (iso === "GB-ENG") return "🏴";
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
