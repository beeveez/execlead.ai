import React from "react";
import { Activity, Lock } from "lucide-react";
import { OBSERVABILITY_METRICS } from "@/lib/execVerifiedFreeze";

export default function ObservabilityMetrics({ records = [] }) {
  const verified = records.filter((r) => r.verification_status === "verified").length;
  const decided = verified + records.filter((r) => r.verification_status === "rejected").length;
  const approvalRate = decided > 0 ? Math.round((verified / decided) * 100) : 0;
  const renewed = records.filter((r) => r.last_renewal_date).length;
  const renewalRate = verified > 0 ? Math.round((renewed / verified) * 100) : 0;
  const reviewTimes = records.filter((r) => r.application_date && r.review_date).map((r) => new Date(r.review_date) - new Date(r.application_date));
  const avgReviewHours = reviewTimes.length > 0 ? Math.round(reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length / (1000 * 60 * 60)) : 0;
  const errors = records.filter((r) => r.verification_status === "rejected").length;
  const errorRate = records.length > 0 ? Math.round((errors / records.length) * 100) : 0;

  const computedValues = {
    avg_review_time: avgReviewHours > 0 ? `${avgReviewHours}h` : "—",
    approval_rate: `${approvalRate}%`,
    renewal_rate: `${renewalRate}%`,
    error_rate: `${errorRate}%`,
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Observability Metrics</h3>
        <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full ml-auto text-white/30 bg-white/5">
          <Lock size={9} /> Internal Only
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {OBSERVABILITY_METRICS.map((metric) => (
          <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/60">{metric.label}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{metric.desc}</div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <div className="text-sm font-bold text-white/80">
                {computedValues[metric.id] || "Dormant"}
              </div>
              <div className="text-[9px] text-white/20">{metric.source}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}