import React, { useMemo, useState } from "react";
import { Search, AlertOctagon, Wrench, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";

const SEVERITY_STYLE = {
  Critical: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20" },
  High: { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  Medium: { color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Low: { color: "#6b7280", bg: "bg-white/5", border: "border-white/10" },
};

export default function AIMemoryFailureRegistry({ failures, onInspect, onOverride }) {
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [repairing, setRepairing] = useState(null);

  const filtered = useMemo(() => {
    return failures.filter((f) => {
      if (search && !f.issue.toLowerCase().includes(search.toLowerCase()) && !f.evidence.toLowerCase().includes(search.toLowerCase())) return false;
      if (sevFilter && f.severity !== sevFilter) return false;
      if (statusFilter && f.status !== statusFilter) return false;
      return true;
    });
  }, [failures, search, sevFilter, statusFilter]);

  const handleRepair = (f) => {
    setRepairing(f.id);
    setTimeout(() => {
      onOverride(f.id, { status: "Repairing" });
      setRepairing(null);
    }, 1000);
  };

  const handleVerify = (f) => {
    onOverride(f.id, { status: "Verified" });
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <AlertOctagon size={14} className="text-red-400" />
        <h3 className="text-sm font-bold text-white">Blocking Issues — Failure Registry™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{filtered.length} of {failures.length} issues</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues or evidence…"
            className="w-full bg-white/[0.02] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white/70 placeholder:text-white/30 focus:outline-none focus:border-violet-500/40"
          />
        </div>
        <select
          value={sevFilter}
          onChange={(e) => setSevFilter(e.target.value)}
          className="bg-white/[0.02] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-violet-500/40"
        >
          <option value="">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/[0.02] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-violet-500/40"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Repairing">Repairing</option>
          <option value="Verified">Verified</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 px-2 font-medium">Issue</th>
              <th className="text-center py-2 px-1 font-medium">Sev</th>
              <th className="text-center py-2 px-1 font-medium">Current</th>
              <th className="text-center py-2 px-1 font-medium">Target</th>
              <th className="text-center py-2 px-1 font-medium">Gain</th>
              <th className="text-center py-2 px-1 font-medium">Hours</th>
              <th className="text-center py-2 px-1 font-medium">Status</th>
              <th className="text-center py-2 px-1 font-medium">Repair</th>
              <th className="text-center py-2 px-1 font-medium">Verify</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => {
              const s = SEVERITY_STYLE[f.severity] || SEVERITY_STYLE.Low;
              return (
                <tr
                  key={f.id}
                  onClick={() => onInspect({ ...f, itemType: "failure" })}
                  className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors group"
                >
                  <td className="py-2 px-2 max-w-[220px]">
                    <div className="text-white/80 font-medium truncate">{f.issue}</div>
                    <div className="text-[9px] text-white/30 truncate">{f.evidence}</div>
                  </td>
                  <td className="text-center py-2 px-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${s.bg} ${s.border}`} style={{ color: s.color }}>
                      {f.severity}
                    </span>
                  </td>
                  <td className="text-center py-2 px-1 text-white/60 font-mono">{f.currentValue}</td>
                  <td className="text-center py-2 px-1 text-white/40 font-mono">{f.targetValue}</td>
                  <td className="text-center py-2 px-1 text-emerald-400">+{f.potentialScoreGain}</td>
                  <td className="text-center py-2 px-1 text-white/50">{f.estimatedHours}h</td>
                  <td className="text-center py-2 px-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      f.status === "Verified" ? "bg-emerald-500/10 text-emerald-400" :
                      f.status === "Repairing" ? "bg-amber-500/10 text-amber-400" :
                      "bg-white/5 text-white/40"
                    }`}>{f.status}</span>
                  </td>
                  <td className="text-center py-2 px-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRepair(f); }}
                      disabled={repairing === f.id || f.status === "Verified"}
                      className="inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {repairing === f.id ? <Loader2 size={10} className="animate-spin" /> : <Wrench size={10} />}
                      Repair
                    </button>
                  </td>
                  <td className="text-center py-2 px-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleVerify(f); }}
                      disabled={f.status === "Verified"}
                      className="inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ShieldCheck size={10} />
                      Verify
                    </button>
                  </td>
                  <td className="py-2 px-1">
                    <ChevronRight size={12} className="text-white/20 group-hover:text-violet-400 transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-6 text-xs text-white/30">No issues match your filters.</div>
        )}
      </div>
    </div>
  );
}