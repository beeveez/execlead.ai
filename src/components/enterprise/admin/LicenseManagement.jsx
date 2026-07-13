import React, { useState, useEffect } from "react";
import { Ticket, Loader2, TrendingUp, Clock, AlertTriangle, Cpu, Layers, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DashboardKPI from "@/components/enterprise/DashboardKPI";

export default function LicenseManagement({ organization }) {
  const [orgs, setOrgs] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [allOrgs, mems] = await Promise.all([
        base44.entities.Organization.list("-created_date", 200),
        organization?.id ? base44.entities.OrgMembership.filter({ organization_id: organization.id }) : base44.entities.OrgMembership.list("-created_date", 1000),
      ]);
      setOrgs(allOrgs);
      setMemberships(mems);
    } catch (e) {
      console.error("License load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  const today = new Date();
  const purchased = orgs.reduce((s, o) => s + (o.seats_total || 0), 0);
  const assigned = orgs.reduce((s, o) => s + (o.seats_used || 0), 0);
  const available = purchased - assigned;
  const expired = orgs.filter((o) => o.contract_end_date && new Date(o.contract_end_date) < today);
  const pending = orgs.filter((o) => o.plan_status === "pending");

  // AI credits estimate (mock based on seats)
  const aiCreditsTotal = orgs.reduce((s, o) => s + (o.seats_total || 0) * 1000, 0);
  const aiCreditsUsed = orgs.reduce((s, o) => s + (o.seats_used || 0) * 620, 0);

  // Feature licenses (per plan)
  const planBreakdown = ["free", "professional", "executive", "enterprise"].map((plan) => ({
    plan,
    count: orgs.filter((o) => o.plan === plan).length,
    seats: orgs.filter((o) => o.plan === plan).reduce((s, o) => s + (o.seats_total || 0), 0),
  }));

  // Workspace licenses
  const wsLicenses = ["executive", "enterprise", "developer", "analytics", "trust"].map((ws) => ({
    ws,
    assigned: memberships.filter((m) => m.workspaces?.includes(ws)).length,
  }));

  // Forecast (simple projection)
  const utilization = purchased > 0 ? Math.round((assigned / purchased) * 100) : 0;
  const forecastMonths = Array.from({ length: 6 }, (_, i) => {
    const projected = Math.round(assigned * (1 + 0.04 * (i + 1)));
    return { month: `+${i + 1}m`, seats: Math.min(projected, purchased), capacity: purchased };
  });

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={Ticket} label="Purchased" value={purchased} color="indigo" />
        <DashboardKPI icon={Ticket} label="Assigned" value={assigned} sub={`${utilization}%`} color="amber" />
        <DashboardKPI icon={Ticket} label="Available" value={available} color={available > 0 ? "emerald" : "red"} />
        <DashboardKPI icon={Clock} label="Expired" value={expired.length} color={expired.length === 0 ? "emerald" : "red"} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={AlertTriangle} label="Pending" value={pending.length} color="amber" />
        <DashboardKPI icon={Cpu} label="AI Credits Used" value={`${(aiCreditsUsed / 1000).toFixed(1)}k`} sub={`of ${(aiCreditsTotal / 1000).toFixed(0)}k`} color="violet" />
        <DashboardKPI icon={Layers} label="Feature Licenses" value={planBreakdown.reduce((s, p) => s + p.count, 0)} color="blue" />
        <DashboardKPI icon={BarChart3} label="Workspace Licenses" value={wsLicenses.length} color="teal" />
      </div>

      {/* License analytics + forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Utilization */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-indigo-400" />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">License Utilization</h3>
          </div>
          <div className="space-y-3">
            {orgs.slice(0, 6).map((o) => {
              const used = o.seats_used || 0;
              const total = o.seats_total || 0;
              const pct = total > 0 ? Math.round((used / total) * 100) : 0;
              return (
                <div key={o.id} className="flex items-center gap-3">
                  <span className="text-white/70 text-sm w-32 truncate">{o.name}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-white/40 text-xs font-mono w-14 text-right">{used}/{total}</span>
                </div>
              );
            })}
            {orgs.length === 0 && <p className="text-white/30 text-sm text-center py-4">No organizations.</p>}
          </div>
        </div>

        {/* Forecast */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-amber-400" />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">License Forecast (6 months)</h3>
          </div>
          <div className="space-y-2">
            {forecastMonths.map((f) => {
              const pct = f.capacity > 0 ? Math.round((f.seats / f.capacity) * 100) : 0;
              return (
                <div key={f.month} className="flex items-center gap-3">
                  <span className="text-white/40 text-xs w-10">{f.month}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-white/40 text-xs font-mono w-20 text-right">{f.seats}/{f.capacity}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature + Workspace licenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={14} className="text-blue-400" />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Feature Licenses (by plan)</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {planBreakdown.map((p) => (
              <div key={p.plan} className="bg-white/[0.02] rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-white/50 text-xs capitalize">{p.plan}</span>
                <span className="text-white font-bold text-sm">{p.count} · {p.seats} seats</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-teal-400" />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Workspace Licenses</h3>
          </div>
          <div className="space-y-2">
            {wsLicenses.map((w) => (
              <div key={w.ws} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                <span className="text-white/50 text-xs capitalize">{w.ws}</span>
                <span className="text-white font-bold text-sm">{w.assigned} assigned</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}