import React, { useState } from "react";
import { ShieldAlert, ChevronRight, AlertTriangle, AlertCircle } from "lucide-react";
import { computeMetadataRiskMatrix } from "@/lib/metadataIntelligenceEngine";
import MetadataDrawer from "./MetadataDrawer";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildMetadataReport } from "@/lib/reports/metadataReportBuilder";

const SEVERITY_STYLES = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function MetadataRiskAnalysis({ report }) {
  const [active, setActive] = useState(null);
  const risks = computeMetadataRiskMatrix(report);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={16} className="text-red-400" />
        <h3 className="text-sm font-bold text-white">Risk Analysis™ — Live Risk Telemetry</h3>
        <span className="text-xs text-white/40">{risks.length} risks</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {risks.map((r) => (
          <button key={r.id} onClick={() => setActive(r)} className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.01] ${SEVERITY_STYLES[r.severity]}`}>
            <div className="flex items-center gap-2 mb-2">
              {r.severity === "critical" ? <AlertCircle size={14} /> : <AlertTriangle size={14} />}
              <span className="text-xs font-bold flex-1">{r.label}</span>
              <span className="text-[9px] uppercase opacity-70">{r.severity}</span>
            </div>
            <p className="text-[11px] text-white/60 mb-2">{r.description}</p>
            <div className="flex items-center gap-1 text-[9px] text-white/40">
              Score impact: <span className="text-white/70 font-mono">-{r.scoreImpact}</span>
              <ChevronRight size={10} className="ml-auto" />
            </div>
          </button>
        ))}
      </div>

      {risks.length === 0 && <div className="text-center py-6 text-xs text-emerald-400">No risks detected — all metadata at target.</div>}

      {active && (
        <MetadataDrawer title={active.label} subtitle="Risk Diagnostics™ — Drill-Down" icon={ShieldAlert} onClose={() => setActive(null)} maxWidth="max-w-lg"
          footer={<ReportToolbar reportBuilder={buildMetadataReport} filenamePrefix={`${active.label}-Risk`} supportCSV />}>
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3"><p className="text-xs text-white/60">{active.description}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <DetailStat label="Severity" value={active.severity} />
              <DetailStat label="Score Impact" value={`-${active.scoreImpact}`} />
              <DetailStat label="Owner" value={active.owner} />
              {active.affectedAssets !== undefined && <DetailStat label="Affected Assets" value={active.affectedAssets} />}
              {active.unregisteredAssets !== undefined && <DetailStat label="Unregistered Assets" value={active.unregisteredAssets} />}
              {active.syncErrors !== undefined && <DetailStat label="Sync Errors" value={active.syncErrors} />}
              {active.currentQueue !== undefined && <DetailStat label="Current Queue" value={active.currentQueue} />}
              {active.latency && <DetailStat label="Latency" value={active.latency} />}
              {active.missingEntries !== undefined && <DetailStat label="Missing Entries" value={active.missingEntries} />}
              {active.trend && <DetailStat label="Trend" value={active.trend} />}
            </div>
            {active.affectedRegistries && (
              <div>
                <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Affected Registries</h4>
                <div className="flex flex-wrap gap-1.5">{active.affectedRegistries.map((r) => <span key={r} className="text-[10px] bg-red-500/5 text-red-400 rounded px-2 py-0.5 border border-red-500/10">{r}</span>)}</div>
              </div>
            )}
            {active.affectedCapabilities && (
              <div>
                <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Affected Capabilities ({active.affectedCapabilities.length})</h4>
                <div className="flex flex-wrap gap-1.5">{active.affectedCapabilities.slice(0, 15).map((c) => <span key={c} className="text-[10px] bg-white/5 text-white/60 rounded px-2 py-0.5 border border-white/5">{c}</span>)}</div>
              </div>
            )}
            {active.brokenAt && (
              <div>
                <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Broken At</h4>
                <div className="flex flex-wrap gap-1.5">{active.brokenAt.map((b) => <span key={b} className="text-[10px] bg-red-500/10 text-red-400 rounded px-2 py-0.5 border border-red-500/20">{b}</span>)}</div>
              </div>
            )}
            {active.evidence && (
              <div>
                <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Evidence</h4>
                <div className="space-y-1">{active.evidence.map((e, i) => <div key={i} className="text-[11px] text-white/50 bg-white/[0.02] border border-white/5 rounded px-2 py-1 font-mono">{e}</div>)}</div>
              </div>
            )}
            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Mitigation</h4>
              <p className="text-xs text-white/60 bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">{active.mitigation || active.repairRecommendation}</p>
            </div>
          </div>
        </MetadataDrawer>
      )}
    </div>
  );
}

function DetailStat({ label, value }) {
  return (<div className="bg-white/[0.02] border border-white/5 rounded-lg p-2"><div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div><div className="text-xs text-white/70 mt-0.5 truncate">{value}</div></div>);
}