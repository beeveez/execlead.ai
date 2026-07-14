import React from "react";
import { Rocket, CheckCircle2, Clock, AlertCircle, Users, Activity } from "lucide-react";
import { Panel, StatCard, BarRow, Empty } from "./Shared";

export default function BetaSuccessPanel({ data }) {
  if (!data) return null;
  const { beta } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={Rocket} label="Total Applications" value={beta.totalApplications} color="indigo" />
        <StatCard icon={CheckCircle2} label="Acceptance Rate" value={`${beta.acceptanceRate}%`} sub={`${beta.approved} approved`} color="emerald" />
        <StatCard icon={Activity} label="Activation Rate" value={`${beta.activationRate}%`} sub={`${beta.activated} activated`} color="cyan" />
        <StatCard icon={Users} label="Active Beta Users" value={beta.activeBetaUsers} color="purple" />
      </div>

      <Panel title="Application Funnel">
        <div className="space-y-3">
          <FunnelRow label="Total Applications" value={beta.totalApplications} total={beta.totalApplications} color="bg-indigo-500/60" />
          <FunnelRow label="Approved / Invited" value={beta.approved} total={beta.totalApplications} color="bg-emerald-500/60" />
          <FunnelRow label="Activated" value={beta.activated} total={beta.totalApplications} color="bg-cyan-500/60" />
          <FunnelRow label="Active Beta Users" value={beta.activeBetaUsers} total={beta.totalApplications} color="bg-purple-500/60" />
        </div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Pending Review">
          <div className="space-y-2">
            <StatusRow icon={Clock} label="Pending" value={beta.pending} color="text-amber-400" />
            <StatusRow icon={AlertCircle} label="Waitlisted" value={beta.waitlisted} color="text-white/40" />
          </div>
        </Panel>
        <Panel title="Feedback & Bugs">
          <div className="space-y-2">
            <BarRow label="Feedback Submissions" value={beta.totalFeedback} max={Math.max(beta.totalFeedback, beta.totalBugs, beta.totalFeatureRequests, 1)} color="bg-indigo-500/40" />
            <BarRow label="Bug Reports" value={beta.totalBugs} max={Math.max(beta.totalFeedback, beta.totalBugs, beta.totalFeatureRequests, 1)} color="bg-red-500/40" />
            <BarRow label="Feature Requests" value={beta.totalFeatureRequests} max={Math.max(beta.totalFeedback, beta.totalBugs, beta.totalFeatureRequests, 1)} color="bg-emerald-500/40" />
          </div>
        </Panel>
      </div>

      {beta.avgNPS && (
        <Panel title="Beta NPS">
          <div className="text-center py-4">
            <div className={`text-4xl font-bold ${beta.avgNPS >= 9 ? "text-emerald-400" : beta.avgNPS >= 7 ? "text-amber-400" : "text-red-400"}`}>{beta.avgNPS}</div>
            <div className="text-white/40 text-sm mt-1">Average NPS from Beta Members</div>
          </div>
        </Panel>
      )}
    </div>
  );
}

function FunnelRow({ label, value, total, color }) {
  const pctVal = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/60 text-xs">{label}</span>
        <span className="text-white/40 text-xs font-mono">{value} ({Math.round(pctVal)}%)</span>
      </div>
      <div className="bg-white/5 rounded-full h-2.5 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pctVal}%` }} />
      </div>
    </div>
  );
}

function StatusRow({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-2 text-white/50">
        <Icon size={14} className={color} /> {label}
      </span>
      <span className="text-white/70 font-medium">{value}</span>
    </div>
  );
}