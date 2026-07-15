import React from 'react';
import { AlertTriangle, ShieldAlert, AlertCircle, Info } from 'lucide-react';

const SEVERITY_STYLES = {
  critical: { icon: ShieldAlert, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  high: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  medium: { icon: AlertCircle, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  low: { icon: Info, color: "text-white/50", bg: "bg-white/5", border: "border-white/10" },
};

export default function InterventionPanel({ interventions = [], stats }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
          <ShieldAlert size={12} className="text-amber-400" />
          Predictive Interventions™
        </div>
        <span className="text-[10px] text-white/30">
          {stats.totalRules} rules · {stats.bySeverity.critical} critical
        </span>
      </div>

      {interventions.length === 0 ? (
        <div className="text-center py-8">
          <ShieldAlert size={24} className="text-emerald-400/30 mx-auto mb-2" />
          <p className="text-white/30 text-xs">No interventions triggered. All clear.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {interventions.map((intv) => {
            const style = SEVERITY_STYLES[intv.severity] || SEVERITY_STYLES.low;
            const Icon = style.icon;
            return (
              <div key={intv.ruleId} className={`${style.bg} ${style.border} border rounded-lg p-3`}>
                <div className="flex items-start gap-2">
                  <Icon size={14} className={`${style.color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${style.color}`}>{intv.name}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{intv.description}</div>
                    <div className="text-[10px] text-white/50 mt-1 italic">{intv.action.message}</div>
                    <div className="flex gap-3 mt-1.5 text-[9px] text-white/30">
                      <span>Readiness: {intv.context.readiness}%</span>
                      <span>Momentum: {intv.context.momentum}</span>
                      <span>Overdue: {intv.context.overdueActions}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}