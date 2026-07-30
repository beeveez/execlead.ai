import React, { useState } from "react";
import { FolderOpen, Play, CheckCircle2 } from "lucide-react";
import { INTERVIEW_PERSONAS, difficultyColor } from "@/lib/launchDefenseEngine";

/**
 * ScenarioLibrary™ — curated high-stakes scenarios (Raise Seed Funding,
 * Series A Pitch, Enterprise Sales Demo, Board Meeting, Media Interview,
 * Conference Keynote, etc.). Launch directly into the simulator.
 */
export default function ScenarioLibrary({ ld, onTab, setSimContext }) {
  const { scenarios } = ld;
  const [persona, setPersona] = useState("Investor");

  const launch = (s) => {
    if (setSimContext) setSimContext({ scenarioId: s.id, persona: s.persona });
    onTab("simulator");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><FolderOpen size={16} className="text-amber-400" /><h3 className="text-white font-semibold text-sm">Scenario Library™</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {scenarios.map((s) => (
          <div key={s.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">{s.category || "Scenario"}</span>
              <span className="text-[10px]" style={{ color: difficultyColor(s.difficulty) }}>{s.difficulty}</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{s.name}</h4>
            <p className="text-xs text-white/50 leading-snug mb-2">{s.summary}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/40">{s.persona}</span>
              <button onClick={() => launch(s)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] transition-colors"><Play size={11} /> Launch</button>
            </div>
          </div>
        ))}
        {!scenarios.length && <p className="text-xs text-white/40 col-span-2 text-center py-8">No scenarios loaded yet.</p>}
      </div>
    </div>
  );
}