import React, { useState } from "react";
import { Lock, Brain, GraduationCap, Map, FileText, Database, MessageSquare, Building2, Server, ChevronDown, ChevronUp } from "lucide-react";
import { STATUS_META } from "@/lib/systemStatusEngine";
import { StatusDot, formatResponseTime, formatRelativeTime } from "./Shared";

const ICON_MAP = {
  Lock, Brain, GraduationCap, Map, FileText, Database, MessageSquare, Building2, Server,
};

export default function ComponentGrid({ components }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-white font-semibold text-sm">Component Status</h2>
        <span className="text-white/30 text-xs">— {components.length} monitored services</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {components.map((comp) => (
          <ComponentCard key={comp.id} component={comp} />
        ))}
      </div>
    </div>
  );
}

function ComponentCard({ component }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON_MAP[component.icon] || Server;
  const meta = STATUS_META[component.status] || STATUS_META.operational;

  return (
    <div className={`rounded-xl border ${meta.border} ${meta.bg} overflow-hidden transition-all`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/5`}>
          <Icon size={16} className="text-white/60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{component.name}</span>
            <StatusDot status={component.status} />
          </div>
          <div className="text-[11px] text-white/40 truncate">{component.description}</div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <div className="grid grid-cols-3 gap-2">
            <MiniMetric label="Status" value={meta.label} color={meta.color} />
            <MiniMetric label="Response" value={formatResponseTime(component.responseTime)} />
            <MiniMetric label="Availability" value={`${component.availability}%`} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MiniMetric label="Events (24h)" value={component.totalEvents} />
            <MiniMetric label="Errors (24h)" value={component.errorCount} color={component.errorCount > 0 ? "#f59e0b" : "#10b981"} />
            <MiniMetric label="Active Incidents" value={component.activeIncidents} color={component.activeIncidents > 0 ? "#ef4444" : "#10b981"} />
          </div>
          {component.recentChanges.length > 0 && (
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Recent Activity</div>
              <div className="space-y-1">
                {component.recentChanges.slice(0, 3).map((change, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-white/50 truncate">{change.type}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={change.status === "error" ? "text-red-400" : change.status === "warning" ? "text-amber-400" : "text-emerald-400"}>
                        {change.status}
                      </span>
                      <span className="text-white/30">{formatRelativeTime(change.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniMetric({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] rounded-lg p-2">
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-xs font-bold mt-0.5" style={color ? { color } : { color: "white" }}>{value}</div>
    </div>
  );
}