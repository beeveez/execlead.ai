import React, { useState } from "react";
import CompetencyRadar from "@/components/leadership-dna/CompetencyRadar";
import { Pencil, Save, X } from "lucide-react";

export default function ExecutiveDna({ scores, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(scores);

  const avg = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : 0;
  const highest = scores.length ? [...scores].sort((a, b) => b.score - a.score)[0] : null;
  const lowest = scores.length ? [...scores].sort((a, b) => a.score - b.score)[0] : null;

  const handleScoreChange = (idx, value) => {
    const next = [...draft];
    next[idx] = { ...next[idx], score: parseInt(value) };
    setDraft(next);
  };

  const handleSave = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(scores);
    setEditing(false);
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Executive DNA</h2>
          <p className="text-white/30 text-xs mt-0.5">Competency profile across 9 dimensions</p>
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <button onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors"><X size={14} /> Cancel</button>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"><Save size={14} /> Save</button>
          </div>
        ) : (
          <button onClick={() => { setDraft(scores); setEditing(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors"><Pencil size={14} /> Edit</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <CompetencyRadar data={editing ? draft : scores} />
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{avg}</div>
              <div className="text-white/30 text-xs">Average</div>
            </div>
            {highest && (
              <div className="text-center">
                <div className="text-sm font-medium text-emerald-400">{highest.competency}</div>
                <div className="text-white/30 text-xs">Top: {highest.score}</div>
              </div>
            )}
            {lowest && (
              <div className="text-center">
                <div className="text-sm font-medium text-amber-400">{lowest.competency}</div>
                <div className="text-white/30 text-xs">Growth: {lowest.score}</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {(editing ? draft : scores).map((s, idx) => (
            <div key={s.competency}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/60 text-sm">{s.competency}</span>
                <span className="text-white font-bold text-sm">{s.score}</span>
              </div>
              {editing ? (
                <input type="range" min="0" max="100" value={s.score} onChange={(e) => handleScoreChange(idx, e.target.value)}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500" />
              ) : (
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.score >= 85 ? "bg-emerald-500" : s.score >= 70 ? "bg-indigo-500" : "bg-amber-500"}`} style={{ width: `${s.score}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}