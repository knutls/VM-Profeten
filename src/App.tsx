import { useState } from "react";
import StartScreen from "./components/StartScreen";
import GroupStage from "./components/GroupStage";
import Knockout from "./components/Knockout";
import Stats from "./components/Stats";
import { simulateWorldCup } from "./lib/simulate";
import type { SimulationResult } from "./lib/types";

type Tab = "groups" | "knockout" | "stats";

function App() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [tab, setTab] = useState<Tab>("groups");

  function handleSimulate() {
    setResult(simulateWorldCup());
    setTab("groups");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <span className="font-extrabold text-white text-lg tracking-tight">
            World Cup 2026 Simulator
          </span>
        </div>
        {result && (
          <button
            onClick={handleSimulate}
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors px-5 py-2 text-sm font-bold text-slate-950 cursor-pointer"
          >
            Re-simulate
          </button>
        )}
      </header>

      {!result ? (
        <StartScreen onSimulate={handleSimulate} />
      ) : (
        <main className="flex-1 px-6 py-6 max-w-7xl w-full mx-auto">
          <nav className="flex gap-2 mb-6">
            {(
              [
                ["groups", "Group Stage"],
                ["knockout", "Knockout Stage"],
                ["stats", "Stats"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  tab === key
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {tab === "groups" && (
            <GroupStage groupMatches={result.groupMatches} standings={result.standings} />
          )}
          {tab === "knockout" && <Knockout rounds={result.knockout} />}
          {tab === "stats" && <Stats result={result} />}
        </main>
      )}

      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        Fixtures &amp; groups data from{" "}
        <a
          href="https://github.com/openfootball/worldcup.json"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-slate-300"
        >
          openfootball/worldcup.json
        </a>
        . All results are randomly simulated for entertainment purposes.
      </footer>
    </div>
  );
}

export default App;
