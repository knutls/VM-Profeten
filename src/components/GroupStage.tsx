import type { SimMatch, Standing } from "../lib/types";
import TeamLabel from "./TeamLabel";

interface Props {
  groupMatches: Record<string, SimMatch[]>;
  standings: Record<string, Standing[]>;
}

function StandingsTable({ rows }: { rows: Standing[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-slate-400 text-left border-b border-slate-700">
          <th className="py-1.5 pr-2 font-medium">#</th>
          <th className="py-1.5 pr-2 font-medium">Team</th>
          <th className="py-1.5 px-1 font-medium text-center">P</th>
          <th className="py-1.5 px-1 font-medium text-center">W</th>
          <th className="py-1.5 px-1 font-medium text-center">D</th>
          <th className="py-1.5 px-1 font-medium text-center">L</th>
          <th className="py-1.5 px-1 font-medium text-center">GF</th>
          <th className="py-1.5 px-1 font-medium text-center">GA</th>
          <th className="py-1.5 px-1 font-medium text-center">GD</th>
          <th className="py-1.5 pl-1 font-medium text-center">Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s, i) => (
          <tr
            key={s.team}
            className={`border-b border-slate-800 last:border-0 ${
              i < 2 ? "text-white" : "text-slate-400"
            }`}
          >
            <td className="py-1.5 pr-2">{i + 1}</td>
            <td className="py-1.5 pr-2 font-medium">
              <TeamLabel team={s.team} />
            </td>
            <td className="py-1.5 px-1 text-center">{s.played}</td>
            <td className="py-1.5 px-1 text-center">{s.won}</td>
            <td className="py-1.5 px-1 text-center">{s.drawn}</td>
            <td className="py-1.5 px-1 text-center">{s.lost}</td>
            <td className="py-1.5 px-1 text-center">{s.gf}</td>
            <td className="py-1.5 px-1 text-center">{s.ga}</td>
            <td className="py-1.5 px-1 text-center">{s.gd}</td>
            <td className="py-1.5 pl-1 text-center font-bold">{s.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MatchRow({ match }: { match: SimMatch }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800 last:border-0">
      <div className="flex-1 text-right pr-3">
        <TeamLabel team={match.team1} />
      </div>
      <div className="font-bold text-white tabular-nums px-2 py-0.5 rounded bg-slate-800">
        {match.score1} – {match.score2}
      </div>
      <div className="flex-1 pl-3">
        <TeamLabel team={match.team2} />
      </div>
    </div>
  );
}

export default function GroupStage({ groupMatches, standings }: Props) {
  const groups = Object.keys(standings).sort();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {groups.map((group) => (
        <div
          key={group}
          className="bg-slate-900/60 border border-slate-800 rounded-xl p-4"
        >
          <h3 className="text-lg font-bold text-emerald-400 mb-3">
            Group {group}
          </h3>
          <StandingsTable rows={standings[group]} />
          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Results
            </h4>
            {groupMatches[group].map((m, i) => (
              <MatchRow key={i} match={m} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
