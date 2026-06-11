import type { KnockoutRound, SimMatch } from "../lib/types";
import TeamLabel from "./TeamLabel";

function MatchCard({ match }: { match: SimMatch }) {
  const team1Won = match.winner === match.resolvedTeam1;
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 w-64">
      <div
        className={`flex items-center justify-between text-sm py-1 ${
          team1Won ? "text-white font-semibold" : "text-slate-400"
        }`}
      >
        <TeamLabel team={match.resolvedTeam1} />
        <span className="tabular-nums">{match.score1}</span>
      </div>
      <div
        className={`flex items-center justify-between text-sm py-1 ${
          !team1Won ? "text-white font-semibold" : "text-slate-400"
        }`}
      >
        <TeamLabel team={match.resolvedTeam2} />
        <span className="tabular-nums">{match.score2}</span>
      </div>
      {match.penalties && (
        <div className="text-xs text-amber-400 mt-1 text-center">
          Pens: {match.penalties.score1} – {match.penalties.score2}
        </div>
      )}
      <div className="text-[11px] text-slate-500 mt-1 text-center">
        {match.ground}
      </div>
    </div>
  );
}

export default function Knockout({ rounds }: { rounds: KnockoutRound[] }) {
  const bracketRounds = rounds.filter(
    (r) => r.round !== "Match for third place" && r.round !== "Final",
  );
  const thirdPlace = rounds.find((r) => r.round === "Match for third place");
  const final = rounds.find((r) => r.round === "Final");

  return (
    <div>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {bracketRounds.map((round) => (
          <div key={round.round} className="flex flex-col gap-4 shrink-0">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide text-center">
              {round.round}
            </h3>
            <div className="flex flex-col gap-4 justify-around flex-1">
              {round.matches.map((m, i) => (
                <MatchCard key={i} match={m} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        {final && (
          <div>
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide text-center mb-4">
              🏆 Final
            </h3>
            <MatchCard match={final.matches[0]} />
          </div>
        )}
        {thirdPlace && (
          <div>
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide text-center mb-4">
              Third Place Match
            </h3>
            <MatchCard match={thirdPlace.matches[0]} />
          </div>
        )}
      </div>
    </div>
  );
}
