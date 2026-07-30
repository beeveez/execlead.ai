import React, { useState, useMemo } from "react";
import { Search, Compass } from "lucide-react";
import { DECISION_CATEGORIES, difficultyColor, categoryColor } from "@/lib/decisionLabEngine";

/**
 * ScenarioBrowser — searchable, category-filtered library of decision
 * scenarios. Selecting a scenario opens it in the ScenarioPlayer.
 */
export default function ScenarioBrowser({ ld, onOpen }) {
  const { scenarios, attempts } = ld;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const doneIds = useMemo(() => new Set(attempts.map((a) => a.scenario_id)), [attempts]);

  const filtered = useMemo(() => scenarios.filter((s) => {
    const matchCat = cat === "All" || s.category === cat;
    const matchQ = !q || (s.title || "").toLowerCase().includes(q.toLowerCase()) || (s.background || "").toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  }), [scenarios, q, cat]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><Compass size={16} className="text-amber-400" /><h3 className="text-white font-semibold text-sm">Scenario Library™</h3><span className="text-xs text-white/30">({scenarios.length})</span></div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search scenarios…" className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          <option>All</option>
          {DECISION_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((s) => {
          const done = doneIds.has(s.scenario_id);
          return (
            <button key={s.id} onClick={() => onOpen(s)} className="text-left bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${categoryColor(s.category)}22`, color: categoryColor(s.category) }}>{s.category}</span>
                <div className="flex items-center gap-1.5">
                  {done && <span className="text-[10px] text-emerald-400">✓ Done</span>}
                  <span className="text-[10px]" style={{ color: difficultyColor(s.difficulty) }}>{s.difficulty}</span>
                </div>
              </div>
              <p className="text-sm text-white/80 font-medium leading-snug mb-1">{s.title}</p>
              <p className="text-xs text-white/40 leading-snug line-clamp-2">{s.background}</p>
            </button>
          );
        })}
        {!filtered.length && <p className="text-xs text-white/40 col-span-2 text-center py-8">No scenarios match your filter.</p>}
      </div>
    </div>
  );
}