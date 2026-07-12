import React, { useMemo } from "react";
import { ShieldCheck, Brain, Award, Sparkles, Rocket } from "lucide-react";
import { computeLaunchReadiness } from "@/lib/launchReadinessEngine";
import LaunchReadinessHero from "./LaunchReadinessHero";
import LaunchPhaseCard from "./LaunchPhaseCard";

const PHASE_ICONS = {
  guardian: { icon: ShieldCheck, accent: "#10b981" },
  exec_intelligence: { icon: Brain, accent: "#8b5cf6" },
  foundation_certification: { icon: Award, accent: "#06b6d4" },
  platform_iq: { icon: Sparkles, accent: "#6366f1" },
  commercial_readiness: { icon: Rocket, accent: "#f59e0b" },
};

/**
 * Launch Readiness Center™
 * The dedicated operational workspace for the Launch Readiness Program™.
 * Surfaces all 5 phases, success criteria, and clickable diagnostics.
 */
export default function LaunchReadinessCenter() {
  const readiness = useMemo(() => computeLaunchReadiness(), []);

  return (
    <div className="space-y-5">
      {/* Hero — overall status + success criteria */}
      <LaunchReadinessHero readiness={readiness} />

      {/* 5 Phase Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {readiness.phases.map((phase) => {
          const cfg = PHASE_ICONS[phase.id] || {};
          return (
            <LaunchPhaseCard
              key={phase.id}
              phase={phase}
              icon={cfg.icon}
              accent={cfg.accent}
            />
          );
        })}

        {/* Spacer card to balance the grid when 5 phases render */}
        <div className="hidden lg:flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="text-center">
            <Rocket size={28} className="text-white/10 mx-auto mb-2" />
            <p className="text-[11px] text-white/30 leading-relaxed max-w-xs">
              {readiness.program.objective}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}