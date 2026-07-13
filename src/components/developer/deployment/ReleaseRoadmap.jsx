import React from "react";
import { ShoppingBag, Users, Brain, BookOpen, TrendingUp } from "lucide-react";

const ROADMAP_PHASES = [
  { id: "sprint_4", label: "Sprint 4", title: "Enterprise Procurement™", desc: "Package platform maturity for procurement teams and customer evaluators", icon: ShoppingBag },
  { id: "2a", label: "Phase 2A", title: "Customer Success", desc: "Onboarding, success metrics, health scoring, adoption analytics", icon: Users },
  { id: "2b", label: "Phase 2B", title: "AI Excellence", desc: "EXEC™ reasoning, coaching refinement, evidence traceability, simulator enhancements", icon: Brain },
  { id: "2c", label: "Phase 2C", title: "Content Expansion", desc: "Academy, Leadership DNA™, Executive Challenges, industry-specific learning paths", icon: BookOpen },
  { id: "2d", label: "Phase 2D", title: "Commercial Scale", desc: "Enterprise pilots, customer references, partner ecosystem, marketplace, sales enablement", icon: TrendingUp },
];

export default function ReleaseRoadmap({ sprint4Ready }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 text-white/50 text-[10px] font-medium uppercase tracking-wider mb-4">
        <TrendingUp size={12} /> Release Roadmap — After Certification
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ROADMAP_PHASES.map((phase) => {
          const Icon = phase.icon;
          const isCurrent = phase.id === "sprint_4";
          const isLocked = !isCurrent && !sprint4Ready;
          return (
            <div key={phase.id} className={`rounded-lg border p-3 ${
              isCurrent ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/5 bg-white/[0.01]"
            }`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={12} className={isCurrent ? "text-indigo-400" : isLocked ? "text-white/20" : "text-emerald-400/60"} />
                <span className={`text-[10px] font-medium uppercase tracking-wider ${isCurrent ? "text-indigo-400" : isLocked ? "text-white/30" : "text-emerald-400/60"}`}>
                  {phase.label}
                </span>
              </div>
              <div className="text-xs font-medium text-white/80 mb-1">{phase.title}</div>
              <div className="text-[10px] text-white/40 leading-relaxed">{phase.desc}</div>
              {isCurrent && (
                <div className="text-[10px] mt-2 font-medium" style={{ color: sprint4Ready ? "#10b981" : "#6366f1" }}>
                  {sprint4Ready ? "✓ Cleared to begin" : "Awaiting certification"}
                </div>
              )}
              {!isCurrent && !isLocked && (
                <div className="text-[10px] text-emerald-400/60 mt-2 font-medium">✓ Complete</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}