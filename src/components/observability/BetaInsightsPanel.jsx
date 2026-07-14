import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, UserCheck, Bug, Lightbulb } from "lucide-react";
import { Spinner, Empty, Panel, BarRow, FunnelRow, StatCard } from "./Shared";

export default function BetaInsightsPanel() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BetaApplication.list("-created_date", 200)
      .then((data) => setApps(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const statusCounts = {};
  apps.forEach((a) => { if (a.status) statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });
  const pending = statusCounts.pending || 0;
  const approved = statusCounts.approved || 0;
  const invited = statusCounts.invited || 0;
  const activated = statusCounts.activated || 0;
  const rejected = statusCounts.rejected || 0;
  const waitlisted = statusCounts.waitlisted || 0;
  const conversionRate = apps.length > 0 ? Math.round((activated / apps.length) * 100) : 0;

  const tierCounts = {};
  apps.forEach((a) => { if (a.beta_tier) tierCounts[a.beta_tier] = (tierCounts[a.beta_tier] || 0) + 1; });
  const sortedTiers = Object.entries(tierCounts).sort((a, b) => b[1] - a[1]);

  const totalFeedback = apps.reduce((sum, a) => sum + (a.feedback_count || 0), 0);
  const totalBugs = apps.reduce((sum, a) => sum + (a.bug_report_count || 0), 0);
  const totalFeatures = apps.reduce((sum, a) => sum + (a.feature_request_count || 0), 0);
  const activeBetaUsers = apps.filter((a) => a.is_active_beta_user).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Applications" value={apps.length} color="indigo" />
        <StatCard icon={UserCheck} label="Activated" value={activated} sublabel={`${conversionRate}% conversion`} color="emerald" />
        <StatCard icon={Bug} label="Bug Reports" value={totalBugs} color="red" />
        <StatCard icon={Lightbulb} label="Feature Requests" value={totalFeatures} color="amber" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel title="Application Funnel">
          <div className="space-y-3">
            <FunnelRow label="Pending" value={pending} total={apps.length} color="bg-amber-500/60" />
            <FunnelRow label="Approved" value={approved} total={apps.length} color="bg-indigo-500/60" />
            <FunnelRow label="Waitlisted" value={waitlisted} total={apps.length} color="bg-cyan-500/60" />
            <FunnelRow label="Invited" value={invited} total={apps.length} color="bg-purple-500/60" />
            <FunnelRow label="Activated" value={activated} total={apps.length} color="bg-emerald-500/60" />
            <FunnelRow label="Rejected" value={rejected} total={apps.length} color="bg-red-500/60" />
          </div>
        </Panel>
        <Panel title="Beta Tier Distribution">
          {sortedTiers.length === 0 ? <Empty text="No applications yet." /> : (
            <div className="space-y-1">
              {sortedTiers.map(([tier, count]) => (
                <BarRow key={tier} label={tier} value={count} max={sortedTiers[0][1]} color="bg-purple-500/60" />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={UserCheck} label="Active Beta Users" value={activeBetaUsers} color="emerald" />
        <StatCard icon={Users} label="Pending Review" value={pending} color="amber" />
        <StatCard icon={Lightbulb} label="Total Feedback" value={totalFeedback} color="cyan" />
      </div>
    </div>
  );
}