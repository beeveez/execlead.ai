import React, { useState } from "react";
import { FileWarning, ChevronRight, ChevronDown, AlertTriangle, Search, FileSpreadsheet } from "lucide-react";
import { computeFailureRegistry } from "@/lib/foundationCertificationEngine";
import { useToast } from "@/components/ui/use-toast";
import MetadataDrawer from "../metadata/MetadataDrawer";
import SelfHealingActions from "../metadata/SelfHealingActions";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";

function fmtMinutes(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const PRIORITY_STYLES = {
  P0: "bg-red-500/15 text-red-400",
  P1: "bg-orange-500/15 text-orange-400",
  P2: "bg-amber-500/15 text-amber-400",
};

export default function FailureRegistry({ cert }) {
  const [search, setSearch] = useState("");
  const [activeFailure, setActiveFailure] = useState(null);
  const failures = computeFailureRegistry(cert);
  const { toast } = useToast();

  const filtered = failures.filter((g) => !search || g.module.toLowerCase().includes(search.toLowerCase()));

  const exportCSV = () => {
    const headers = ["Module", "Validation Status", "Failed Checks", "Missing Registry", "Missing Feature Flag", "Missing Capability Mapping", "Missing Manifest Entry", "Missing Metadata", "Owner", "Priority", "Est. Fix Time (min)", "Score Gain", "Repair Status", "Verification Status"];
    const rows = filtered.map((g) => [g.module, g.validationStatus, g.failedChecks, g.missingRegistry, g.missingFeatureFlag, g.missingCapabilityMapping, g.missingManifestEntry, g.missingMetadata, g.owner, g.priority, g.estimatedFixMinutes, g.potentialScoreGain, g.repairStatus, g.verificationStatus]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `failure-registry-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} modules exported.` });
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <FileWarning size={16} className="text-red-400" />
        <h3 className="text-sm font-bold text-white">Failure Registry™</h3>
        <span className="text-xs text-white/40">{failures.length} modules</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." className="bg-white/[0.02] border border-white/5 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white/70 placeholder:text-white/30 focus:outline-none focus:border-red-500/30 w-44" />
          </div>
          <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"><FileSpreadsheet size={12} /> CSV</button>
          <ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix="Failure-Registry" supportCSV={false} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 px-2 font-medium">Module</th>
              <th className="text-center py-2 px-2 font-medium">Validation</th>
              <th className="text-center py-2 px-2 font-medium">Failed</th>
              <th className="text-center py-2 px-2 font-medium">Reg</th>
              <th className="text-center py-2 px-2 font-medium">Flag</th>
              <th className="text-center py-2 px-2 font-medium">Cap</th>
              <th className="text-center py-2 px-2 font-medium">Manif</th>
              <th className="text-center py-2 px-2 font-medium">Meta</th>
              <th className="text-center py-2 px-2 font-medium">Pri</th>
              <th className="text-right py-2 px-2 font-medium">Fix</th>
              <th className="text-right py-2 px-2 font-medium text-emerald-400/60">Gain</th>
              <th className="text-center py-2 px-2 font-medium">Repair</th>
              <th className="text-center py-2 px-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.module} onClick={() => g.failures.length > 0 && setActiveFailure(g.failures[0])} className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors group">
                <td className="py-2 px-2 text-white/70 max-w-[180px] truncate group-hover:text-indigo-300">{g.module}</td>
                <td className="py-2 px-2 text-center"><span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{g.validationStatus}</span></td>
                <td className="py-2 px-2 text-center text-white/60 font-mono">{g.failedChecks}</td>
                <td className="py-2 px-2 text-center text-white/50 font-mono">{g.missingRegistry > 0 ? g.missingRegistry : "—"}</td>
                <td className="py-2 px-2 text-center text-white/50 font-mono">{g.missingFeatureFlag > 0 ? g.missingFeatureFlag : "—"}</td>
                <td className="py-2 px-2 text-center text-white/50 font-mono">{g.missingCapabilityMapping > 0 ? g.missingCapabilityMapping : "—"}</td>
                <td className="py-2 px-2 text-center text-white/50 font-mono">{g.missingManifestEntry > 0 ? g.missingManifestEntry : "—"}</td>
                <td className="py-2 px-2 text-center text-white/50 font-mono">{g.missingMetadata > 0 ? g.missingMetadata : "—"}</td>
                <td className="py-2 px-2 text-center"><span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${PRIORITY_STYLES[g.priority]}`}>{g.priority}</span></td>
                <td className="py-2 px-2 text-right text-white/50 whitespace-nowrap">{fmtMinutes(g.estimatedFixMinutes)}</td>
                <td className="py-2 px-2 text-right"><span className="text-emerald-400 font-bold font-mono">+{g.potentialScoreGain}%</span></td>
                <td className="py-2 px-2 text-center"><span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">{g.repairStatus}</span></td>
                <td className="py-2 px-2 text-center"><span className="inline-flex items-center gap-0.5 text-[9px] text-indigo-400 group-hover:text-indigo-300">Open <ChevronRight size={9} /></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && <div className="text-center py-6 text-xs text-emerald-400">No failures detected — all modules pass validation.</div>}

      {activeFailure && (
        <MetadataDrawer title={activeFailure.component} subtitle="Validation Details — Drill-Down" icon={AlertTriangle} onClose={() => setActiveFailure(null)} maxWidth="max-w-xl"
          footer={<ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix={`${activeFailure.component}-Failure`} supportCSV />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DetailStat label="Module" value={activeFailure.component} />
              <DetailStat label="Severity" value={activeFailure.severity} />
              <DetailStat label="Expected Value" value={activeFailure.expectedValue} />
              <DetailStat label="Current Value" value={activeFailure.currentValue} />
              <DetailStat label="Category" value={activeFailure.categoryLabel || "—"} />
              <DetailStat label="Phase" value={`Phase ${activeFailure.phase || "—"}`} />
            </div>
            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Evidence</h4>
              <p className="text-xs text-white/60 bg-white/[0.02] border border-white/5 rounded-lg p-3">{activeFailure.evidence}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Engineering Patch</h4>
              <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-3 font-mono text-[11px] text-emerald-400/80"><div className="text-white/30 mb-1">// Repair action</div>{activeFailure.repairPatch}</div>
            </div>
            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Fix & Verify</h4>
              <SelfHealingActions item={{ ...activeFailure, field: activeFailure.component, repairAction: activeFailure.remediation, autoRepair: activeFailure.autoRepairAvailable }} />
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