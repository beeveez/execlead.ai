import React from "react";
import { ChevronRight, CheckSquare, Square, Wrench, ShieldCheck } from "lucide-react";

const PRIORITY_STYLE = {
  Critical: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20" },
  High: { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  Medium: { color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

export default function AIMemoryEngineeringTasks({ tasks, onInspect, onOverride }) {
  const toggleStatus = (t) => {
    if (t.status === "Done" || t.status === "Resolved") { onOverride(t.id, { status: "Open" }); return; }
    const next = t.status === "Open" ? "In Progress" : "Done";
    onOverride(t.id, { status: next });
  };

  const toggleVerify = (t) => {
    onOverride(t.id, { verificationStatus: t.verificationStatus === "Pending" ? "Verified" : "Pending" });
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckSquare size={14} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Engineering Tasks — Work Items</h3>
        <span className="text-[10px] text-white/30 ml-auto">Click any task for full details</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 px-2 font-medium">Task</th>
              <th className="text-center py-2 px-1 font-medium">Priority</th>
              <th className="text-left py-2 px-1 font-medium">Owner</th>
              <th className="text-center py-2 px-1 font-medium">Hours</th>
              <th className="text-center py-2 px-1 font-medium">Gain</th>
              <th className="text-left py-2 px-1 font-medium">Dependencies</th>
              <th className="text-center py-2 px-1 font-medium">Auto Repair</th>
              <th className="text-center py-2 px-1 font-medium">Status</th>
              <th className="text-center py-2 px-1 font-medium">Verified</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const ps = PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.Medium;
              return (
                <tr
                  key={t.id}
                  onClick={() => onInspect({ ...t, itemType: "task" })}
                  className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-2 max-w-[200px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStatus(t); }}
                    className="flex items-start gap-2 text-left w-full"
                  >
                    {t.status === "Done" || t.status === "Resolved"
                      ? <CheckSquare size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                      : <Square size={12} className="text-white/30 mt-0.5 shrink-0" />}
                    <span className={t.status === "Done" || t.status === "Resolved" ? "line-through text-white/30" : "text-white/80 font-medium"}>
                      {t.task}
                    </span>
                  </button>
                  </td>
                  <td className="text-center py-2 px-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${ps.bg} ${ps.border}`} style={{ color: ps.color }}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-2 px-1 text-white/60">{t.owner}</td>
                  <td className="text-center py-2 px-1 text-white/50">{t.estimatedHours}h</td>
                  <td className="text-center py-2 px-1 text-emerald-400">+{t.potentialScoreGain}</td>
                  <td className="py-2 px-1 max-w-[120px]">
                    <div className="text-[9px] text-white/40 truncate">{t.dependencies.join(", ")}</div>
                  </td>
                  <td className="text-center py-2 px-1">
                    <span className={`text-[9px] ${t.autoRepair ? "text-emerald-400" : "text-white/30"}`}>
                      {t.autoRepair ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="text-center py-2 px-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      t.status === "Done" || t.status === "Resolved" ? "bg-emerald-500/10 text-emerald-400" :
                      t.status === "In Progress" ? "bg-amber-500/10 text-amber-400" :
                      "bg-white/5 text-white/40"
                    }`}>{t.status}</span>
                  </td>
                  <td className="text-center py-2 px-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleVerify(t); }}
                      className="inline-flex items-center gap-1 text-[9px]"
                    >
                      <ShieldCheck size={10} className={t.verificationStatus === "Verified" ? "text-emerald-400" : "text-white/30"} />
                      {t.verificationStatus}
                    </button>
                  </td>
                  <td className="py-2 px-1">
                    <ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}