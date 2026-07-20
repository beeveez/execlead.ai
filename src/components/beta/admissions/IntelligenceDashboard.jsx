import React, { useMemo } from "react";
import {
  computeAdmissionsIntelligence, computeCapacityForecast,
  computeAdmissionsHealth, getHealthStatus,
} from "@/lib/admissionsIntelligenceEngine";
import { BarChart3, Clock, CheckCircle2, XCircle, Calendar, TrendingUp, Gauge, Users, Activity } from "lucide-react";

export default function IntelligenceDashboard({ records, capacityInfo }) {
  const intel = useMemo(() => computeAdmissionsIntelligence(records, capacityInfo), [records, capacityInfo]);
  const forecast = useMemo(() => computeCapacityForecast(records, capacityInfo), [records, capacityInfo]);
  const health = useMemo(() => computeAdmissionsHealth(records, capacityInfo), [records, capacityInfo]);

  return (
    <div className="space-y-6">
      {/* Admissions Intelligence Metrics */}
      <div>
        <SectionLabel icon={BarChart3} text="Admissions Intelligence" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <MetricCard label="Total Applications" value={intel.total} icon={BarChart3} />
          <MetricCard label="Under Review" value={intel.pending} icon={Clock} color="text-amber-400" />
          <MetricCard label="Approved" value={intel.approved} icon={CheckCircle2} color="text-emerald-400" />
          <MetricCard label="Declined" value={intel.declined} icon={XCircle} color="text-red-400" />
          <MetricCard label="Interview Required" value={intel.interviewRequired} icon={Users} color="text-purple-400" />
          <MetricCard label="This Week" value={intel.thisWeek} icon={Calendar} color="text-cyan-400" />
          <MetricCard label="Today" value={intel.today} icon={Calendar} color="text-cyan-400" />
          <MetricCard label="Approval Rate" value={`${intel.conversionRate}%`} icon={TrendingUp} color="text-emerald-400" />
          <MetricCard label="Avg Review Time" value={intel.avgReviewHours > 0 ? `${intel.avgReviewHours}h` : "—"} icon={Clock} color="text-indigo-400" />
          <MetricCard label="Capacity Remaining" value={intel.capacityRemaining} icon={Gauge} color="text-amber-400" />
          <MetricCard label="Waitlist Size" value={intel.waitlistSize} icon={Users} color="text-white/50" />
          <MetricCard label="Activated" value={intel.activated} icon={Activity} color="text-emerald-400" />
        </div>
      </div>

      {/* Capacity Forecast */}
      <div>
        <SectionLabel icon={TrendingUp} text="Capacity Forecast" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard label="Days Until Full" value={forecast.daysUntilFull > 0 ? forecast.daysUntilFull : "—"} icon={Clock} color="text-amber-400" />
          <MetricCard label="Applications / Day" value={forecast.appsPerDay} icon={TrendingUp} color="text-cyan-400" />
          <MetricCard label="Acceptance Rate" value={`${forecast.acceptanceRate}%`} icon={CheckCircle2} color="text-emerald-400" />
          <MetricCard label="Projected Closing" value={forecast.projectedClosingDate ? forecast.projectedClosingDate.toLocaleDateString() : "—"} icon={Calendar} color="text-indigo-400" />
          <MetricCard label="Projected Waitlist" value={forecast.projectedWaitlistSize} icon={Users} color="text-white/50" />
        </div>
      </div>

      {/* Admissions Health */}
      <div>
        <SectionLabel icon={Gauge} text="Executive Admissions Health" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <HealthCard label="Admissions" score={health.admissionsHealth} />
          <HealthCard label="Capacity" score={health.capacityHealth} />
          <HealthCard label="Reviewer" score={health.reviewerHealth} />
          <HealthCard label="Processing" score={health.processingHealth} />
          <HealthCard label="Notifications" score={health.notificationHealth} />
          <HealthCard label="Approval Pipeline" score={health.approvalPipeline} />
          <HealthCard label="Overall" score={health.overall} highlight />
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-amber-400" />
      <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{text}</span>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color = "text-white/70" }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <Icon size={13} className="text-white/30" />
      <div className={`text-lg font-bold ${color} mt-1`}>{value}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function HealthCard({ label, score, highlight }) {
  const status = getHealthStatus(score);
  return (
    <div className={`p-3 rounded-xl border ${highlight ? "bg-amber-500/5 border-amber-500/20" : "bg-white/[0.02] border-white/5"}`}>
      <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block ${status.badge}`}>{status.label}</div>
      <div className={`text-lg font-bold mt-1 ${highlight ? "text-amber-400" : "text-white/70"}`}>{score}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}