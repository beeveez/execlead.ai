import React, { useMemo } from "react";
import { TrendingUp, Clock, CheckCircle2, XCircle, RefreshCw, Filter, BarChart3 } from "lucide-react";
import { computeEvidenceConfidence } from "@/lib/verificationIntelligenceEngine";

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <Icon size={14} className="text-white/30 mb-1" />
      <div className="text-xl font-bold text-white/80">{value}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-white/20 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function ProductIntelligencePanel({ records = [] }) {
  const analytics = useMemo(() => {
    const total = records.length;
    const applications = records.filter((r) => r.application_date).length;
    const verified = records.filter((r) => r.verification_status === "verified").length;
    const rejected = records.filter((r) => r.verification_status === "rejected").length;
    const approvalRate = total > 0 ? Math.round((verified / total) * 100) : 0;

    const processingTimes = records
      .filter((r) => r.application_date && r.review_date)
      .map((r) => new Date(r.review_date) - new Date(r.application_date));
    const avgProcessingMs = processingTimes.length > 0 ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length : 0;
    const avgProcessingDays = Math.round(avgProcessingMs / (1000 * 60 * 60 * 24));

    const evidenceFailures = {};
    records.forEach((r) => {
      if (r.identity_status === "rejected") evidenceFailures["Government ID"] = (evidenceFailures["Government ID"] || 0) + 1;
      if (r.employment_status === "rejected") evidenceFailures["Employment"] = (evidenceFailures["Employment"] || 0) + 1;
      if (r.certification_status === "rejected") evidenceFailures["Certification"] = (evidenceFailures["Certification"] || 0) + 1;
      if (r.executive_status === "rejected") evidenceFailures["Executive"] = (evidenceFailures["Executive"] || 0) + 1;
    });
    const topFailures = Object.entries(evidenceFailures).sort((a, b) => b[1] - a[1]);

    const renewalRate = verified > 0 ? Math.round((records.filter((r) => r.last_renewal_date).length / verified) * 100) : 0;

    // Funnel
    const funnel = [
      { stage: "Applied", count: applications },
      { stage: "Evidence Submitted", count: records.filter((r) => r.evidence_count > 0).length },
      { stage: "Under Review", count: records.filter((r) => r.verification_status === "under_review").length },
      { stage: "Approved", count: verified },
      { stage: "Rejected", count: rejected },
    ];

    return { total, applications, verified, rejected, approvalRate, avgProcessingDays, topFailures, renewalRate, funnel };
  }, [records]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Applications" value={analytics.applications} icon={BarChart3} />
        <StatCard label="Approval Rate" value={`${analytics.approvalRate}%`} icon={CheckCircle2} />
        <StatCard label="Avg Processing" value={analytics.avgProcessingDays > 0 ? `${analytics.avgProcessingDays}d` : "—"} icon={Clock} />
        <StatCard label="Renewal Rate" value={`${analytics.renewalRate}%`} icon={RefreshCw} />
      </div>

      {/* Verification Funnel */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white/80">Verification Funnel</h3>
        </div>
        <div className="space-y-2">
          {analytics.funnel.map((step, i) => {
            const maxCount = analytics.funnel[0].count || 1;
            const pct = (step.count / maxCount) * 100;
            return (
              <div key={step.stage} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-32 shrink-0">{step.stage}</span>
                <div className="flex-1 h-6 rounded-md bg-white/[0.02] overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${i === analytics.funnel.length - 1 ? "bg-red-500/30" : "bg-indigo-500/30"}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-white/50 w-8 text-right">{step.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Common Failures */}
      {analytics.topFailures.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white/80">Most Common Failures</h3>
          </div>
          <div className="space-y-2">
            {analytics.topFailures.map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <span className="text-white/50 flex-1">{type}</span>
                <div className="w-32 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-red-500/40" style={{ width: `${(count / analytics.total) * 100}%` }} />
                </div>
                <span className="text-white/40 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.total === 0 && (
        <div className="text-center py-12 text-xs text-white/30">
          <TrendingUp size={24} className="text-white/20 mx-auto mb-2" />
          No verification data available for analytics yet.
        </div>
      )}
    </div>
  );
}