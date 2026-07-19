import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";

export default function SecurityAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
        <span className="text-xs text-emerald-400/90">Your account is fully protected.</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium px-1 mb-1">Security Alerts</div>
      {alerts.map((alert, i) => {
        const inner = (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors group">
            <AlertTriangle size={13} className="text-amber-400 shrink-0" />
            <span className="text-xs text-amber-400/90 flex-1">{alert.message}</span>
            <ChevronRight size={12} className="text-amber-400/30 group-hover:text-amber-400/60 transition-colors shrink-0" />
          </div>
        );
        if (alert.to) return <Link key={i} to={alert.to}>{inner}</Link>;
        if (alert.onClick) return <button key={i} onClick={alert.onClick} className="w-full text-left">{inner}</button>;
        return <div key={i}>{inner}</div>;
      })}
    </div>
  );
}