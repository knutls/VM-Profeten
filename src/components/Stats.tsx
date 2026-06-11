import type { SimulationResult } from "../lib/types";
import TeamLabel from "./TeamLabel";

export default function Stats({ result }: { result: SimulationResult }) {
  const { topScorers, champion, runnerUp, thirdPlace, fourthPlace, totalGoals, totalMatches } =
    result;
  const avgGoals = (totalGoals / totalMatches).toFixed(2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <h3 className="text-lg font-bold text-amber-400 mb-4">Final Standings</h3>
        <ol className="space-y-3 text-white">
          <li className="flex items-center gap-3">
            <span className="text-2xl">🥇</span>
            <span className="font-bold text-lg">
              <TeamLabel team={champion} />
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">🥈</span>
            <span className="font-medium">
              <TeamLabel team={runnerUp} />
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">🥉</span>
            <span className="font-medium">
              <TeamLabel team={thirdPlace} />
            </span>
          </li>
          <li className="flex items-center gap-3 text-slate-400">
            <span className="text-2xl">4️⃣</span>
            <span>
              <TeamLabel team={fourthPlace} />
            </span>
          </li>
        </ol>

        <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{totalMatches}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Matches</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalGoals}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Goals</div>
          </div>
          <div className="col-span-2">
            <div className="text-2xl font-bold text-white">{avgGoals}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Goals per match
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <h3 className="text-lg font-bold text-emerald-400 mb-4">
          Top Scorers (Golden Boot)
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-700">
              <th className="py-1.5 pr-2 font-medium">#</th>
              <th className="py-1.5 pr-2 font-medium">Player</th>
              <th className="py-1.5 pr-2 font-medium">Team</th>
              <th className="py-1.5 pl-2 font-medium text-right">Goals</th>
            </tr>
          </thead>
          <tbody>
            {topScorers.map((s, i) => (
              <tr
                key={`${s.name}-${s.team}`}
                className={`border-b border-slate-800 last:border-0 ${
                  i === 0 ? "text-amber-400 font-bold" : "text-white"
                }`}
              >
                <td className="py-1.5 pr-2">{i + 1}</td>
                <td className="py-1.5 pr-2">{s.name}</td>
                <td className="py-1.5 pr-2 text-slate-400 font-normal">
                  <TeamLabel team={s.team} />
                </td>
                <td className="py-1.5 pl-2 text-right tabular-nums">{s.goals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
