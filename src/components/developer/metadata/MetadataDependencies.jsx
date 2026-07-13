import React, { useState } from "react";
import { GitBranch, ChevronRight, ExternalLink, AlertCircle, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { computeMetadataDependencies } from "@/lib/metadataIntelligenceEngine";
import MetadataDrawer from "./MetadataDrawer";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildMetadataReport } from "@/lib/reports/metadataReportBuilder";

const COLOR_MAP = {
  operational: { text: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  degraded: { text: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20", dot: "bg-amber-400" },
};

export default function MetadataDependencies({ report }) {
  const [active, setActive] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const deps = computeMetadataDependencies(report);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Dependencies™ — Click any node for diagnostics</h3>
      </div>

      <div className="flex flex-col items-center">
        {deps.map((dep, i) => {
          const status = dep.currentStatus === "Operational" ? "operational" : "degraded";
          const colors = COLOR_MAP[status];
          const isLast = i === deps.length - 1;
          const isExpanded = expanded === dep.id;
          return (
            <React.Fragment key={dep.id}>
              <button onClick={() => setActive(dep)} className={`relative flex items-center gap-3 ${colors.bg} ${colors.border} border rounded-xl px-4 py-3 w-full max-w-md transition-all hover:scale-[1.01] group`}>
                <div className={`w-9 h-9 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                  <GitBranch size={16} className={colors.text} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className={`text-sm font-bold ${colors.text}`}>{dep.label}</div>
                  <div className="text-[10px] text-white/30 truncate">{dep.description}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {dep.errors > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{dep.errors} err</span>}
                  {dep.warnings > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">{dep.warnings} warn</span>}
                  {dep.errors === 0 && dep.warnings === 0 && <CheckCircle2 size={12} className="text-emerald-400" />}
                  <ChevronRight size={14} className={`${colors.text} opacity-50 group-hover:opacity-100`} />
                </div>
              </button>
              {!isLast && <div className="w-px h-6 bg-gradient-to-b from-white/10 to-white/5" />}
            </React.Fragment>
          );
        })}
      </div>

      {active && (
        <MetadataDrawer title={active.label} subtitle="Dependency Diagnostics™ — Drill-Down" icon={GitBranch} onClose={() => setActive(null)} maxWidth="max-w-lg"
          footer={<ReportToolbar reportBuilder={buildMetadataReport} filenamePrefix={`${active.label}-Diagnostics`} supportCSV />}>
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3"><p className="text-xs text-white/60">{active.description}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <DetailStat label="Current Status" value={active.currentStatus} />
              <DetailStat label="Errors" value={active.errors} />
              <DetailStat label="Warnings" value={active.warnings} />
              <DetailStat label="Affected Assets" value={active.affectedAssets} />
              <DetailStat label="Source File" value={active.sourceFile} />
              <DetailStat label="Deep Link" value={active.deepLink} />
            </div>
            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Repair Actions</h4>
              <div className="space-y-1">{active.repairActions.map((r, i) => <div key={i} className="text-[11px] text-white/60 bg-white/[0.02] border border-white/5 rounded px-2 py-1.5 flex items-center gap-1.5"><AlertCircle size={10} className="text-amber-400 shrink-0" />{r}</div>)}</div>
            </div>
            <a href={active.deepLink} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 border border-indigo-500/15 rounded-lg px-3 py-2 w-fit"><ExternalLink size={12} /> Open Diagnostics</a>
          </div>
        </MetadataDrawer>
      )}
    </div>
  );
}

function DetailStat({ label, value }) {
  return (<div className="bg-white/[0.02] border border-white/5 rounded-lg p-2"><div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div><div className="text-xs text-white/70 mt-0.5 truncate">{value}</div></div>);
}