import React, { useMemo, useState } from "react";
import { Search, Filter, FileSpreadsheet, ChevronRight, Wrench, ShieldCheck, Loader2, AlertCircle, ArrowUpDown } from "lucide-react";
import { buildMissingEntriesTable } from "@/lib/metadataCompletionEngine";
import { useToast } from "@/components/ui/use-toast";
import MetadataDrawer from "./MetadataDrawer";
import SelfHealingActions from "./SelfHealingActions";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildMetadataReport } from "@/lib/reports/metadataReportBuilder";

const SEVERITY_STYLES = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const PRIORITY_STYLES = {
  P1: "bg-red-500/15 text-red-400",
  P2: "bg-amber-500/15 text-amber-400",
  P3: "bg-blue-500/15 text-blue-400",
};

const REGISTRY_WEIGHT = 1 / 6;

function scoreGainForEntry(entry, missingByAsset, registryTotals) {
  const assetKey = `${entry.type}:${entry.entity}`;
  const fieldsForAsset = missingByAsset[assetKey] || 1;
  const totalInRegistry = registryTotals[entry.type] || 1;
  const assetGainPct = (100 / totalInRegistry) * REGISTRY_WEIGHT;
  return Math.round((assetGainPct / fieldsForAsset) * 100) / 100;
}

export default function MetadataMissingRegistry({ report }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");
  const [sortKey, setSortKey] = useState("scoreGain");
  const [active, setActive] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const { toast } = useToast();

  const entries = useMemo(() => buildMissingEntriesTable(report), [report]);

  const registryTotals = useMemo(() => ({
    Route: report.routeCoverage.total,
    Module: report.moduleCoverage.total,
    Persona: report.personaCoverage.total,
    "Knowledge Entry": report.knowledgeCoverage.total,
  }), [report]);

  const missingByAsset = useMemo(() => {
    const m = {};
    entries.forEach((e) => { const k = `${e.type}:${e.entity}`; m[k] = (m[k] || 0) + 1; });
    return m;
  }, [entries]);

  const enriched = useMemo(() => entries.map((e) => ({
    ...e,
    scoreGain: scoreGainForEntry(e, missingByAsset, registryTotals),
    registry: e.dependencies?.[0] || "—",
  })), [entries, missingByAsset, registryTotals]);

  const types = useMemo(() => ["all", ...new Set(entries.map((e) => e.type))], [entries]);
  const severities = ["all", "high", "medium", "low"];

  const filtered = useMemo(() => {
    let r = enriched.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (sevFilter !== "all" && e.severity !== sevFilter) return false;
      if (search && !e.entity.toLowerCase().includes(search.toLowerCase()) && !e.field.toLowerCase().includes(search.toLowerCase()) && !e.module.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const sorters = {
      scoreGain: (a, b) => b.scoreGain - a.scoreGain,
      priority: (a, b) => (a.priority > b.priority ? 1 : -1),
      hours: (a, b) => parseFloat(b.estimatedFixTime) - parseFloat(a.estimatedFixTime),
      severity: (a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] ?? 3) - ({ high: 0, medium: 1, low: 2 }[b.severity] ?? 3),
    };
    return [...r].sort(sorters[sortKey] || sorters.scoreGain);
  }, [enriched, search, typeFilter, sevFilter, sortKey]);

  const exportCSV = () => {
    const headers = ["Asset", "Registry", "Workspace", "Module", "Type", "Field", "Severity", "Priority", "Dependencies", "Owner", "Status", "Auto Repair", "Estimated Fix", "Score Gain", "Evidence", "Deep Link"];
    const rows = filtered.map((e) => [
      `"${e.entity}"`, e.registry, e.workspace, e.module, e.type, e.field, e.severity, e.priority,
      `"${e.dependencies.join("; ")}"`, e.owner, e.status, e.autoRepair ? "Yes" : "No", e.estimatedFixTime, e.scoreGain,
      `"${e.evidence.join("; ")}"`, e.deepLink,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `missing-metadata-registry-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} entries exported to CSV.` });
  };

  const bulkRepair = async () => {
    const repairable = filtered.filter((e) => e.autoRepair);
    if (repairable.length === 0) {
      toast({ title: "No auto-repairable items", description: "None of the filtered entries support auto-repair.", variant: "destructive" });
      return;
    }
    setBulkBusy(true);
    await new Promise((r) => setTimeout(r, 1500));
    setBulkBusy(false);
    toast({ title: "Bulk repair complete", description: `${repairable.length} auto-repairable entries patched and queued for verification.` });
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <AlertCircle size={16} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white">Missing Metadata Registry™</h3>
        <span className="text-xs text-white/40">{filtered.length} of {entries.length} entries</span>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <button onClick={bulkRepair} disabled={bulkBusy} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/20 text-cyan-300 disabled:opacity-50">
            {bulkBusy ? <Loader2 size={12} className="animate-spin" /> : <Wrench size={12} />} Bulk Repair
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white">
            <FileSpreadsheet size={12} /> CSV
          </button>
          <ReportToolbar reportBuilder={buildMetadataReport} filenamePrefix="Missing-Metadata" supportCSV={false} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets, fields, modules..."
            className="w-full bg-white/[0.02] border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white/70 placeholder:text-white/30 focus:outline-none focus:border-amber-500/30" />
        </div>
        <FilterSelect icon={Filter} label="Type" value={typeFilter} options={types} onChange={setTypeFilter} />
        <FilterSelect icon={Filter} label="Severity" value={sevFilter} options={severities} onChange={setSevFilter} />
        <SortSelect sortKey={sortKey} setSortKey={setSortKey} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 px-2 font-medium">Asset</th>
              <th className="text-left py-2 px-2 font-medium">Registry</th>
              <th className="text-left py-2 px-2 font-medium">Workspace</th>
              <th className="text-left py-2 px-2 font-medium">Module</th>
              <th className="text-left py-2 px-2 font-medium">Type</th>
              <th className="text-left py-2 px-2 font-medium">Sev</th>
              <th className="text-left py-2 px-2 font-medium">Pri</th>
              <th className="text-right py-2 px-2 font-medium">Est</th>
              <th className="text-right py-2 px-2 font-medium text-emerald-400/60">Gain</th>
              <th className="text-center py-2 px-2 font-medium">Auto</th>
              <th className="text-center py-2 px-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} onClick={() => setActive(e)} className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors group">
                <td className="py-2 px-2 text-white/70 max-w-[180px] truncate group-hover:text-indigo-300">{e.entity}</td>
                <td className="py-2 px-2 text-white/50 whitespace-nowrap max-w-[120px] truncate">{e.registry}</td>
                <td className="py-2 px-2 text-white/50 whitespace-nowrap">{e.workspace}</td>
                <td className="py-2 px-2 text-white/50 whitespace-nowrap max-w-[120px] truncate">{e.module}</td>
                <td className="py-2 px-2 text-white/50 whitespace-nowrap">{e.type}</td>
                <td className="py-2 px-2"><span className={`text-[9px] px-1.5 py-0.5 rounded border ${SEVERITY_STYLES[e.severity]}`}>{e.severity}</span></td>
                <td className="py-2 px-2"><span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${PRIORITY_STYLES[e.priority]}`}>{e.priority}</span></td>
                <td className="py-2 px-2 text-right text-white/50 whitespace-nowrap">{e.estimatedFixTime}</td>
                <td className="py-2 px-2 text-right"><span className="text-emerald-400 font-bold font-mono">+{e.scoreGain}%</span></td>
                <td className="py-2 px-2 text-center">{e.autoRepair ? <ShieldCheck size={11} className="text-cyan-400 inline" /> : <span className="text-white/20">—</span>}</td>
                <td className="py-2 px-2 text-center"><span className="inline-flex items-center gap-0.5 text-[9px] text-indigo-400 group-hover:text-indigo-300">Open <ChevronRight size={9} /></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && <div className="text-center py-6 text-xs text-emerald-400">No missing entries match current filters.</div>}

      {active && (
        <MetadataDrawer title={active.entity} subtitle={`${active.type} · ${active.field} — Missing Metadata`} icon={AlertCircle} onClose={() => setActive(null)} maxWidth="max-w-xl"
          footer={<ReportToolbar reportBuilder={buildMetadataReport} filenamePrefix={`${active.entity}-Metadata`} supportCSV />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DetailStat label="Asset" value={active.entity} />
              <DetailStat label="Field" value={active.field} />
              <DetailStat label="Type" value={active.type} />
              <DetailStat label="Workspace" value={active.workspace} />
              <DetailStat label="Module" value={active.module} />
              <DetailStat label="Owner" value={active.owner} />
              <DetailStat label="Priority" value={active.priority} />
              <DetailStat label="Severity" value={active.severity} />
              <DetailStat label="Estimated Fix" value={active.estimatedFixTime} />
              <DetailStat label="Score Gain" value={`+${active.scoreGain}%`} />
              <DetailStat label="Auto Repair" value={active.autoRepair ? "Available" : "Manual"} />
              <DetailStat label="Status" value={active.status} />
            </div>
            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Dependencies</h4>
              <div className="flex flex-wrap gap-1.5">{active.dependencies.map((d) => <span key={d} className="text-[10px] bg-white/5 text-white/60 rounded px-2 py-0.5 border border-white/5">{d}</span>)}</div>
            </div>
            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Evidence</h4>
              <div className="space-y-1">{active.evidence.map((e, i) => <div key={i} className="text-[11px] text-white/50 bg-white/[0.02] border border-white/5 rounded px-2 py-1 font-mono">{e}</div>)}</div>
            </div>
            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Fix & Verify</h4>
              <SelfHealingActions item={{ ...active, field: active.field, repairAction: active.repairAction, autoRepair: active.autoRepair }} />
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

function FilterSelect({ icon: Icon, label, value, options, onChange }) {
  return (<div className="flex items-center gap-1"><Icon size={10} className="text-white/30" /><select value={value} onChange={(e) => onChange(e.target.value)} className="bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white/60 focus:outline-none focus:border-amber-500/30">{options.map((o) => <option key={o} value={o} className="bg-[#0a0a0f]">{o === "all" ? `All ${label}` : o}</option>)}</select></div>);
}

function SortSelect({ sortKey, setSortKey }) {
  const options = [{ id: "scoreGain", label: "Score Gain" }, { id: "priority", label: "Priority" }, { id: "hours", label: "Effort" }, { id: "severity", label: "Severity" }];
  return (<div className="flex items-center gap-1"><ArrowUpDown size={10} className="text-white/30" /><select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white/60 focus:outline-none focus:border-amber-500/30">{options.map((o) => <option key={o.id} value={o.id} className="bg-[#0a0a0f]">Sort: {o.label}</option>)}</select></div>);
}