import React, { useState } from "react";
import { ShieldAlert, ChevronRight, TrendingDown, Eye, AlertOctagon, Layers, GitBranch, Clock } from "lucide-react";
import { computeRiskMatrix } from "@/lib/foundationCertificationEngine";
import MetadataDrawer from "../metadata/MetadataDrawer";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";

const RISK_ICONS = {
  operational_stagnation: TrendingDown,
  critical_blockers: AlertOctagon,
  visibility_gap: Eye,
  discoverability_gap: Eye,
  high_severity_backlog: Layers,
  dependency_cascading: GitBranch,
  certification_latency: Clock,
};

const SEVERITY_STYLES = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function RiskMatrix({ cert }) {
  const [activeRisk, setActiveRisk] = useState(null);
  const risks = computeRiskMatrix(cert);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={16} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white">Risk Matrix™ — Click any risk for impact analysis</h3>
        <span className="text-xs text-white/40">{risks.length} risks</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {risks.map((risk) => {
          const Icon = RISK_ICONS[risk.id] || ShieldAlert;
          return (
            <button
              key={risk.id}
              onClick={() => setActiveRisk(risk)}
              className={`rounded-lg p-3 border text-left transition-all hover:scale-[1.01] ${SEVERITY_STYLES[risk.severity]}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} />
                <span className="text-xs font-bold text-white/90">{risk.label}</span>
                <span className="ml-auto text-[9px] uppercase opacity-60">{risk.severity}</span>
              </div>
              <p className="text-[11px] text-white/50 line-clamp-2">{risk.description}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] opacity-60">
                Score Impact: {risk.scoreImpact} <ChevronRight size={9} className="ml-auto" />
              </div>
            </button>
          );
        })}
      </div>

      {risks.length === 0 && (
        <div className="text-center py-6 text-xs text-emerald-400">No risks detected — platform is at target.</div>
      )}

      {activeRisk && (
        <MetadataDrawer
          title={activeRisk.label}
          subtitle="Risk Impact Analysis™ — Drill-Down"
          icon={RISK_ICONS[activeRisk.id] || ShieldAlert}
          onClose={() => setActiveRisk(null)}
          maxWidth="max-w-lg"
          footer={<ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix={`${activeRisk.label}-Risk`} supportCSV />}
        >
          <div className="space-y-4">
            <div className={`rounded-lg p-3 border ${SEVERITY_STYLES[activeRisk.severity]}`}>
              <p className="text-xs text-white/80">{activeRisk.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailStat label="Severity" value={activeRisk.severity} />
              <DetailStat label="Score Impact" value={`${activeRisk.scoreImpact}`} />
              <DetailStat label="Timeline" value={activeRisk.timeline} />
              <DetailStat label="Owner" value={activeRisk.owner} />
            </div>

            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Estimated Impact</h4>
              <p className="text-xs text-white/60 bg-white/[0.02] border border-white/5 rounded-lg p-3">{activeRisk.estimatedImpact}</p>
            </div>

            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Mitigation</h4>
              <p className="text-xs text-emerald-300/80 bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3">{activeRisk.mitigation}</p>
            </div>

            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Affected Modules ({activeRisk.affectedModules.length})</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeRisk.affectedModules.map((m) => (
                  <span key={m} className="text-[10px] bg-white/5 text-white/60 rounded px-2 py-0.5 border border-white/5">{m}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Affected Features</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeRisk.affectedFeatures.map((f) => (
                  <span key={f} className="text-[10px] bg-white/5 text-white/60 rounded px-2 py-0.5 border border-white/5">{f}</span>
                ))}
              </div>
            </div>

            {activeRisk.affectedComponents && (
              <div>
                <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Affected Components ({activeRisk.affectedComponents.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeRisk.affectedComponents.map((c) => <span key={c} className="text-[10px] bg-white/5 text-white/60 rounded px-2 py-0.5 border border-white/5">{c}</span>)}
                </div>
              </div>
            )}

            {activeRisk.affectedReleases && (
              <div>
                <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Affected Releases</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeRisk.affectedReleases.map((r) => <span key={r} className="text-[10px] bg-red-500/5 text-red-400 rounded px-2 py-0.5 border border-red-500/10">{r}</span>)}
                </div>
              </div>
            )}

            {activeRisk.affectedPipelines && (
              <div>
                <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Affected Pipelines</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeRisk.affectedPipelines.map((p) => <span key={p} className="text-[10px] bg-amber-500/5 text-amber-400 rounded px-2 py-0.5 border border-amber-500/10">{p}</span>)}
                </div>
              </div>
            )}

            {activeRisk.blockedReleases && activeRisk.blockedReleases.length > 0 && (
              <div>
                <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Blocked Releases</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeRisk.blockedReleases.map((r) => <span key={r} className="text-[10px] bg-red-500/10 text-red-400 rounded px-2 py-0.5 border border-red-500/20">{r}</span>)}
                </div>
              </div>
            )}

            {activeRisk.remainingRequirements && activeRisk.remainingRequirements.length > 0 && (
              <div>
                <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Remaining Requirements</h4>
                <div className="space-y-1">
                  {activeRisk.remainingRequirements.map((r, i) => <div key={i} className="text-[11px] text-white/60 bg-white/[0.02] border border-white/5 rounded px-2 py-1 font-mono">{r}</div>)}
                </div>
              </div>
            )}

            {activeRisk.evidence && (
              <div>
                <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Evidence</h4>
                <div className="space-y-1">
                  {activeRisk.evidence.map((e, i) => <div key={i} className="text-[11px] text-white/50 bg-white/[0.02] border border-white/5 rounded px-2 py-1 font-mono">{e}</div>)}
                </div>
              </div>
            )}

            {activeRisk.riskLevel && (
              <div className="grid grid-cols-2 gap-3">
                <DetailStat label="Risk Level" value={activeRisk.riskLevel} />
              </div>
            )}
          </div>
        </MetadataDrawer>
      )}
    </div>
  );
}

function DetailStat({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-white/70 mt-0.5 truncate">{value}</div>
    </div>
  );
}