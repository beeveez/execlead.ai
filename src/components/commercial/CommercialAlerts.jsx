import React, { useState } from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle, Bell } from "lucide-react";

const SEVERITY_CONFIG = {
  critical: { icon: AlertCircle, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", label: "Critical" },
  high: { icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "High" },
  medium: { icon: Bell, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", label: "Medium" },
  low: { icon: Info, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", label: "Low" },
  info: { icon: CheckCircle, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Info" },
};

export default function CommercialAlerts({ alerts }) {
  const [filter, setFilter] = useState("all");
  if (!alerts) return null;

  const filtered = filter === "all" ? alerts : alerts.filter(a => a.severity === filter);
  const counts = alerts.reduce((acc, a) => { acc[a.severity] = (acc[a.severity] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === "all" ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>
          All ({alerts.length})
        </button>
        {Object.entries(SEVERITY_CONFIG).map(([sev, cfg]) => counts[sev] ? (
          <button key={sev} onClick={() => setFilter(sev)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === sev ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>
            {cfg.label} ({counts[sev]})
          </button>
        ) : null)}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400/30 mb-3" />
          <p className="text-sm text-white/40">No alerts at this severity level.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert, i) => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.color}`}>
                <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">{alert.title}</div>
                  <div className="text-xs text-white/60 mt-0.5">{alert.description}</div>
                </div>
                <span className="text-[10px] text-white/30 shrink-0">{new Date(alert.date).toLocaleDateString()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}