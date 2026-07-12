import React from "react";
import SectionCard from "./SectionCard";
import { Map, CheckCircle2, ArrowRight, Flag } from "lucide-react";

export default function Roadmap({ roadmap }) {
  return (
    <SectionCard title="Roadmap" subtitle="Stream progression and next actions" icon={Map} accent="amber">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Current Stream</div>
          <div className="text-sm font-medium text-white">{roadmap.currentStream}</div>
        </div>
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Current Sprint</div>
          <div className="text-sm font-medium text-white">{roadmap.currentSprint}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Next Milestone</div>
          <div className="text-sm text-cyan-400">{roadmap.nextMilestone}</div>
        </div>
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Future Streams</div>
          <div className="text-sm text-white/60">{roadmap.futureStreams.length > 0 ? roadmap.futureStreams.join(", ") : "—"}</div>
        </div>
      </div>
      {roadmap.completedMilestones.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Completed Milestones</div>
          <div className="flex flex-wrap gap-1.5">
            {roadmap.completedMilestones.map((m) => (
              <span key={m} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={9} /> {m}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-start gap-2 bg-indigo-500/5 border border-indigo-500/15 rounded-lg p-3">
        <Flag size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-[10px] text-indigo-400 uppercase tracking-wider mb-0.5">Recommended Next Action</div>
          <div className="text-sm text-white/70">{roadmap.recommendedAction}</div>
        </div>
      </div>
    </SectionCard>
  );
}