import React, { useMemo } from "react";
import { generateSkillTimeline } from "@/lib/skillsIntelligenceEngine";

export default function SkillTimeline({ skills }) {
  const timeline = useMemo(() => generateSkillTimeline(skills), [skills]);

  if (timeline.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-2">Skill Timeline™</h3>
        <div className="text-center py-8">
          <p className="text-white/30 text-xs">No timeline data yet.</p>
          <p className="text-white/20 text-[10px] mt-0.5">Add "Acquired Year" to your skills to visualize your career evolution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white/80 mb-1">Skill Timeline™</h3>
      <p className="text-white/30 text-xs mb-4">Your skill evolution throughout your career</p>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
        <div className="space-y-4">
          {timeline.map((entry, idx) => (
            <div key={entry.year} className="relative pl-7">
              {/* Dot */}
              <div className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 ${entry.isLast ? "bg-indigo-500 border-indigo-400" : "bg-white/10 border-white/20"}`} />
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-sm font-bold text-white">{entry.year}</span>
                {entry.isLast && <span className="text-[10px] text-indigo-400 font-medium">Latest</span>}
                {entry.isFirst && <span className="text-[10px] text-white/30 font-medium">Started</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entry.skills.map(skill => (
                  <span key={skill.id} className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[11px] text-white/60">
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}