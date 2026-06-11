interface Props {
  onSimulate: () => void;
}

export default function StartScreen({ onSimulate }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-4 py-24">
      <p className="text-emerald-400 font-semibold tracking-widest uppercase mb-4">
        June 11 – July 19, 2026 · USA · Mexico · Canada
      </p>
      <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 tracking-tight">
        2026 World Cup Simulator
      </h1>
      <p className="text-slate-400 max-w-xl mb-10 text-lg">
        48 teams. 12 groups. One champion. Simulate the entire tournament — every
        group stage match and the full knockout bracket — and explore the
        results, standings, and top scorers.
      </p>
      <button
        onClick={onSimulate}
        className="rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors px-10 py-4 text-lg font-bold text-slate-950 shadow-lg shadow-emerald-500/30 cursor-pointer"
      >
        Simulate the Tournament
      </button>
    </div>
  );
}
