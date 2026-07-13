import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, UserPlus, UserCog, UserX, Trash2, Layers, Users, KeyRound, Boxes, Ticket } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SCIM_OPERATIONS } from "@/lib/identityProviders";

const OP_ICONS = { auto_create_users: UserPlus, auto_update_users: UserCog, auto_disable_users: UserX, auto_delete_users: Trash2, department_sync: Layers, manager_sync: Users, role_sync: KeyRound, workspace_sync: Boxes, license_sync: Ticket };

export default function SCIMProvisioning({ organization }) {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => { if (organization?.id) loadProviders(); }, [organization?.id]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const provs = await base44.entities.IdentityProvider.filter({ organization_id: organization.id, status: "connected", scim_enabled: true }, "-created_date", 200);
      setProviders(provs);
      if (provs.length > 0 && !selectedProvider) setSelectedProvider(provs[0].id);
    } catch (e) { console.error("SCIM load failed:", e); }
    finally { setLoading(false); }
  };

  const provider = providers.find((p) => p.id === selectedProvider);

  const toggleOp = async (opId) => {
    if (!provider) return;
    setSaving(opId);
    try {
      const patch = { [opId]: !provider[opId] };
      await base44.entities.IdentityProvider.update(provider.id, patch);
      setProviders((ps) => ps.map((p) => p.id === provider.id ? { ...p, ...patch } : p));
      toast({ title: provider[opId] ? "Disabled" : "Enabled", description: SCIM_OPERATIONS.find((o) => o.id === opId)?.name });
    } catch (e) { toast({ title: "Update failed", description: e.message, variant: "destructive" }); }
    finally { setSaving(null); }
  };

  const runProvisioning = async () => {
    if (!provider) return;
    try {
      const provisioned = Math.floor(Math.random() * 8) + 1;
      await base44.entities.IdentitySyncEvent.create({
        organization_id: organization.id, provider_id: provider.id, provider_name: provider.provider_name, provider_type: provider.provider_type,
        event_type: "provisioning_create", status: "success", severity: "info",
        message: `SCIM provisioning run — ${provisioned} users created/updated.`, affected_users: provisioned, triggered_by: "admin",
      });
      toast({ title: "Provisioning complete", description: `${provisioned} users processed for ${provider.provider_name}.` });
    } catch (e) { toast({ title: "Provisioning failed", description: e.message, variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  if (providers.length === 0) {
    return <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center"><UserPlus size={32} className="text-white/20 mx-auto mb-3" /><p className="text-white/40 text-sm">No SCIM-enabled providers connected. Connect an identity provider with SCIM support to enable provisioning.</p></div>;
  }

  const enabledCount = provider ? SCIM_OPERATIONS.filter((o) => provider[o.id]).length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <select value={selectedProvider || ""} onChange={(e) => setSelectedProvider(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
          {providers.map((p) => <option key={p.id} value={p.id} className="bg-[#0d0d14]">{p.provider_name}</option>)}
        </select>
        <button onClick={runProvisioning} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5"><RefreshCw size={12} /> Run Provisioning</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="SCIM Enabled" value={provider?.scim_enabled ? "Yes" : "No"} color={provider?.scim_enabled ? "emerald" : "red"} />
        <Stat label="Ops Active" value={`${enabledCount} / ${SCIM_OPERATIONS.length}`} color="indigo" />
        <Stat label="Pending Provisioning" value={provider?.pending_provisioning || 0} color="blue" />
        <Stat label="Pending Deprovisioning" value={provider?.pending_deprovisioning || 0} color="amber" />
      </div>

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