import React, { useState, useMemo } from "react";
import { Library, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { QUESTION_CATEGORIES } from "@/lib/launchDefenseEngine";

/**
 * AnswerLibrary™ — every question stores multiple answer formats (15s, 30s,
 * 60s, 3-minute, executive, enterprise, investor, media, recruiter). Browse
 * and compare answer variants per question.
 */
const FORMATS = [
  { key: "short_answer", label: "60-Second Answer", icon: Clock },
  { key: "long_answer", label: "3-Minute Answer", icon: Clock },
  { key: "suggested_answer", label: "Executive Version", icon: Library },
  { key: "alternative_answer", label: "Alternative Angle", icon: Library },
];

export default function AnswerLibrary({ ld }) {
  const { questions } = ld;
  const [cat, setCat] = useState("All");
  const [openId, setOpenId] = useState(null);

  const filtered = useMemo(() => questions.filter((x) => cat === "All" || x.category === cat), [questions, cat]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><Library size={16} className="text-cyan-400" /><h3 className="text-white font-semibold text-sm">Answer Library™</h3></div>
      <select value={cat} onChange={(e) => setCat(e.target.value)} className="mb-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
        <option>All</option>
        {QUESTION_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <div className="space-y-2">
        {filtered.map((q) => {
          const hasAny = FORMATS.some((f) => q[f.key]);
          const open = openId === q.id;
          return (
            <div key={q.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <button onClick={() => setOpenId(open ? null : q.id)} disabled={!hasAny} className="w-full flex items-center justify-between gap-2 text-left">
                <span className="text-sm text-white/80">{q.question}</span>
                {hasAny && (open ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />)}
              </button>
              {open && (
                <div className="mt-3 space-y-3">
                  {FORMATS.map((f) => q[f.key] && (
                    <div key={f.key} className="bg-white/[0.02] rounded-lg p-3">
                      <div className="text-[10px] uppercase tracking-wider text-cyan-400 mb-1">{f.label}</div>
                      <p className="text-sm text-white/70 leading-relaxed">{q[f.key]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {!filtered.length && <p className="text-xs text-white/40 text-center py-8">No answers yet.</p>}
      </div>
    </div>
  );
}