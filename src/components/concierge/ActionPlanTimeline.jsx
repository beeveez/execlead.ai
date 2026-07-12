import React from "react";
import { ListChecks, AlertOctagon, Shield, Target, Flag } from "lucide-react";

function PhaseBlock({ phase, label, color, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="relative pl-4">
      <div className="absolute left-0 top-1 w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <div className="absolute left-[3px] top-3 bottom-0 w-px" style={{ backgroundColor: `${color}30` }} />
      <div className="text-[10px] font-bold mb-1" style={{ color }}>{label}</div>
      <ul className="space-y-0.5 mb-2">
        {items.map((item, i) => (
          <li key={i} className="text-[9px] text-muted-foreground leading-tight pl-1">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ActionPlanTimeline({ plan, risk }) {
  if (!plan && !risk) return null;

  return (
    <div className="space-y-2">
      {plan && (
        <>
          <div className="flex items-center gap-1.5">
            <ListChecks size={12} className="text-indigo-500" />
            <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wide">Executive Action Plan™</h4>
          </div>
          <div className="space-y-0">
            <PhaseBlock phase="immediate" label="Immediate (7 Days)" color="#ef4444" items={plan.immediate_7_days} />
            <PhaseBlock phase="30" label="30-Day Plan" color="#f97316" items={plan["30_day_plan"]} />
            <PhaseBlock phase="90" label="90-Day Plan" color="#f59e0b" items={plan["90_day_plan"]} />
            <PhaseBlock phase="12m" label="12-Month Plan" color="#10b981" items={plan["12_month_plan"]} />
          </div>
          {(plan.success_metrics?.length > 0 || plan.milestones?.length > 0 || plan.expected_outcomes?.length > 0) && (
            <div className="grid grid-cols-1 gap-1.5 mt-2">
              {plan.success_metrics?.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/20 p-2">
                  <div className="text-[9px] font-bold text-foreground mb-1 flex items-center gap-1"><Target size={9} /> Success Metrics</div>
                  <div className="flex flex-wrap gap-1">
                    {plan.success_metrics.map((m, i) => <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{m}</span>)}
                  </div>
                </div>
              )}
              {plan.milestones?.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/20 p-2">
                  <div className="text-[9px] font-bold text-foreground mb-1 flex items-center gap-1"><Flag size={9} /> Milestones</div>
                  <div className="flex flex-wrap gap-1">
                    {plan.milestones.map((m, i) => <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{m}</span>)}
                  </div>
                </div>
              )}
              {plan.expected_outcomes?.length > 0 && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
                  <div className="text-[9px] font-bold text-emerald-500 mb-1 flex items-center gap-1"><Target size={9} /> Expected Outcomes</div>
                  <ul className="space-y-0.5">
                    {plan.expected_outcomes.map((o, i) => <li key={i} className="text-[9px] text-muted-foreground">• {o}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {risk && (
        <div className="space-y-1.5 mt-2">
          <div className="flex items-center gap-1.5">
            <AlertOctagon size={12} className="text-red-500" />
            <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wide">Executive Risk Analysis™</h4>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {risk.potential_risks?.length > 0 && (
              <RiskBlock title="Potential Risks" items={risk.potential_risks} color="#ef4444" icon={AlertOctagon} />
            )}
            {risk.hidden_assumptions?.length > 0 && (
              <RiskBlock title="Hidden Assumptions" items={risk.hidden_assumptions} color="#f59e0b" icon={Shield} />
            )}
            {risk.missing_evidence?.length > 0 && (
              <RiskBlock title="Missing Evidence" items={risk.missing_evidence} color="#f97316" icon={AlertOctagon} />
            )}
            {risk.what_could_change?.length > 0 && (
              <RiskBlock title="What Could Change This" items={risk.what_could_change} color="#8b5cf6" icon={Target} />
            )}
            {risk.mitigation_strategies?.length > 0 && (
              <RiskBlock title="Mitigation Strategies" items={risk.mitigation_strategies} color="#10b981" icon={Shield} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RiskBlock({ title, items, color, icon: Icon }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-2">
      <div className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color }}>
        <Icon size={9} /> {title}
      </div>
      <ul className="space-y-0.5">
        {items.map((item, i) => <li key={i} className="text-[9px] text-muted-foreground leading-tight">• {item}</li>)}
      </ul>
    </div>
  );
}