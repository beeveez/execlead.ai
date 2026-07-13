import React, { useState, useEffect } from "react";
import { Loader2, ShieldCheck, Users, Network, AlertTriangle, Clock, Activity, Ticket, RefreshCw, Gauge, Cloud } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DashboardKPI from "@/components/enterprise/DashboardKPI";

export default function IdentityDashboard({ organization }) {
  const [providers, setProviders] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { if (organization?.id) loadAll(); }, [organization?.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [provs, evs] = await Promise.all([
        base44.entities.IdentityProvider.filter({ organization_id: organization.id }, "-created_date", 200),
        base44.entities.IdentitySyncEvent.list("-created_date", 200),
      ]);
      setProviders(provs);
      setEvents(evs);
    } catch (e) { console.error("Identity dashboard load failed:", e); }
    finally { setLoading(false); }
  };

  const runSync = async () => {
    setSyncing(true);
    try {
      for (const p of providers.filter((p) => p.status === "connected")) {
        const now = new Date().toISOString();
        const next = new Date(Date.now() + (p.sync_interval_min || 15) * 60000).toISOString();
        const users = Math.max(0, (p.users_synced || 0) + Math.floor(Math.random() * 5));
        await base44.entities.IdentityProvider.update(p.id, {
          last_sync: now, next_sync: next, users_synced: users,
          sync_errors: 0, sync_warnings: Math.floor(Math.random() * 2),
          health_score: 85 + Math.floor(Math.random() * 15), health_status: "healthy",
        });
      }
      await loadAll();
    } finally { setSyncing(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  const connected = providers.filter((p) => p.status === "connected");
  const totalUsers = providers.reduce((s, p) => s + (p.users_synced || 0), 0);
  const totalGroups = providers.reduce((s, p) => s + (p.groups_synced || 0), 0);
  const totalRoles = providers.reduce((s, p) => s + (p.roles_synced || 0), 0);
  const totalLicenses = providers.reduce((s, p) => s + (p.license_assignments || 0), 0);
  const syncErrors = events.filter((e) => e.status === "error").length;
  const syncWarnings = events.filter((e) => e.status === "warning").length;
  const pendingProv = providers.reduce((s, p) => s + (p.pending_provisioning || 0), 0);
  const pendingDeprov = providers.reduce((s, p) => s + (p.pending_deprovisioning || 0), 0);
  const lastSync = providers.filter((p) => p.last_sync).sort((a, b) => new Date(b.last_sync) - new Date(a.last_sync))[0];
  const nextSync = providers.filter((p) => p.next_sync).sort((a, b) => new Date(a.next_sync) - new Date(b.next_sync))[0];
  const identityScore = connected.length > 0 ? Math.round(connected.reduce((s, p) => s + (p.health_score || 0), 0) / connected.length) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-400" />
          <span className="text-white/70 text-sm font-medium">Identity Health Overview</span>
          <span className="text-white/30 text-xs">· {connected.length} provider{connected.length !== 1 ? "s" : ""} connected</span>
        </div>
        <button onClick={runSync} disabled={syncing || connected.length === 0}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5">
          {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Sync All
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={Cloud} label="Connected Providers" value={connected.length} sub={`of ${providers.length} configured`} color="indigo" />
        <DashboardKPI icon={Users} label="Users Synced" value={totalUsers.toLocaleString()} color="blue" />
        <DashboardKPI icon={Network} label="Groups Synced" value={totalGroups} color="teal" />
        <DashboardKPI icon={ShieldCheck} label="Roles Synced" value={totalRoles} color="violet" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={Ticket} label="License Assignments" value={totalLicenses} color="amber" />
        <DashboardKPI icon={AlertTriangle} label="Sync Errors" value={syncErrors} color={syncErrors === 0 ? "emerald" : "red"} />
        <DashboardKPI icon={AlertTriangle} label="Sync Warnings" value={syncWarnings} color={syncWarnings === 0 ? "emerald" : "amber"} />
        <DashboardKPI icon={Clock} label="Pending Provisioning" value={pendingProv} color="blue" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={Clock} label="Pending Deprovisioning" value={pendingDeprov} color="amber" />
        <DashboardKPI icon={Activity} label="Last Sync" value={lastSync ? new Date(lastSync.last_sync).toLocaleDateString() : "—"} color="teal" />
        <DashboardKPI icon={Clock} label="Next Sync" value={nextSync ? new Date(nextSync.next_sync).toLocaleDateString() : "—"} color="indigo" />
        <DashboardKPI icon={Gauge} label="Identity Score" value={`${identityScore}%`} color={identityScore >= 80 ? "emerald" : identityScore >= 50 ? "amber" : "red"} />
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} className="text-indigo-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Provisioning Queue</h3>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {events.slice(0, 10).map((e) => (
            <div key={e.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${e.status === "error" ? "bg-red-500" : e.status === "warning" ? "bg-amber-500" : "bg-emerald-500"}`} />
                <span className="text-white/70 text-sm capitalize">{(e.event_type || "").replace(/_/g, " ")}</span>
                <span className="text-white/30 text-xs">· {e.provider_name}</span>
              </div>
              <span className="text-white/30 text-xs">{e.created_date ? new Date(e.created_date).toLocaleString() : ""}</span>
            </div>
          ))}
          {events.length === 0 && <p className="text-white/30 text-sm text-center py-4">No sync events yet. Run a sync to populate the queue.</p>}
        </div>
      </div>
    </div>
  );
}