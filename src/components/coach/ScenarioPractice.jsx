import React from "react";
import { Clapperboard } from "lucide-react";

const SCENARIOS = [
  { title: "Board Presentation", desc: "Present a new strategic initiative to the board with limited time and skeptical members." },
  { title: "Budget Reduction", desc: "Cut 15% from your department's budget while maintaining key deliverables and team morale." },
  { title: "Executive Conflict", desc: "Resolve a disagreement between two senior leaders reporting to you." },
  { title: "Organizational Change", desc: "Communicate a major restructuring to your team and manage resistance." },
  { title: "Performance Conversation", desc: "Deliver difficult feedback to a high-performing but difficult executive." },
  { title: "Customer Escalation", desc: "Handle a critical customer escalation that requires executive intervention." },
];

export default function ScenarioPractice() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Clapperboard size={14} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-white/80">Scenario Practice</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SCENARIOS.map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-xs font-medium text-white/70 mb-1">{s.title}</div>
            <div className="text-[10px] text-white/40 leading-relaxed">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}