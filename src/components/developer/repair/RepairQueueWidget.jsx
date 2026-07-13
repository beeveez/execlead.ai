import React, { useState, useEffect, useCallback } from "react";
import { Wrench, Zap, ShieldCheck, FileText, Loader2, X, Filter, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { useToast } from "@/components/ui/use-toast";
import {
  getRepairQueueStats, getRegisteredFindings, getRepairState,
  bulkRepairSafe, bulkVerifyAll, exportRepairPlan, downloadFile,
} from "@/lib/repairWorkflowEngine";

const STATUS_COLOR = {
  open: "#64748b", applied: "#3b82f6", verified: "#10b981", failed: "#ef4444", rolled_back: "#f59e0b",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "auto", label: "Auto-Repair" },
  { id: "manual", label: "Manual" },
  { id: "critical", label: "Critical" },
  { id: "verified", label: "Verified" },
  { id: "failed", label: "Failed" },
];

export default function RepairQueueWidget() {
  const { user } = useAuth();
  const { canAccessDeveloper } = useDeveloper();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState({ pending: 0, running: 0, completed: 0, failed: 0, total: 0 });
  const [findings, setFindings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [bulkLoading, setBulkLoading] = useState(null);
  const [, setTick] = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    setStats(getRepairQueueStats());
    setFindings(getRegisteredFindings());
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const interval = setInterval(() => {
      setStats(getRepairQueueStats());
      setFindings(getRegisteredFindings());
    }, 2000);
    return () => clearInterval(interval);
  }, [expanded]);

  if (stats.total === 0 || !canAccessDeveloper) return null;

  const filteredFindings = findings.filter(f => {
    const state = getRepairState(f.id);
    const status = state.status || "open";
    if (filter === "all") return true;
    if (filter === "auto") return f.autoRepairable;
    if (filter === "manual") return !f.autoRepairable;
    if (filter === "critical") return f.severity === "Critical";
    if (filter === "verified") return status === "verified";
    if (filter === "failed") return status === "failed";
    return true;
  });

  const handleBulkRepair = async () => {
    setBulkLoading("repair");
    try {
      const result = await bulkRepairSafe(user, refresh);
      toast({ title: "Bulk Repair™ Complete", description: `${result.repaired} repaired · ${result.verified} verified · ${result.failed} failed` });
      refresh();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setBulkLoading(null); }
  };

  const handleBulkVerify = async () => {
    setBulkLoading("verify");
    try {
      const result = await bulkVerifyAll();
      toast({ title: "Verify All™ Complete", description: `${result.verified} verified · ${result.failed} failed` });
      refresh();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setBulkLoading(null); }
  };

  const handleExportPlan = () => {
    downloadFile(exportRepairPlan(), `repair-plan-${Date.now()}.txt`, "text/plain");
    toast({ title: "Repair Plan Exported", description: `${stats.total} findings` });
  };

  return (
    <div className="fixed top-16 right-4 z-40">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          title="Repair Queue — developer tool for governance findings"
          aria-label="Open repair queue"
          className="flex items-center gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2 shadow-lg hover:border-amber-500/30 transition-colors group"
        >
          <Wrench size={14} className="text-amber-400" />
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <span className="text-[8px] text-white/40">P</span>
              <span className="text-xs font-bold text-white/80">{stats.pending}</span>
            </div>
            {stats.running > 0 && (
              <div className="flex items-center gap-0.5">
                <span className="text-[8px] text-white/40">R</span>
                <span className="text-xs font-bold text-blue-400">{stats.running}</span>
              </div>
            )}
            <div className="flex items-center gap-0.5">
              <span className="text-[8px] text-white/40">✓</span>
              <span className="text-xs font-bold text-emerald-400">{stats.completed}</span>
            </div>
            {stats.failed > 0 && (
              <div className="flex items-center gap-0.5">
                <span className="text-[8px] text-white/40">✗</span>
                <span className="text-xs font-bold text-red-400">{stats.failed}</span>
              </div>
            )}
          </div>
          <ChevronDown size={12} className="text-white/30 group-hover:text-white/50" />
        </button>
      ) : (
        <div className="bg-[#0d0d14] border border-white/10 rounded-xl shadow-xl w-80 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Wrench size={13} className="text-amber-400" />
              <span className="text-xs font-semibold text-white">Repair Queue™</span>
            </div>
            <button onClick={() => setExpanded(false)} className="text-white/30 hover:text-white p-1">
              <X size={14} />
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-1 px-3 py-2 border-b border-white/10">
            <div className="text-center">
              <div className="text-sm font-bold text-white/80">{stats.pending}</div>
              <div className="text-[8px] text-white/30 uppercase">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-blue-400">{stats.running}</div>
              <div className="text-[8px] text-white/30 uppercase">Running</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-emerald-400">{stats.completed}</div>
              <div className="text-[8px] text-white/30 uppercase">Done</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-red-400">{stats.failed}</div>
              <div className="text-[8px] text-white/30 uppercase">Failed</div>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="px-3 py-2 border-b border-white/10 space-y-1.5">
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Bulk Operations</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleBulkRepair}
                disabled={!!bulkLoading || stats.pending === 0}
                className="flex items-center justify-center gap-1 text-[10px] px-2 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {bulkLoading === "repair" ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                Repair All Safe™
              </button>
              <button
                onClick={handleBulkVerify}
                disabled={!!bulkLoading || stats.running === 0}
                className="flex items-center justify-center gap-1 text-[10px] px-2 py-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {bulkLoading === "verify" ? <Loader2 size={10} className="animate-spin" /> : <ShieldCheck size={10} />}
                Verify All™
              </button>
              <button
                onClick={handleExportPlan}
                disabled={!!bulkLoading}
                className="flex items-center justify-center gap-1 text-[10px] px-2 py-1.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors col-span-2 disabled:opacity-30"
              >
                <FileText size={10} /> Export Repair Plan™
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-3 py-2 border-b border-white/10">
            <div className="flex items-center gap-1 mb-1">
              <Filter size={9} className="text-white/30" />
              <span className="text-[9px] text-white/30 uppercase tracking-wider">Filter</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${filter === f.id ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-white/40 hover:text-white/60"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Findings list */}
          <div className="max-h-48 overflow-y-auto px-3 py-2 space-y-1">
            {filteredFindings.length === 0 ? (
              <div className="text-center py-3 text-[10px] text-white/30">No findings match filter</div>
            ) : (
              filteredFindings.map(f => {
                const state = getRepairState(f.id);
                const status = state.status || "open";
                const color = STATUS_COLOR[status] || STATUS_COLOR.open;
                return (
                  <div key={f.id} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-white/70 truncate">{f.issue}</div>
                      <div className="text-[8px] text-white/30">{f.source} · {status}</div>
                    </div>
                    {f.autoRepairable && status === "open" && (
                      <Zap size={9} className="text-emerald-400/50 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}