import React from "react";
import { RotateCcw, Check, X } from "lucide-react";

const RESULT_STYLES = {
  applied: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  queued: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  failed: "text-red-400 bg-red-500/10 border-red-500/20",
  rolled_back: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  skipped: "text-white/40 bg-white/5 border-white/10",
  alerted: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function GuardianActivityLog({ activities, onRollback }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-10 text-center">
        <p className="text-white/40 text-sm">No self-healing activity yet.</p>
        <p className="text-white/30 text-xs mt-1">Repairs will appear here once the Guardian runs.</p>
      </div>
    );
  }
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Issue</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Result</th>
              <th className="px-4 py-3 font-medium">Rollback</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id || a.scan_id + a.issue} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-xs text-white/40 whitespace-nowrap">{timeAgo(a.created_date)}</td>
                <td className="px-4 py-3">
                  <div className="text-xs text-white/80 font-medium max-w-xs truncate">{a.issue}</div>
                  <div className="text-[10px] text-white/30 uppercase">{a.category} • {a.trigger}</div>
                </td>
                <td className="px-4 py-3 text-xs text-white/60">{a.action_taken || "—"}</td>
                <td className="px-4 py-3">
                  {a.confidence_score > 0 ? (
                    <span className="text-xs font-mono" style={{ color: a.confidence_score >= 95 ? "#10b981" : a.confidence_score >= 70 ? "#f59e0b" : "#ef4444" }}>{a.confidence_score}%</span>
                  ) : <span className="text-xs text-white/20">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${RESULT_STYLES[a.result] || RESULT_STYLES.skipped}`}>{a.result}</span>
                </td>
                <td className="px-4 py-3">
                  {a.rollback_status === "available" && a.result === "applied" ? (
                    <button onClick={() => onRollback(a)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-[10px] transition-colors">
                      <RotateCcw size={10} /> Rollback
                    </button>
                  ) : a.rollback_status === "rolled_back" ? (
                    <span className="flex items-center gap-1 text-[10px] text-purple-400"><Check size={10} /> Rolled back</span>
                  ) : (
                    <span className="text-[10px] text-white/20">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}