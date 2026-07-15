import React from 'react';
import { AlertTriangle, XCircle, AlertCircle, CheckCircle } from 'lucide-react';

const SEVERITY_STYLES = {
  critical: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", icon: XCircle },
  warning: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: AlertTriangle },
  info: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", icon: AlertCircle },
};

export default function AlertsPanel({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400" />
          Active Alerts
        </h3>
        <div className="text-center py-6">
          <CheckCircle size={20} className="text-emerald-400/30 mx-auto mb-2" />
          <p className="text-[11px] text-white/30">No active alerts. All systems operating normally.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
        <AlertTriangle size={14} className="text-amber-400" />
        Active Alerts
        <span className="text-[10px] text-white/30 ml-1">{alerts.length}</span>
      </h3>
      <div className="space-y-2">
        {alerts.map((alert, i) => {
          const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.warning;
          const Icon = style.icon;
          return (
            <div key={i} className={`border rounded-lg p-3 ${style.bg} ${style.border}`}>
              <div className="flex items-start gap-2">
                <Icon size={12} className={`flex-shrink-0 mt-0.5 ${style.text}`} />
                <div className="flex-1">
                  <div className={`text-[11px] font-medium ${style.text}`}>{alert.title}</div>
                  <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">{alert.message}</p>
                  <span className="text-[8px] uppercase tracking-wider text-white/20 mt-1 inline-block">{alert.category}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}