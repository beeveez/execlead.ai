import React, { useMemo, useState } from "react";
import { Wrench, ChevronRight, FileSpreadsheet, Search, Zap, TrendingUp, Clock, Target } from "lucide-react";
import { computeMetadataEngineeringTasks } from "@/lib/metadataIntelligenceEngine";
import { useToast } from "@/components/ui/use-toast";
import MetadataDrawer from "./MetadataDrawer";
import SelfHealingActions from "./SelfHealingActions";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildMetadataReport } from "@/lib/reports/metadataReportBuilder";

const PRIORITY_STYLES = { P1: "bg-red-500/15 text-red-400", P2: "bg-amber-500/15 text-amber-400", P3: "bg-blue-500/15 text-blue-400" };
const ROI_STYLES = { "High ROI": "bg-emerald-500/10 text-emerald-400", "Medium ROI": "bg-amber-500/10 text-amber-400", "Low ROI": "bg-white/5 text-white/40" };
const DIFF_STYLES = { Hard: "bg-red-500/10 text-red-400", Medium: "bg-amber-500/10 text-amber-400", Easy: "bg-blue-500/10 text-blue-400" };

export default function MetadataEngineeringTasks({ report }) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const { toast } = useToast();
  const registry = useMemo(() => computeMetadataEngineeringTasks(report), [report]);

  const filtered = useMemo(() => registry.tasks.filter((t) => !search || t.task.toLowerCase().includes(search.toLowerCase()) || t.entity.toLowerCase().includes(search.toLowerCase())), [registry, search]);

  const exportCSV = () => {
    const headers = ["Task", "Category", "Workspace", "Module", "Owner", "Priority", "Estimated Hours", "Auto Repair", "Score Gain", "Potential Gain", "ROI", "Difficulty", "Verification", "Deep Link"];
    const rows = filtered.map((t) => [`"${t.task.replace(/"/g, '""')}"`, t.category, t.workspace, t.module, t.owner, t.priority, t.estimatedHours, t.autoRepair ? "Yes" : "No", t.scoreGain, t.potentialScoreGain, t.roi, t.difficulty, t.verification, t.deepLink]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metadata-engineering-tasks-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} tasks exported.` });
  };

  const top5 = registry.tasks.slice(0, 5);
  const top5Gain = top5.reduce((s, t) => s + t.scoreGain, 0);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Wrench size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Engineering Tasks™</h3>
        <span className="text-xs text-white/40">{registry.totalTasks} tasks</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="bg-white/[0.02] border border-white/5 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white/70 placeholder:text-white/30 focus:outline-none focus:border-indigo-500/30 w-44" />
          </div>
          <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"><FileSpreadsheet size={12} /> CSV</button>
          <ReportToolbar reportBuilder={buildMetadataReport} filenamePrefix="Metadata-Tasks" supportCSV={false} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <SummaryCard label="Current Coverage" value={`${registry.currentScore}%`} icon={Target} color="#818cf8" />
        <SummaryCard label="Total Score Gain" value={`+${registry.totalScoreGain}%`} icon={TrendingUp} color="#10b981" />
        <SummaryCard label="Potential Max" value={`${registry.maxPotentialScore}%`} icon={Zap} color="#f59e0b" />
        <SummaryCard label="Top 5 Gain" value={`+${Math.round(top5Gain * 100) / 100}%`} icon={Zap} color="#a78bfa" />
        <SummaryCard label="Total Effort" value={`${registry.totalHours}h`} icon={Clock} color="#60a5fa" />
      </div>

      <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
        <Zap size={12} className="text-amber-400 shrink-0" />
        <span className="text-xs text-amber-300/80">Estimated completion: {registry.estimatedCompletion} — engineering velocity not yet tracked in telemetry.</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 px-2 font-medium">Task</th>
              <th className="text-left py-2 px-2 font-medium">Cat</th>
              <th className="text-left py-2 px-2 font-medium">Workspace</th>
              <th className="text-left py-2 px-2 font-medium">Pri</th>
              <th className="text-right py-2 px-2 font-medium">Hours</th>
              <th className="text-right py-2 px-2 font-medium text-emerald-400/60">Gain</th>
              <th className="text-center py-2 px-2 font-medium text-amber-400/60">ROI</th>
              <th className="text-center py-2 px-2 font-medium text-blue-400/60">Diff</th>
              <th className="text-center py-2 px-2 font-medium">Auto</th>
              <th className="text-center py-2 px-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} onClick={() => setActive(t)} className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors group">
                <td className="py-2 px-2 text-white/70 max-w-[260px] truncate group-hover:text-indigo-300">{t.task}</td>
                <td className="py-2 px-2 text-white/50 whitespace-nowrap">{t.category}</td>
                <td className="py-2 px-2 text-white/50 whitespace-nowrap">{t.workspace}</td>
                <td className="py-2 px-2"><span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</span></td>
                <td className="py-2 px-2 text-right text-white/50 whitespace-nowrap">{t.estimatedHours}h</td>
                <td className="py-2 px-2 text-right"><span className="text-emerald-400 font-bold font-mono">+{t.scoreGain}%</span></td>
                <td className="py-2 px-2 text-center"><span className={`text-[9px] px-1.5 py-0.5 rounded ${ROI_STYLES[t.roi]}`}>{t.roi}</span></td>
                <td className="py-2 px-2 text-center"><span className={`text-[9px] px-1.5 py-0.5 rounded ${DIFF_STYLES[t.difficulty]}`}>{t.difficulty}</span></td>
                <td className="py-2 px-2 text-center">{t.autoRepair ? <span className="text-cyan-400 text-[9px]">Yes</span> : <span className="text-white/20">—</span>}</td>
                <td className="py-2 px-2 text-center"><span className="inline-flex items-center gap-0.5 text-[9px] text-indigo-400 group-hover:text-indigo-300">Open <ChevronRight size={9} /></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && <div className="text-center py-6 text-xs text-emerald-400">No engineering tasks — all metadata complete.</div>}

      {active && (
        <MetadataDrawer title={active.entity} subtitle={`${active.category} · ${active.field} — Engineering Task`} icon={Wrench} onClose={() => setActive(null)} maxWidth="max-w-xl"
          footer={<ReportToolbar reportBuilder={buildMetadataReport} filenamePrefix={`${active.entity}-Task`} supportCSV />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DetailStat label="Task" value={active.task} />
              <DetailStat label="Owner" value={active.owner} />
              <DetailStat label="Priority" value={active.priority} />
              <DetailStat label="Difficulty" value={active.difficulty} />
              <DetailStat label="Estimated Hours" value={`${active.estimatedHours}h`} />
              <DetailStat label="Score Gain" value={`+${active.scoreGain}%`} />
              <DetailStat label="Potential Gain" value={`+${active.potentialScoreGain}%`} />
              <DetailStat label="ROI" value={active.roi} />
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
              <SelfHealingActions item={{ ...active, field: active.field, repairAction: active.task, autoRepair: active.autoRepair }} />
            </div>
          </div>
        </MetadataDrawer>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color }) {
  return (<div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5"><div className="flex items-center gap-1.5 mb-0.5"><Icon size={10} style={{ color }} /><span className="text-[9px] text-white/40 uppercase">{label}</span></div><div className="text-sm font-bold" style={{ color }}>{value}</div></div>);
}
function DetailStat({ label, value }) {
  return (<div className="bg-white/[0.02] border border-white/5 rounded-lg p-2"><div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div><div className="text-xs text-white/70 mt-0.5 truncate">{value}</div></div>);
}