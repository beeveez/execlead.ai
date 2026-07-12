import React from "react";
import { ScrollText, Activity, ShieldCheck, Wrench, RefreshCw, Loader2 } from "lucide-react";

const TYPE_ICONS = {
  platform_state: Activity,
  governance: ShieldCheck,
  self_healing: Wrench,
};

const STATUS_COLORS = {
  healthy: "#10b981",
  certified: "#10b981",
  completed: "#06b6d4",
  warning: "#f59e0b",
  error: "#ef4444",
};

export default function LiveAuditLog({ auditEvents, loading }) {
  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
        <Loader2 size={24} className="animate-spin text-indigo-400 mx-auto mb-3" />
        <p className="text-xs text-white/40">Loading live audit events...</p>
      </div>
    );
  }

  if (!auditEvents || auditEvents.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
        <RefreshCw size={24} className="text-white/20 mx-auto mb-3" />
        <p className="text-xs text-white/40">No audit events recorded yet.</p>
        <p className="text-[10px] text-white/30 mt-1">Platform changes will appear here once the governance pipeline runs.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText size={16} className="text-indigo-400" />
        <span className="text-sm font-bold text-white">Recent Platform Changes</span>
        <span className="ml-auto text-[10px] text-white/30">{auditEvents.length} events</span>
      </div>
      <div className="space-y-1">
        {auditEvents.map((event, i) => {
          const Icon = TYPE_ICONS[event.type] || Activity;
          const color = STATUS_COLORS[event.status] || "#64748b";
          return (
            <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                <Icon size={12} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-white/80">{event.event}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: `${color}15`, color }}>{event.status}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-white/30">
                  <span>{event.owner}</span>
                  <span>·</span>
                  <span>{event.date ? new Date(event.date).toLocaleString() : "—"}</span>
                  <span>·</span>
                  <span className="font-mono">Ref: {event.reference}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}