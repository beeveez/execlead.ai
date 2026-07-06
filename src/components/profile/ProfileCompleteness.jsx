import React from "react";
import { calculateCompleteness } from "@/lib/resumeSync";
import { CheckCircle2, Circle } from "lucide-react";

export default function ProfileCompleteness({ form }) {
  const { sections, overall } = calculateCompleteness(form);

  const orderedKeys = ["personal", "executive", "experience", "education", "certifications", "skills", "social", "languages", "projects", "awards"];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Identity Completion</span>
        <span className="text-2xl font-bold text-white">{overall}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            overall >= 80 ? "bg-emerald-500" : overall >= 50 ? "bg-indigo-500" : "bg-amber-500"
          }`}
          style={{ width: `${overall}%` }}
        />
      </div>
      <div className="space-y-1.5">
        {orderedKeys.map((key) => {
          const s = sections[key];
          if (!s) return null;
          return (
            <div key={key} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {s.score >= 100 ? (
                  <CheckCircle2 size={12} className="text-emerald-400" />
                ) : (
                  <Circle size={12} className="text-white/20" />
                )}
                <span className="text-white/50">{s.label}</span>
              </div>
              <span className={`font-medium ${s.score >= 80 ? "text-emerald-400" : s.score >= 50 ? "text-indigo-400" : s.score > 0 ? "text-amber-400" : "text-white/30"}`}>
                {s.score}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}