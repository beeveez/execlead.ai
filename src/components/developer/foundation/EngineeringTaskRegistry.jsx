import React, { useMemo, useState } from "react";
import {
  Search, ArrowUpDown, ChevronRight, Download, Wrench, TrendingUp,
  Clock, Target, Zap, Filter, FileSpreadsheet,
} from "lucide-react";
import { computeEngineeringTaskRegistry } from "@/lib/foundationCertificationEngine";
import { useToast } from "@/components/ui/use-toast";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";
import BlockerDrillDown from "./BlockerDrillDown";

const SEVERITY_STYLES = {
  Critical: "bg-red-500/10 text-red-400 border-red-500/20",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const PRIORITY_STYLES = {
  P0: "bg-red-500/15 text-red-400",
  P1: "bg-orange-500/15 text-orange-400",
  P2: "bg-amber-500/15 text-amber-400",
  P3: "bg-blue-500/15 text-blue-400",
};

function fmtMinutes(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function EngineeringTaskRegistry({ cert, onOpenTask }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");
  const [sortKey, setSortKey] = useState("scoreGain");
  const [activeTask, setActiveTask] = useState(null);

  const { toast } = useToast();
  const registry = useMemo(() => computeEngineeringTaskRegistry(cert), [cert]);

  const categories = useMemo(() => ["all", ...new Set(registry.tasks.map((t) => t.category))], [registry]);
  const severities = ["all", "Critical", "High", "Medium", "Low"];

  const filtered = useMemo(() => {
    let result = registry.tasks.filter((t) => {
      if (catFilter !== "all" && t.category !== catFilter) return false;
      if (sevFilter !== "all" && t.severity !== sevFilter) return false;
      if (search && !t.task.toLowerCase().includes(search.toLowerCase()) && !t.component.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const sorters = {
      scoreGain: (a, b) => b.scoreGain - a.scoreGain,
      potential: (a, b) => b.potentialScoreGain - a.potentialScoreGain,
      hours: (a, b) => b.estimatedMinutes - a.estimatedMinutes,
      severity: (a, b) => (SEVERITY_ORDER[b.severity] || 3) - (SEVERITY_ORDER[a.severity] || 3),
    };
    return [...result].sort(sorters[sortKey] || sorters.scoreGain);
  }, [registry, search, catFilter, sevFilter, sortKey]);

  const exportCSV = () => {
    const headers = ["Task", "Category", "Module", "Severity", "Priority", "Owner", "Est. Minutes", "Score Gain", "Potential Score Gain", "Status", "Metric", "Repair Action", "Source File", "Deep Link"];
    const rows = filtered.map((t) => [
      `"${t.task.replace(/"/g, '""')}"`, t.category, t.module, t.severity, t.priority, t.owner,
      t.estimatedMinutes, t.scoreGain, t.potentialScoreGain, t.status, t.metricLabel,
      `"${t.repairAction.replace(/"/g, '""')}"`, t.sourceFile, t.deepLink,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `engineering-task-registry-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} tasks exported to CSV.` });
  };

  const top10 = registry.tasks.slice(0, 10);
  const top10Gain = top10.reduce((s, t) => s + t.scoreGain, 0);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Wrench size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Engineering Task Registry™</h3>
        <span className="text-xs text-white/40">{registry.totalTasks} tasks</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <FileSpreadsheet size={12} /> CSV
          </button>
          <ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix="Task-Registry" supportCSV={false} />
        </div>
      </div>

      {/* Summary bar — impact prioritization */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <SummaryCard label="Current Score" value={`${registry.currentScore}%`} icon={Target} color="#818cf8" />
        <SummaryCard label="Total Score Gain" value={`+${registry.totalScoreGain}%`} icon={TrendingUp} color="#10b981" />
        <SummaryCard label="Potential Max" value={`${registry.maxPotentialScore}%`} icon={Zap} color="#f59e0b" />
        <SummaryCard label="Top 10 Gain" value={`+${Math.round(top10Gain * 100) / 100}%`} icon={Zap} color="#a78bfa" />
        <SummaryCard label="Total Effort" value={fmtMinutes(registry.totalMinutes)} icon={Clock} color="#60a5fa" />
      </div>

      {/* Impact insight */}
      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
        <Zap size={12} className="text-emerald-400 shrink-0" />
        <span className="text-xs text-emerald-300/80">
          Fixing the top {Math.min(10, top10.length)} tasks raises Foundation Certification from {registry.currentScore}% to {Math.min(100, Math.round((registry.currentScore + top10Gain) * 100) / 100)}% — {fmtMinutes(top10.reduce((s, t) => s + t.estimatedMinutes, 0))} of effort.
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or modules..."
            className="w-full bg-white/[0.02] border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white/70 placeholder:text-white/30 focus:outline-none focus:border-indigo-500/30"
          />
        </div>
        <FilterSelect label="Category" value={catFilter} options={categories} onChange={setCatFilter} />
        <FilterSelect label="Severity" value={sevFilter} options={severities} onChange={setSevFilter} />
        <SortButton sortKey={sortKey} setSortKey={setSortKey} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 px-2 font-medium">Task</th>
              <th className="text-left py-2 px-2 font-medium">Category</th>
              <th className="text-left py-2 px-2 font-medium">Module</th>
              <th className="text-left py-2 px-2 font-medium">Sev</th>
              <th className="text-left py-2 px-2 font-medium">Pri</th>
              <th className="text-right py-2 px-2 font-medium">Est.</th>
              <th className="text-right py-2 px-2 font-medium text-emerald-400/60">Gain</th>
              <th className="text-right py-2 px-2 font-medium text-violet-400/60">Potential</th>
              <th className="text-center py-2 px-2 font-medium text-amber-400/60">ROI</th>
              <th className="text-center py-2 px-2 font-medium text-blue-400/60">Diff</th>
              <th className="text-center py-2 px-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.id}
                onClick={() => { setActiveTask(t); onOpenTask?.(t); }}
                className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors group"
              >
                <td className="py-2 px-2 text-white/70 max-w-[280px] truncate group-hover:text-indigo-300 transition-colors">{t.task}</td>
                <td className="py-2 px-2 text-white/50 whitespace-nowrap">{t.category}</td>
                <td className="py-2 px-2 text-white/50 whitespace-nowrap max-w-[140px] truncate">{t.module}</td>
                <td className="py-2 px-2"><span className={`text-[9px] px-1.5 py-0.5 rounded border ${SEVERITY_STYLES[t.severity]}`}>{t.severity}</span></td>
                <td className="py-2 px-2"><span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</span></td>
                <td className="py-2 px-2 text-right text-white/50 whitespace-nowrap">{fmtMinutes(t.estimatedMinutes)}</td>
                <td className="py-2 px-2 text-right"><span className="text-emerald-400 font-bold font-mono">+{t.scoreGain}%</span></td>
                <td className="py-2 px-2 text-right"><span className="text-violet-400 font-mono">{t.potentialScoreGain}%</span></td>
                <td className="py-2 px-2 text-center"><span className={`text-[9px] px-1.5 py-0.5 rounded ${t.roi === "High ROI" ? "bg-emerald-500/10 text-emerald-400" : t.roi === "Medium ROI" ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/40"}`}>{t.roi}</span></td>
                <td className="py-2 px-2 text-center"><span className={`text-[9px] px-1.5 py-0.5 rounded ${t.difficulty === "Hard" ? "bg-red-500/10 text-red-400" : t.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>{t.difficulty}</span></td>
                <td className="py-2 px-2 text-center">
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-indigo-400 group-hover:text-indigo-300">
                    Open <ChevronRight size={9} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-6 text-xs text-white/30">No tasks match current filters.</div>
      )}

      {activeTask && <BlockerDrillDown issue={activeTask.rawIssue} onClose={() => setActiveTask(null)} />}
    </div>
  );
}

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={10} style={{ color }} />
        <span className="text-[9px] text-white/40 uppercase">{label}</span>
      </div>
      <div className="text-sm font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <Filter size={10} className="text-white/30" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white/60 focus:outline-none focus:border-indigo-500/30"
      >
        {options.map((o) => <option key={o} value={o} className="bg-[#0a0a0f]">{o === "all" ? `All ${label}` : o}</option>)}
      </select>
    </div>
  );
}

function SortButton({ sortKey, setSortKey }) {
  const options = [
    { id: "scoreGain", label: "Score Gain" },
    { id: "potential", label: "Potential" },
    { id: "hours", label: "Effort" },
    { id: "severity", label: "Severity" },
  ];
  return (
    <div className="flex items-center gap-1">
      <ArrowUpDown size={10} className="text-white/30" />
      <select
        value={sortKey}
        onChange={(e) => setSortKey(e.target.value)}
        className="bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1.5 text-xs text-white/60 focus:outline-none focus:border-indigo-500/30"
      >
        {options.map((o) => <option key={o.id} value={o.id} className="bg-[#0a0a0f]">Sort: {o.label}</option>)}
      </select>
    </div>
  );
}