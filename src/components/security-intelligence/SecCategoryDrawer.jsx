import React, { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Filter, CheckCircle2, XCircle, AlertTriangle, Wrench, Shield } from "lucide-react";
import SecCopilot from "./SecCopilot";
import SecReportToolbar from "./SecReportToolbar";

export default function SecCategoryDrawer({ category, intel, onClose, onTestClick }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTests = useMemo(() => {
    if (!category) return [];
    return category.tests.filter((t) => {
      if (statusFilter === "fail" && t.status !== "fail") return false;
      if (statusFilter === "pass" && t.status !== "pass") return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase()) && !t.entity.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [category, search, statusFilter]);

  if (!category) return null;

  return (
    <Sheet open={!!category} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-6xl overflow-y-auto bg-[#0a0a0f] border-white/10">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white flex items-center gap-2">
            <Shield size={16} className="text-red-400" />
            {category.label}
            {category.type === "platform" && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">PLATFORM</span>}
          </SheetTitle>
          <p className="text-white/40 text-xs">{category.description}</p>
        </SheetHeader>

        {/* Summary */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          <div className="bg-white/[0.02] border border-white/5 rounded p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase">Total</div>
            <div className="text-sm font-bold text-white">{category.total}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase">Passed</div>
            <div className="text-sm font-bold text-emerald-400">{category.passed}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase">Failed</div>
            <div className="text-sm font-bold text-red-400">{category.failed}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase">Critical</div>
            <div className="text-sm font-bold text-red-400">{category.criticalFailures}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded p-2 text-center">
            <div className="text-[9px] text-white/40 uppercase">Pass Rate</div>
            <div className="text-sm font-bold" style={{ color: category.passRate === 100 ? "#10b981" : "#f59e0b" }}>{category.passRate}%</div>
          </div>
        </div>

        {/* Affected entities + root causes */}
        {category.failed > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-red-500/[0.03] border border-red-500/10 rounded p-3">
              <div className="text-[9px] uppercase tracking-wider text-red-400 mb-1">Affected Entities ({category.affectedEntities.length})</div>
              <div className="flex flex-wrap gap-1">
                {category.affectedEntities.slice(0, 15).map((e) => (
                  <span key={e} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">{e}</span>
                ))}
              </div>
            </div>
            <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded p-3">
              <div className="text-[9px] uppercase tracking-wider text-amber-400 mb-1">Root Causes</div>
              {category.rootCauses.map((rc) => (
                <div key={rc} className="text-[10px] text-white/50 mb-0.5">• {rc}</div>
              ))}
            </div>
          </div>
        )}

        {/* RLS policies */}
        <div className="bg-white/[0.02] border border-white/5 rounded p-3 mb-4">
          <div className="text-[9px] uppercase tracking-wider text-white/40 mb-1">RLS Policies</div>
          <div className="flex flex-wrap gap-1">
            {category.rlsPolicies.map((p) => (
              <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">{p}</span>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests, entities, IDs..."
              className="w-full bg-white/5 border border-white/10 rounded pl-7 pr-3 py-1.5 text-[11px] text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="flex items-center gap-1">
            {["all", "fail", "pass"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${statusFilter === f ? "bg-white/10 border-white/20 text-white/80" : "bg-transparent border-white/5 text-white/40 hover:text-white/60"}`}
              >
                {f === "all" ? "All" : f === "fail" ? "Failed" : "Passed"}
              </button>
            ))}
          </div>
        </div>

        {/* Test table */}
        <div className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-white/5 text-white/40 uppercase">
                  <th className="text-left px-2 py-1.5 font-medium">Test</th>
                  <th className="text-left px-2 py-1.5 font-medium">Entity</th>
                  <th className="text-left px-2 py-1.5 font-medium">Expected</th>
                  <th className="text-left px-2 py-1.5 font-medium">Actual</th>
                  <th className="text-left px-2 py-1.5 font-medium">Root Cause</th>
                  <th className="text-left px-2 py-1.5 font-medium">Fix</th>
                  <th className="text-center px-2 py-1.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.slice(0, 100).map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onTestClick(t)}
                    className="border-b border-white/[0.02] hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="px-2 py-1.5">
                      <code className="text-white/40 font-mono">{t.id}</code>
                    </td>
                    <td className="px-2 py-1.5 text-white/70">{t.entity}</td>
                    <td className="px-2 py-1.5 text-white/50 truncate max-w-[120px]">{t.expected}</td>
                    <td className="px-2 py-1.5">
                      <span className={t.actual === "Denied" ? "text-emerald-400" : "text-red-400"}>{t.actual}</span>
                    </td>
                    <td className="px-2 py-1.5 text-amber-400/70 truncate max-w-[150px]">{t.rootCause}</td>
                    <td className="px-2 py-1.5">
                      {t.autoRepair ? (
                        <span className="flex items-center gap-1 text-indigo-400"><Wrench size={9} /> Auto Repair</span>
                      ) : t.fix === "—" ? (
                        <span className="text-white/30">—</span>
                      ) : (
                        <span className="text-white/50 truncate max-w-[120px]">{t.fix}</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {t.status === "pass" ? (
                        <CheckCircle2 size={12} className="text-emerald-400 inline" />
                      ) : t.riskLevel === "critical" ? (
                        <XCircle size={12} className="text-red-400 inline" />
                      ) : (
                        <AlertTriangle size={12} className="text-amber-400 inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTests.length > 100 && (
            <div className="text-center py-2 text-[10px] text-white/30">Showing 100 of {filteredTests.length} tests — use search to filter</div>
          )}
        </div>

        {/* Engineering tasks */}
        {category.engineeringTasks.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Engineering Tasks ({category.engineeringTasks.length})</div>
            <div className="space-y-1">
              {category.engineeringTasks.slice(0, 10).map((task) => (
                <div key={task.testId} className="flex items-center gap-2 text-[10px] py-0.5">
                  <code className="text-white/30 font-mono">{task.testId}</code>
                  <span className="text-white/60 flex-1 truncate">{task.entity}: {task.fix}</span>
                  <span className="text-white/30">{task.estimatedHours}h</span>
                  {task.autoRepair && <Wrench size={9} className="text-indigo-400" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report + EXEC */}
        <div className="space-y-3">
          <SecReportToolbar intel={intel} />
          <SecCopilot intel={intel} title="Ask EXEC™ — Category Diagnostics" />
        </div>
      </SheetContent>
    </Sheet>
  );
}