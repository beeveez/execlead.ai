import React from "react";
import { BarChart3, CheckCircle2, XCircle, Clock, TrendingUp, Users, Globe, Award } from "lucide-react";

export default function AdmissionsAnalytics({ analytics }) {
  if (!analytics) return null;
  const a = analytics;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Received" value={a.total} icon={BarChart3} color="text-white/70" />
        <MetricCard label="Approved" value={a.approved} icon={CheckCircle2} color="text-emerald-400" />
        <MetricCard label="Declined" value={a.declined} icon={XCircle} color="text-red-400" />
        <MetricCard label="Pending" value={a.pending} icon={Clock} color="text-amber-400" />
        <MetricCard label="Avg Review" value={a.avgReviewHours > 0 ? `${a.avgReviewHours}h` : "—"} icon={Clock} color="text-indigo-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard label="Conversion Rate" value={`${a.conversionRate}%`} icon={TrendingUp} color="text-emerald-400" />
        <MetricCard label="Invitation Acceptance" value={`${a.invitationAcceptanceRate}%`} icon={Users} color="text-cyan-400" />
        <MetricCard label="Activated" value={a.activated} icon={Award} color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BreakdownPanel title="Applications by Country" icon={Globe} data={a.byCountry} />
        <BreakdownPanel title="Applications by Leadership Level" icon={Users} data={a.byLeadership} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <Icon size={14} className="text-white/30" />
      <div className={`text-lg font-bold ${color} mt-1`}>{value}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function BreakdownPanel({ title, icon: Icon, data = [] }) {
  const max = data.length > 0 ? data[0][1] : 1;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-indigo-400" />
        <h4 className="text-xs font-semibold text-white/70">{title}</h4>
      </div>
      {data.length === 0 ? (
        <p className="text-[11px] text-white/30 text-center py-4">No data yet</p>
      ) : (
        <div className="space-y-1.5">
          {data.map(([label, count]) => (
            <div key={label} className="flex items-center gap-2 text-[11px]">
              <span className="text-white/50 w-28 truncate capitalize">{label.replace(/_/g, " ")}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${(count / max) * 100}%` }} />
              </div>
              <span className="text-white/40 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}