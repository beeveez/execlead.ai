import React from "react";
import { RELEASE_PHASES } from "@/lib/releaseReadinessEngine";
import { StatusBadge, ProgressBar } from "./Shared";
import { CheckCircle, Circle, Loader, Rocket } from "lucide-react";

export default function ReleaseTimeline() {
  const currentPhase = RELEASE_PHASES.find((p) => p.status === "in_progress");
  const completed = RELEASE_PHASES.filter((p) => p.status === "completed").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-white/40">Completed</div>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">{completed} / {RELEASE_PHASES.length}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-white/40">Current Phase</div>
          <div className="text-sm font-semibold text-amber-400 mt-0.5">{currentPhase?.name || "—"}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-white/40">Next Milestone</div>
          <div className="text-sm font-semibold text-white/70 mt-0.5">
            {RELEASE_PHASES.find((p) => p.status === "upcoming")?.name || "GA"}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-1.5 mb-4">
          <Rocket className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Release Timeline</h3>
        </div>
        <div className="space-y-0">
          {RELEASE_PHASES.map((phase, idx) => (
            <PhaseRow key={phase.id} phase={phase} isLast={idx === RELEASE_PHASES.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PhaseRow({ phase, isLast }) {
  const Icon = phase.status === "completed" ? CheckCircle : phase.status === "in_progress" ? Loader : Circle;
  const iconColor = phase.status === "completed" ? "text-emerald-400" : phase.status === "in_progress" ? "text-amber-400" : "text-white/20";
  const lineColor = phase.status === "completed" ? "bg-emerald-500/30" : "bg-white/5";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
          phase.status === "completed" ? "border-emerald-500/30 bg-emerald-500/10" :
          phase.status === "in_progress" ? "border-amber-500/30 bg-amber-500/10" :
          "border-white/10 bg-white/[0.02]"
        }`}>
          <Icon className={`w-4 h-4 ${iconColor} ${phase.status === "in_progress" ? "animate-spin" : ""}`} />
        </div>
        {!isLast && <div className={`w-0.5 flex-1 min-h-[40px] ${lineColor} mt-1`} />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{phase.name}</span>
            <StatusBadge status={phase.status} />
          </div>
          {phase.progress > 0 && <span className="text-xs font-bold text-white/60">{phase.progress}%</span>}
        </div>
        <p className="text-xs text-white/40 mt-0.5">{phase.description}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-white/30">{phase.startDate} → {phase.endDate}</span>
        </div>
        {phase.status !== "upcoming" && (
          <div className="mt-2 w-full max-w-xs">
            <ProgressBar value={phase.progress} color={phase.status === "completed" ? "emerald" : "amber"} />
          </div>
        )}
      </div>
    </div>
  );
}