import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, UserPlus, UserCog, UserX, Trash2, Layers, Users, KeyRound, Boxes, Ticket, Server, Activity, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SCIM_OPERATIONS } from "@/lib/identityProviders";
import SCIMEndpointConfig from "@/components/enterprise/identity/SCIMEndpointConfig";
import SCIMSyncEventLog from "@/components/enterprise/identity/SCIMSyncEventLog";
import SCIMDeprovisioningQueue from "@/components/enterprise/identity/SCIMDeprovisioningQueue";

const OP_ICONS = { auto_create_users: UserPlus, auto_update_users: UserCog, auto_disable_users: UserX, auto_delete_users: Trash2, department_sync: Layers, manager_sync: Users, role_sync: KeyRound, workspace_sync: Boxes, license_sync: Ticket };

const SECTIONS = [
  { id: "endpoint", label: "Endpoint & Token", icon: Server },
  { id: "operations", label: "Provisioning Operations", icon: Activity },
  { id: "events", label: "Sync Events", icon: Clock },
  { id: "deprovisioning", label: "Deprovisioning Queue", icon: UserX },
];

export default function SCIMProvisioning({ organization }) {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [section, setSection] = useState("endpoint");

  useEffect(() => { if (organization?.id) loadProviders(); }, [organization?.id]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const provs = await base44.entities.IdentityProvider.filter({ organization_id: organization.id, status: "connected" }, "-created_date", 200);
      setProviders(provs);
      if (provs.length > 0 && !selectedProvider) setSelectedProvider(provs[0].id);
    } catch (e) { console.error("SCIM load failed:", e); }
    finally { setLoading(false); }
  };

  const provider = providers.find((p) => p.id === selectedProvider);

  const updateProvider = (updated) => {
    setProviders((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
  };

  const toggleOp = async (opId) => {
    if (!provider) return;
    setSaving(opId);
    try {
      const patch = { [opId]: !provider[opId] };
      await base44.entities.IdentityProvider.update(provider.id, patch);
      updateProvider({ ...provider, ...patch });
      toast({ title: provider[opId] ? "Disabled" : "Enabled", description: SCIM_OPERATIONS.find((o) => o.id === opId)?.name });
    } catch (e) { toast({ title: "Update failed", description: e.message, variant: "destructive" }); }
    finally { setSaving(null); }
  };

  const toggleScim = async () => {
    if (!provider) return;
    setSaving("scim");
    try {
      const patch = { scim_enabled: !provider.scim_enabled };
      await base44.entities.IdentityProvider.update(provider.id, patch);
      updateProvider({ ...provider, ...patch });
      toast({ title: provider.scim_enabled ? "SCIM disabled" : "SCIM enabled", description: provider.provider_name });
    } catch (e) { toast({ title: "Update failed", description: e.message, variant: "destructive" }); }
    finally { setSaving(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  if (providers.length === 0) {
    return <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center"><UserPlus size={32} className="text-white/20 mx-auto mb-3" /><p className="text-white/40 text-sm">No identity providers connected. Connect an identity provider with SCIM support to enable automated provisioning.</p></div>;
  }

  const enabledCount = provider ? SCIM_OPERATIONS.filter((o) => provider[o.id]).length : 0;

  return (
    <div className="space-y-4">
      {/* Provider selector + SCIM toggle */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <select value={selectedProvider || ""} onChange={(e) => setSelectedProvider(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
          {providers.map((p) => <option key={p.id} value={p.id} className="bg-[#0d0d14]">{p.provider_name}</option>)}
        </select>
        <button onClick={toggleScim} disabled={saving === "scim"} className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${provider?.scim_enabled ? "bg-emerald-500" : "bg-white/10"}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${provider?.scim_enabled ? "translate-x-6" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="SCIM Enabled" value={provider?.scim_enabled ? "Yes" : "No"} color={provider?.scim_enabled ? "emerald" : "red"} />
        <Stat label="Users Synced" value={provider?.users_synced || 0} color="indigo" />
        <Stat label="Groups Synced" value={provider?.groups_synced || 0} color="blue" />
        <Stat label="Ops Active" value={`${enabledCount} / ${SCIM_OPERATIONS.length}`} color="indigo" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Pending Provisioning" value={provider?.pending_provisioning || 0} color="amber" />
        <Stat label="Pending Deprovisioning" value={provider?.pending_deprovisioning || 0} color="red" />
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-white/[0.02] border border-white/5 rounded-xl p-1 overflow-x-auto">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSection(s.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${section === s.id ? "bg-indigo-500/10 text-indigo-400" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}>
            <s.icon size={12} /> {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      {section === "endpoint" && provider && <SCIMEndpointConfig provider={provider} onUpdate={updateProvider} />}
      {section === "operations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SCIM_OPERATIONS.map((op) => {
            const Icon = OP_ICONS[op.id] || UserCog;
            const enabled = provider?.[op.id];
            return (
              <div key={op.id} className={`bg-white/[0.02] border rounded-xl p-4 ${enabled ? "border-emerald-500/20" : "border-white/5"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${enabled ? "bg-emerald-500/10" : "bg-white/5"}`}>
                      <Icon size={16} className={enabled ? "text-emerald-400" : "text-white/40"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">{op.name}</div>
                      <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{op.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleOp(op.id)} disabled={saving === op.id} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 disabled:opacity-50 ${enabled ? "bg-emerald-500" : "bg-white/10"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {section === "events" && provider && <SCIMSyncEventLog provider={provider} />}
      {section === "deprovisioning" && organization && <SCIMDeprovisioningQueue organization={organization} />}
    </div>
  );
}

function Stat({ label, value, color }) {
  const map = { indigo: "text-indigo-400", blue: "text-blue-400", emerald: "text-emerald-400", amber: "text-amber-400", red: "text-red-400" };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <span className="text-white/40 text-xs uppercase tracking-wider">{label}</span>
      <div className={`text-2xl font-bold ${map[color] || "text-white"}`}>{value}</div>
    </div>
  );
}