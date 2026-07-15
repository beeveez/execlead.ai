import React, { useState } from "react";
import { PenLine } from "lucide-react";

const REFLECTION_PROMPTS = [
  "What leadership challenge did you face today?",
  "What decision would you handle differently?",
  "What feedback surprised you?",
  "What assumption did you challenge?",
];

export default function LeadershipReflection() {
  const [prompt, setPrompt] = useState(REFLECTION_PROMPTS[0]);
  const [reflection, setReflection] = useState("");

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <PenLine size={14} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white/80">Leadership Reflection</h3>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {REFLECTION_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => setPrompt(p)}
            className={`text-[10px] px-2.5 py-1 rounded-lg transition-colors ${
              prompt === p ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "bg-white/5 text-white/40 hover:text-white/60"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="Reflect here..."
        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/30 resize-none"
        rows={3}
      />
    </div>
  );
}