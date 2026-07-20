import React, { useMemo } from "react";
import { BarChart3, Clock, CheckCircle2, XCircle, RefreshCw, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { computeEvidenceConfidence } from "@/lib/verificationIntelligenceEngine";

function MetricCard({ label, value, icon: Icon, color = "text-white/70" }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between mb-1">
        <Icon size={14} className="text-white/30" />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

export default function AdminMetricsDashboard({ records = [] }) {
  const metrics = useMemo(() => {
    const total = records.length;
    const pending = records.filter((r) => r.verification_status === "pending").length;
    const underReview = records.filter((r) => r.verification_status === "under_review").length;
    const verified = records.filter((r) => r.verification_status === "verified").length;
    const rejected = records.filter((r) => r.verification_status === "rejected").length;
    const expired = records.filter((r) => r.verification_status === "expired").length;
    const renewed = records.filter((r) => r.last_renewal_date).length;
    const decided = verified + rejected;
    const approvalRate = decided > 0 ? Math.round((verified / decided) * 100) : 0;
    const renewalRate = verified > 0 ? Math.round((renewed / verified) * 100) : 0;

    const reviewTimes = records
      .filter((r) => r.application_date && r.review_date)
      .map((r) => new Date(r.review_date) - new Date(r.application_date));
    const avgReviewMs = reviewTimes.length > 0 ? reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length : 0;
    const avgReviewHours = Math.round(avgReviewMs / (1000 * 60 * 60));

    const reviewerCounts = {};
    records.forEach((r) => {
      if (r.reviewer_name) reviewerCounts[r.reviewer_name] = (reviewerCounts[r.reviewer_name] || 0) + 1;
    });
    const reviewerWorkload = Object.entries(reviewerCounts).sort((a, b) => b[1] - a[1]);

    const confidenceBuckets = { low: 0, medium: 0, high: 0 };
    records.forEach((r) => {
      const { level } = computeEvidenceConfidence(r);
      confidenceBuckets[level]++;
    });

    const evidenceTypes = {};
    records.forEach((r) => {
      if (r.identity_status === "verified") evidenceTypes["Government ID"] = (evidenceTypes["Government ID"] || 0) + 1;
      if (r.employment_status === "verified") evidenceTypes["Employment"] = (evidenceTypes["Employment"] || 0) + 1;
      if (r.certification_status === "verified") evidenceTypes["Certification"] = (evidenceTypes["Certification"] || 0) + 1;
      if (r.executive_status === "verified") evidenceTypes["Executive"] = (evidenceTypes["Executive"] || 0) + 1;
      if (r.enterprise_status === "verified") evidenceTypes["Organization"] = (evidenceTypes["Organization"] || 0) + 1;
    });
    const topEvidence = Object.entries(evidenceTypes).sort((a, b) => b[1] - a[1]);

    return {
      total, pending, underReview, verified, rejected, expired, renewed,
      approvalRate, renewalRate, avgReviewHours, reviewerWorkload,
      confidenceBuckets, topEvidence,
    };
  }, [records]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Pending Reviews" value={metrics.pending + metrics.underReview} icon={Clock} color="text-amber-400" />
        <MetricCard label="Avg Review Time" value={metrics.avgReviewHours > 0 ? `${metrics.avgReviewHours}h` : "—"} icon={Clock} />
        <MetricCard label="Approval Rate" value={`${metrics.approvalRate}%`} icon={CheckCircle2} color="text-emerald-400" />
        <MetricCard label="Rejected" value={metrics.rejected} icon={XCircle} color="text-red-400" />
        <MetricCard label="Expired" value={metrics.expired} icon={AlertTriangle} color="text-orange-400" />
        <MetricCard label="Renewals" value={metrics.renewed} icon={RefreshCw} />
        <MetricCard label="Renewal Rate" value={`${metrics.renewalRate}%`} icon={TrendingUp} />
        <MetricCard label="Total Processed" value={metrics.total} icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Evidence Confidence Distribution */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white/80">Evidence Confidence Distribution</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "High", count: metrics.confidenceBuckets.high, color: "bg-emerald-500" },
              { label: "Medium", count: metrics.confidenceBuckets.medium, color: "bg-amber-500" },
              { label: "Low", count: metrics.confidenceBuckets.low, color: "bg-red-500" },
            ].map((bucket) => (
              <div key={bucket.label} className="flex items-center gap-3">
                <span className="text-xs text-white/40 w-12">{bucket.label}</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full ${bucket.color} transition-all duration-500`} style={{ width: `${metrics.total > 0 ? (bucket.count / metrics.total) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-white/50 w-6 text-right">{bucket.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviewer Workload */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white/80">Reviewer Workload</h3>
          </div>
          {metrics.reviewerWorkload.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-4">No reviewer assignments yet</p>
          ) : (
            <div className="space-y-2">
              {metrics.reviewerWorkload.slice(0, 5).map(([name, count]) => (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <span className="text-white/50 flex-1 truncate">{name}</span>
                  <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${(count / metrics.total) * 100}%` }} />
                  </div>
                  <span className="text-white/40 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Evidence Types */}
      {metrics.topEvidence.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white/80">Most Common Verified Evidence</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.topEvidence.map(([type, count]) => (
              <span key={type} className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full">
                {type} <span className="text-white/30">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}