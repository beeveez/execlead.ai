import React, { useState, useEffect } from "react";
import { Loader2, Cloud, Check, Plus, Power, PowerOff, RefreshCw, Users, Network, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { IDENTITY_PROVIDER_CATALOG, PROVIDER_BY_TYPE } from "@/lib/identityProviders";

export default function IdentityProviders({ organization }) {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => { if (organization?.id) loadProviders(); }, [organization?.id]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const provs = await base44.entities.IdentityProvider.filter({ organization_id: organization.id }, "-created_date", 200);
      setProviders(provs);
    } catch (e) { console.error("Providers load failed:", e); }
    finally { setLoading(false); }
  };

  const connectedTypes = new Set(providers.map((p) => p.provider_type));
  const available = IDENTITY_PROVIDER_CATALOG.filter((p) => !connectedTypes.has(p.type));

  const connect = async (cat) => {
    setConnecting(cat.type);
    try {
      const now = new Date().toISOString();
      const next = new Date(Date.now() + 15 * 60000).toISOString();
      const users = 50 + Math.floor(Math.random() * 200);
      const groups = 5 + Math.floor(Math.random() * 15);
      await base44.entities.IdentityProvider.create({
        organization_id: organization.id,
        organization_name: organization.name,
        provider_type: cat.type,
        provider_name: cat.name,
        category: cat.category,
        status: "connected",
        protocols: cat.protocols,
        tenant_id: `${cat.type}-tenant-${Date.now().toString(36)}`,
        domain: organization.domain || "",
        users_synced: users,
        groups_synced: groups,
        roles_synced: Math.floor(groups / 2),
        license_assignments: Math.floor(users * 0.8),
        last_sync: now,
        next_sync: next,
        sync_interval_min: 15,
        health_score: 90 + Math.floor(Math.random() * 10),
        health_status: "healthy",
        scim_enabled: cat.protocols.includes("SCIM"),
        sso_enabled: true,
        provisioning_enabled: true,
        auto_create_users: true,
        auto_update_users: true,
        auto_disable_users: true,
        auto_delete_users: false,
        department_sync: true,
        manager_sync: true,
        role_sync: true,
        sync_errors: 0,
        sync_warnings: 0,
        pending_provisioning: Math.floor(Math.random() * 5),
        pending_deprovisioning: Math.floor(Math.random() * 3),
        connected_by_name: "Admin",
      });
      await base44.entities.IdentitySyncEvent.create({
        organization_id: organization.id,
        provider_name: cat.name,
        provider_type: cat.type,
        event_type: "sync_complete",
        status: "success",
        severity: "info",
        message: `${cat.name} connected and initial sync completed — ${users} users, ${groups} groups.`,
        affected_users: users,
        affected_groups: groups,
        triggered_by: "admin",
      });
      toast({ title: "Provider connected", description: `${cat.name} is now syncing.` });
      loadProviders();
    } catch (e) {
      toast({ title: "Connection failed", description: e.message, variant: "destructive" });
    } finally { setConnecting(null); }
  };

  const disconnect = async (provider) => {
    try {
      await base44.entities.IdentityProvider.update(provider.id, { status: "disconnected", sso_enabled: false, provisioning_enabled: false });
      toast({ title: "Provider disconnected", description: provider.provider_name });
      loadProviders();
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  const runSync = async (provider) => {
    try {
      const now = new Date().toISOString();
      const next = new Date(Date.now() + (provider.sync_interval_min || 15) * 60000).toISOString();
      const users = Math.max(0, (provider.users_synced || 0) + Math.floor(Math.random() * 6) - 1);
      await base44.entities.IdentityProvider.update(provider.id, { last_sync: now, next_sync: next, users_synced: users, health_status: "healthy", health_score: 88 + Math.floor(Math.random() * 12) });
      await base44.entities.IdentitySyncEvent.create({
        organization_id: organization.id, provider_id: provider.id, provider_name: provider.provider_name, provider_type: provider.provider_type,
        event_type: "sync_complete", status: "success", severity: "info",
        message: `Manual sync completed — ${users} users synchronized.`, affected_users: users, triggered_by: "admin",
      });
      toast({ title: "Sync complete", description: provider.provider_name });
      loadProviders();
    } catch (e) { toast({ title: "Sync failed", description: e.message, variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  return (
    <div className="space-y-4">
      {/* Connected providers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Cloud size={14} className="text-indigo-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Connected Providers ({providers.length})</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {providers.map((p) => {
            const cat = PROVIDER_BY_TYPE[p.provider_type] || {};
            const Icon = cat.icon || Cloud;
            return (
              <div key={p.id} className={`bg-white/[0.02] border rounded-xl p-4 ${p.status === "connected" ? "border-emerald-500/20" : "border-white/5"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color || "#6366f1"}20`, border: `1px solid ${cat.color || "#6366f1"}40` }}>
                      <Icon size={18} style={{ color: cat.color || "#6366f1" }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{p.provider_name}</span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="text-white/30 text-xs">{p.tenant_id} · {p.protocols?.join(" · ")}</div>
                    </div>
                  </div>
                  <HealthBadge status={p.health_status} score={p.health_score} />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <Metric icon={Users} label="Users" value={p.users_synced || 0} />
                  <Metric icon={Network} label="Groups" value={p.groups_synced || 0} />
                  <Metric icon={AlertTriangle} label="Errors" value={p.sync_errors || 0} />
                </div>
                <div className="text-white/30 text-xs mb-3">
                  Last sync: {p.last_sync ? new Date(p.last_sync).toLocaleString() : "Never"} · Next: {p.next_sync ? new Date(p.next_sync).toLocaleString() : "—"}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => runSync(p)} disabled={p.status !== "connected"} className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-30">
                    <RefreshCw size={12} /> Sync
                  </button>
                  <button onClick={() => setSelected(p)} className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium">Configure</button>
                  {p.status === "connected" ? (
                    <button onClick={() => disconnect(p)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1.5"><PowerOff size={12} /> Disconnect</button>
                  ) : (
                    <button onClick={() => connect(PROVIDER_BY_TYPE[p.provider_type])} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5"><Power size={12} /> Connect</button>
                  )}
                </div>
              </div>
            );
          })}
          {providers.length === 0 && <div className="md:col-span-2 text-center text-white/30 text-sm py-8">No providers connected yet. Connect one below.</div>}
        </div>
      </div>

      {/* Available providers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Plus size={14} className="text-indigo-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Available Providers ({available.length})</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {available.map((cat) => {
            const Icon = cat.icon;
            return (
              <button key={cat.type} onClick={() => connect(cat)} disabled={connecting === cat.type}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-indigo-500/20 transition-colors text-left disabled:opacity-50">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${cat.color}20` }}>
                  {connecting === cat.type ? <Loader2 size={16} className="animate-spin text-white/60" /> : <Icon size={16} style={{ color: cat.color }} />}
                </div>
                <div className="text-white text-sm font-medium mb-0.5">{cat.name}</div>
                <div className="text-white/30 text-xs">{cat.protocols.join(" · ")}</div>
              </button>
            );
          })}
          {available.length === 0 && <div className="col-span-full text-center text-white/30 text-sm py-4">All available providers are connected.</div>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-medium mb-3">{selected.provider_name} Configuration</h3>
            <div className="space-y-2 text-sm">
              <Row label="Tenant ID" value={selected.tenant_id} />
              <Row label="Domain" value={selected.domain || "—"} />
              <Row label="Protocols" value={selected.protocols?.join(", ")} />
              <Row label="SCIM" value={selected.scim_enabled ? "Enabled" : "Disabled"} />
              <Row label="SSO" value={selected.sso_enabled ? "Enabled" : "Disabled"} />
              <Row label="Sync Interval" value={`${selected.sync_interval_min || 15} min`} />
              <Row label="Health" value={`${selected.health_score || 0}% (${selected.health_status})`} />
            </div>
            <button onClick={() => setSelected(null)} className="w-full mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { connected: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", disconnected: "bg-red-500/10 text-red-400 border-red-500/20", error: "bg-red-500/10 text-red-400 border-red-500/20", pending: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
  return <span className={`px-2 py-0.5 rounded-md text-xs border capitalize ${map[status] || map.pending}`}>{status}</span>;
}

function HealthBadge({ status, score }) {
  const map = { healthy: "text-emerald-400", warning: "text-amber-400", critical: "text-red-400", unknown: "text-white/30" };
  return <span className={`text-sm font-bold ${map[status] || map.unknown}`}>{score || 0}%</span>;
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/[0.02] rounded-lg px-2 py-1.5">
      <div className="flex items-center gap-1 text-white/30 text-xs"><Icon size={10} /> {label}</div>
      <div className="text-white font-bold text-sm">{value}</div>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><span className="text-white/40">{label}</span><span className="text-white/70 text-right">{value}</span></div>;
}