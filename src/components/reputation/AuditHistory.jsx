import React, { useState } from "react";
import { ScrollText, ChevronDown, ChevronUp } from "lucide-react";

export default function AuditHistory({ history }) {
  const [expanded, setExpanded] = useState(false);
  const logs = expanded ? history : (history || []).slice(0, 5);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText size={16} className="text-white/40" />
        <h2 className="text-sm font-semibold text-white/90">Audit History</h2>
        <span className="text-white/30 text-xs ml-auto">{history?.length || 0} records</span>
      </div>
      {(history || []).length === 0 ? (
        <p className="text-white/30 text-xs text-center py-4">No reputation changes recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => {
            const change = (log.new_score || 0) - (log.previous_score || 0);
            const isPositive = change > 0;
            const isNeutral = change === 0;
            return (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.01] border border-white/5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                  isPositive ? 'bg-emerald-500/10 text-emerald-400' : isNeutral ? 'bg-white/5 text-white/40' : 'bg-red-500/10 text-red-400'
                }`}>
                  {isPositive ? '+' : isNeutral ? '=' : change}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/70 text-xs font-medium">{log.reason || log.action_type || 'Recalculation'}</div>
                  <div className="text-white/30 text-[10px] mt-0.5">
                    {log.previous_score} → {log.new_score} · {log.source?.replace(/_/g, ' ') || 'system'}
                    {log.timestamp && ` · ${new Date(log.timestamp).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {(history?.length || 0) > 5 && (
        <button onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1 text-white/40 hover:text-white/60 text-xs py-2 transition-colors">
          {expanded ? <><ChevronUp size={13} /> Show Less</> : <><ChevronDown size={13} /> Show All {history.length}</>}
        </button>
      )}
    </div>
  );
}