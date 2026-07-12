import React from "react";
import { Crown, TrendingUp, Brain, Target, Users, Cpu, Building2, Sparkles, Gauge, Zap } from "lucide-react";

function confColor(v) {
  if (v >= 80) return "#10b981";
  if (v >= 60) return "#f59e0b";
  if (v >= 40) return "#f97316";
  return "#ef4444";
}

function KpiCell({ icon: Icon, label, value, suffix, color }) {
  const numVal = typeof value === "number" ? value : 0;
  const display = typeof value === "string" ? value : `${numVal}${suffix || ""}`;
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-muted/50 border border-border">
      <Icon size={13} className="flex-shrink-0" style={{ color: color || confColor(numVal) }} />
      <div className="min-w-0 flex-1">
        <div className="text-[9px] text-muted-foreground truncate">{label}</div>
        <div className="text-xs font-bold" style={{ color: color || confColor(numVal) }}>{display}</div>
      </div>
    </div>
  );
}

export default function ExecutiveKPIDashboard({ kpi }) {
  if (!kpi) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Gauge size={12} className="text-indigo-500" />
        <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wide">Executive KPI Dashboard™</h4>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <KpiCell icon={Crown} label="Current Level" value={kpi.current_level || "—"} color="#6366f1" />
        <KpiCell icon={Zap} label="Journey Points" value={kpi.journey_points || 0} color="#f59e0b" />
        <KpiCell icon={Target} label="Executive Readiness" value={kpi.executive_readiness || 0} suffix="%" />
        <KpiCell icon={Brain} label="Leadership Confidence" value={kpi.leadership_confidence || 0} suffix="%" />
        <KpiCell icon={TrendingUp} label="Strategic Thinking" value={kpi.strategic_thinking || 0} suffix="%" />
        <KpiCell icon={Sparkles} label="Commercial Acumen" value={kpi.commercial_acumen || 0} suffix="%" />
        <KpiCell icon={Users} label="People Leadership" value={kpi.people_leadership || 0} suffix="%" />
        <KpiCell icon={Cpu} label="Technology Leadership" value={kpi.technology_leadership || 0} suffix="%" />
        <KpiCell icon={Building2} label="Board Readiness" value={kpi.board_readiness || 0} suffix="%" />
        <KpiCell icon={Crown} label="Executive Presence" value={kpi.executive_presence || 0} suffix="%" />
        <KpiCell icon={TrendingUp} label="Promotion Probability" value={kpi.promotion_probability || 0} suffix="%" />
        <KpiCell icon={Gauge} label="Exec Intelligence Score" value={kpi.executive_intelligence_score || 0} suffix="%" color="#6366f1" />
      </div>
      {kpi.career_velocity && (
        <div className="text-[10px] text-muted-foreground text-center">
          Career Velocity: <span className="font-medium text-foreground">{kpi.career_velocity}</span>
        </div>
      )}
    </div>
  );
}