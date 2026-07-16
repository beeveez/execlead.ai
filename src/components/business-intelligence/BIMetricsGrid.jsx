import React from "react";
import {
  Zap, CheckCircle, ThumbsUp, Target, GraduationCap, TrendingUp,
  Activity, Compass, DollarSign, ArrowUpCircle, Building2, UserCheck,
  Users, UserMinus,
} from "lucide-react";
import { BI_METRICS, formatMetric, getScoreColor, getScoreBg } from "@/lib/businessIntelligenceEngine";

const ICONS = { Zap, CheckCircle, ThumbsUp, Target, GraduationCap, TrendingUp, Activity, Compass, DollarSign, ArrowUpCircle, Building2, UserCheck, Users, UserMinus };

export default function BIMetricsGrid({ report }) {
  if (!report) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest">Outcome Metrics</h3>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {BI_METRICS.map((metric) => {
          const Icon = ICONS[metric.icon] || Activity;
          const value = report[metric.key] || 0;
          const color = getScoreColor(metric.type === "percent" ? value : 50);
          const isInverse = metric.key === "churn_rate";
          const displayColor = isInverse
            ? value <= 5 ? "text-emerald-400" : value <= 10 ? "text-amber-400" : "text-red-400"
            : color;

          return (
            <div key={metric.key} className={`border rounded-lg p-3 ${getScoreBg(metric.type === "percent" && !isInverse ? value : 50)}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon size={14} className="text-white/30" />
              </div>
              <div className={`text-xl font-bold ${displayColor}`}>
                {formatMetric(value, metric.type)}
              </div>
              <div className="text-white/40 text-[11px] mt-0.5 leading-tight">{metric.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}