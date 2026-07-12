import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Target, TrendingUp, DollarSign, Dna, Zap } from "lucide-react";
import ExecutiveKPIDashboard from "./ExecutiveKPIDashboard";
import OptionsComparison from "./OptionsComparison";
import PredictiveTimeline from "./PredictiveTimeline";
import EvidenceTraceabilityMatrix from "./EvidenceTraceabilityMatrix";
import ActionPlanTimeline from "./ActionPlanTimeline";

function confColor(v) {
  if (v >= 80) return "#10b981";
  if (v >= 60) return "#f59e0b";
  if (v >= 40) return "#f97316";
  return "#ef4444";
}

function ConfidenceBar({ label, value, icon: Icon }) {
  const color = confColor(value);
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon size={11} style={{ color }} className="flex-shrink-0" />}
      <span className="text-[10px] text-muted-foreground w-28 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-bold w-8 text-right" style={{ color }}>{value}%</span>
    </div>
  );
}

function RecDetail({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-1.5">
      {Icon && <Icon size={10} className="text-muted-foreground flex-shrink-0 mt-0.5" />}
      <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide w-24 flex-shrink-0">{label}</span>
      <span className="text-[10px] text-foreground flex-1">{value}</span>
    </div>
  );
}

export default function DecisionSupportCard({ data }) {
  const [expanded, setExpanded] = useState(true);
  if (!data) return null;

  const rec = data.recommendation || {};
  const conf = data.confidence_breakdown || [];
  const overallConf = rec.confidence || 0;

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/5 to-transparent overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/15 transition-colors"
      >
        <Sparkles size={14} className="text-indigo-500 flex-shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-indigo-500">EXEC™ Decision Intelligence</div>
          <div className="text-xs font-bold text-foreground truncate">{rec.title || data.executive_summary?.slice(0, 60) || "Executive Decision Analysis"}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="text-right">
            <div className="text-[8px] text-muted-foreground uppercase">Confidence</div>
            <div className="text-sm font-bold" style={{ color: confColor(overallConf) }}>{overallConf}%</div>
          </div>
          {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="p-3 space-y-3 animate-fade-in">
          {/* Executive Summary */}
          {data.executive_summary && (
            <p className="text-[11px] text-foreground leading-relaxed italic border-l-2 border-indigo-500/30 pl-2.5">
              {data.executive_summary}
            </p>
          )}

          {/* Primary Recommendation */}
          {rec.title && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-foreground uppercase tracking-wide flex items-center gap-1">
                <Target size={11} className="text-indigo-500" /> Primary Recommendation
              </div>
              {rec.reason && <p className="text-[10px] text-muted-foreground leading-relaxed">{rec.reason}</p>}
              <div className="grid grid-cols-1 gap-1 mt-1">
                <RecDetail label="Timeline" value={rec.estimated_timeline} icon={TrendingUp} />
                <RecDetail label="Salary Impact" value={rec.expected_salary_impact} icon={DollarSign} />
                <RecDetail label="Promotion Prob." value={rec.promotion_probability ? `${rec.promotion_probability}%` : null} icon={TrendingUp} />
                <RecDetail label="Readiness Gain" value={rec.readiness_improvement} icon={Target} />
                <RecDetail label="Leadership DNA™" value={rec.leadership_dna_impact} icon={Dna} />
                <RecDetail label="Journey Points" value={rec.journey_point_impact} icon={Zap} />
              </div>
              {rec.trade_offs && (
                <p className="text-[10px] text-muted-foreground mt-1"><strong className="text-foreground">Trade-offs:</strong> {rec.trade_offs}</p>
              )}
              {rec.expected_outcomes && (
                <p className="text-[10px] text-muted-foreground"><strong className="text-foreground">Expected Outcomes:</strong> {rec.expected_outcomes}</p>
              )}
            </div>
          )}

          {/* Confidence Breakdown */}
          {conf.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-foreground uppercase tracking-wide">Per-Dimension Confidence</div>
              {conf.map((c, i) => <ConfidenceBar key={i} label={c.dimension} value={c.confidence} />)}
            </div>
          )}

          {/* KPI Dashboard */}
          <ExecutiveKPIDashboard kpi={data.kpi_dashboard} />

          {/* Options Analysis */}
          <OptionsComparison options={data.options} />

          {/* Predictive Timeline */}
          <PredictiveTimeline timeline={data.predictive_timeline} />

          {/* Evidence & Frameworks */}
          <EvidenceTraceabilityMatrix
            evidence={data.evidence_traceability}
            frameworks={data.frameworks}
            used={data.evidence_used}
            missing={data.evidence_missing}
          />

          {/* Action Plan & Risk Analysis */}
          <ActionPlanTimeline plan={data.action_plan} risk={data.risk_analysis} />
        </div>
      )}
    </div>
  );
}