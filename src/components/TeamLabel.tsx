import { TEAMS_BY_NAME, flagEmoji } from "../data/teams";

export default function TeamLabel({ team }: { team: string }) {
  const iso = TEAMS_BY_NAME[team]?.iso;
  return (
    <span className="inline-flex items-center gap-2">
      {iso && <span className="text-lg leading-none">{flagEmoji(iso)}</span>}
      <span>{team}</span>
    </span>
  );
}
