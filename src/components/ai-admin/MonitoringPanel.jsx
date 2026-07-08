import React from "react";
import { useAIOperations } from "@/hooks/useAIOperations";
import { fmtNum, fmtMs } from "@/lib/aiOperations";
import { Activity, Zap, Clock, AlertTriangle, Loader2 } from "lucide-react";

export default function MonitoringPanel() {
  const { loading, analytics, logs } = useAIOperations();
  const t = analytics?.totals || {};
  const lat = analytics?.latency || {};
  const recent = analytics?.recent || logs || [];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-white/30" /></div>;

  const stats = [
    { label: 'Total Requests', value: fmtNum(t.totalRequests || 0), icon: Activity, color: 'text-indigo-400' },
    { label: 'Tokens Used', value: fmtNum(t.monthTokens || 0), icon: Zap, color: 'text-amber-400' },
    { label: 'Avg Response', value: fmtMs(lat.avg || 0), icon: Clock, color: 'text-cyan-400' },
    { label: 'Errors', value: t.errorCount || 0, icon: AlertTriangle, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Monitoring</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <s.icon size={14} className={`${s.color} mb-2`} />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
        <h3 className="text-white/60 text-sm font-medium mb-3">Recent Requests</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {recent.slice(0, 15).map((log, i) => (
            <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-white/5 last:border-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-white/60 font-mono truncate">{log.model || 'automatic'}</span>
              <span className="text-white/30 flex-1 truncate">{log.module || 'unknown'}</span>
              <span className="text-white/30 flex-shrink-0">{fmtMs(log.response_time_ms || 0)}</span>
            </div>
          ))}
          {recent.length === 0 && <p className="text-white/20 text-xs text-center py-4">No requests logged</p>}
        </div>
      </div>
    </div>
  );
}