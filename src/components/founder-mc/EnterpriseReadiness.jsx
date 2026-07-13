import React, { useMemo, useState } from "react";
import SectionCard from "./SectionCard";
import EnterpriseTimeline from "./EnterpriseTimeline";
import { Building2, CheckCircle2, AlertCircle, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
import { STATUS_CONFIG } from "@/lib/founderMissionControl";
import { computeScoreExplanation } from "@/lib/scoreExplainableEngine";
import ScoreExplainableDrawer from "@/components/score/ScoreExplainableDrawer";
import ContributionDiagnostics from "@/components/score/ContributionDiagnostics";

export default function EnterpriseReadiness({ snapshot, user }) {
  const [activeCapability, setActiveCapability] = useState(null);
  const [showWhyNot, setShowWhyNot] = useState(false);

  const explanation = useMemo(() => computeScoreExplanation("enterprise", snapshot), [snapshot]);
  const enterprise = snapshot?.enterprise;
  if (!explanation) return null;

  const completed = explanation.contributions.filter((c) => c.gap === 0).length;
  const remaining = explanation.contributions.filter((c) => c.gap > 0).length;
  const total = explanation.contributions.length;

  const scim = explanation.contributions.find((c) => c.id === "scim");
  const procurement = explanation.contributions.find((c) => c.id === "procurement");
  const currentScore = explanation.currentScore;
  const projectedAfterScim = currentScore + (scim?.maxPoints || 0);
  const projectedAfterProcurement = projectedAfterScim + (procurement?.maxPoints || 0);

  return (
    <SectionCard
      title="Enterprise Readiness™"
      subtitle={`${currentScore}% ready · ${completed}/${total} capabilities complete`}
      icon={Building2}
      accent="cyan"
    >
      {/* Completed / Remaining counts */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-[10px] text-white/40 uppercase">Completed Capabilities</span>
          </div>
          <div className="text-lg font-bold text-emerald-400">{completed} <span className="text-sm text-white/30">/ {total}</span></div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle size={12} className="text-amber-400" />
            <span className="text-[10px] text-white/40 uppercase">Remaining Capabilities</span>
          </div>
          <div className="text-lg font-bold text-amber-400">{remaining} <span className="text-sm text-white/30">/ {total}</span></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-4">
        <EnterpriseTimeline
          currentScore={currentScore}
          projectedAfterScim={projectedAfterScim}
          projectedAfterProcurement={projectedAfterProcurement}
          projectedCompletion={explanation.projectedCompletion}
          confidence={explanation.confidence}
        />
      </div>

      {/* Why not 100%? */}
      <button
        onClick={() => setShowWhyNot(true)}
        className="w-full flex items-center justify-center gap-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 rounded-lg px-4 py-2 mb-4 transition-colors"
      >
        <Sparkles size={13} />
        <span className="text-xs font-medium">Why not 100%?</span>
        <span className="text-[9px] text-violet-400/50">EXEC™ answers with live telemetry</span>
      </button>

      {/* Capability Grid */}
      <div className="mb-4">
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Enterprise Capabilities — click any for diagnostics</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {explanation.contributions.map((c) => {
            const isComplete = c.gap === 0;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCapability(c.id)}
                className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-left hover:bg-white/[0.04] hover:border-white/10 transition-colors group"
              >
                {isComplete ? (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle size={14} className="text-amber-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/70 font-medium truncate group-hover:text-cyan-300 transition-colors">{c.label}</div>
                  <div className="text-[10px] text-white/40">{c.earnedPoints}/{c.maxPoints} pts {isComplete ? "· Complete" : `· ${c.gap} pts remaining`}</div>
                </div>
                <ChevronRight size={12} className="text-white/20 group-hover:text-cyan-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Compliance Roadmap */}
      {enterprise?.complianceFrameworks && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck size={11} className="text-white/30" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Compliance Roadmap</span>
          </div>
          {enterprise.complianceFrameworks.slice(0, 5).map((fw) => {
            const cfg = STATUS_CONFIG[fw.status] || STATUS_CONFIG.not_started;
            return (
              <div key={fw.name} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{fw.name}</span>
                <span style={{ color: cfg.color }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawers */}
      {activeCapability && (
        <ContributionDiagnostics
          scoreId="enterprise"
          contributionId={activeCapability}
          snapshot={snapshot}
          user={user}
          onClose={() => setActiveCapability(null)}
        />
      )}
      {showWhyNot && (
        <ScoreExplainableDrawer
          scoreId="enterprise"
          snapshot={snapshot}
          user={user}
          onClose={() => setShowWhyNot(false)}
        />
      )}
    </SectionCard>
  );
}