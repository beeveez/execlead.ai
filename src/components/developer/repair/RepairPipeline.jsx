import React from "react";
import { Search, Wrench, ShieldCheck, CheckCircle2, Circle } from "lucide-react";

const STAGES = [
  { id: "open", label: "Open", icon: Circle },
  { id: "analyze", label: "Analyze", icon: Search },
  { id: "repair", label: "Repair", icon: Wrench },
  { id: "verify", label: "Verify", icon: ShieldCheck },
  { id: "certified", label: "Certified", icon: CheckCircle2 },
];

function getCurrentStage(status, hasPatch) {
  if (status === "verified") return 4;
  if (status === "verifying") return 3;
  if (status === "applied" || status === "repairing") return 2;
  if (status === "patch_generated" || hasPatch) return 1;
  return 0;
}

export default function RepairPipeline({ repairState }) {
  const status = repairState.status || "open";
  const hasPatch = !!repairState.patch;
  const currentStage = getCurrentStage(status, hasPatch);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2.5">Repair Pipeline™</div>
      <div className="flex items-center justify-between">
        {STAGES.map((stage, i) => {
          const isActive = i === currentStage;
          const isPassed = i < currentStage;
          const Icon = stage.icon;
          const color = isPassed ? "#10b981" : isActive ? "#f59e0b" : "#64748b";
          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center border transition-all"
                  style={{ borderColor: color, backgroundColor: `${color}15` }}
                >
                  <Icon size={11} style={{ color }} />
                </div>
                <span className="text-[8px]" style={{ color: isActive ? "#f59e0b" : "rgba(255,255,255,0.3)" }}>{stage.label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className="flex-1 h-px mx-1 transition-colors"
                  style={{ backgroundColor: i < currentStage ? "#10b981" : "rgba(255,255,255,0.08)" }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}