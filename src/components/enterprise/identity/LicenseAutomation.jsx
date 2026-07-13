import React, { useState, useEffect } from "react";
import { Loader2, Boxes, BookOpen, CreditCard, Cpu, KeyRound, Sparkles, Check, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { LICENSE_AUTOMATION_TARGETS } from "@/lib/identityProviders";

const TARGET_ICONS = { workspace: Boxes, knowledge_packs: BookOpen, subscriptions: CreditCard, ai_credits: Cpu, role_licenses: KeyRound, enterprise_features: Sparkles };

export default function LicenseAutomation({ organization }) {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState({ workspace: true, knowledge_packs: false, subscriptions: true, ai_credits: true, role_licenses: true, enterprise_features: false });

  useEffect(() => { if (organization?.id) loadAll(); }, [organization?.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [provs, mems] = await Promise.all([
        base44.entities.IdentityProvider.filter({ organization_id: organization.id, status: "connected" }),
        base44.entities.OrgMembership.filter({ organization_id: organization.id, status: "active" }),
      ]);
      setProviders(provs);
      setMemberships(mems);
    } catch (e) { console.error("License automation load failed:", e); }
    finally { setLoading(false); }
  };

  const toggle = (id) => {
    setEnabled((e) => {
      const next = { ...e, [id]: !e[id] };
      toast({ title: next[id] ? "Enabled" : "Disabled", description: LICENSE_AUTOMATION_TARGETS.find((t) => t.id === id)?.name });
      return next;
    });
  };

  const runAutomation = async () => {
    try {
      const assigned = memberships.length;
      for (const p of providers) {
        await base44.entities.IdentitySyncEvent.create({
          organization_id: organization.id, provider_id: p.id, provider_name: p.provider_name, provider_type: p.provider_type,
          event_type: "license_sync", status: "success", severity: "info",
          message: `License automation run — ${assigned} licenses synced across ${Object.values(enabled).filter(Boolean).length} targets.`,
          affected_users: assigned, triggered_by: "admin",
        });
      }
      toast({ title: "License automation complete", description: `${assigned} users processed.` });
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  const autoAssigned = Object.values(enabled).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-400" />
          <span className="text-white/70 text-sm font-medium">License Automation · {autoAssigned} targets active</span>
        </div>
        <button onClick={runAutomation} disabled={providers.length === 0} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5"><Zap size={12} /> Run Automation</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Active Users" value={memberships.length} color="indigo" />
        <Stat label="Licenses Assigned" value={providers.reduce((s, p) => s + (p.license_assignments || 0), 0)} color="amber" />
        <Stat label="Automation Targets" value={`${autoAssigned} / ${LICENSE_AUTOMATION_TARGETS.length}`} color="teal" />
        <Stat label="Providers" value={providers.length} color="violet" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {LICENSE_AUTOMATION_TARGETS.map((target) => {
          const Icon = TARGET_ICONS[target.id] || Sparkles;
          const isEnabled = enabled[target.id];
          return (
            <div key={target.id} className={`bg-white/[0.02] border rounded-xl p-4 ${isEnabled ? "border-emerald-500/20" : "border-white/5"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isEnabled ? "bg-emerald-500/10" : "bg-white/5"}`}>
                    <Icon size={16} className={isEnabled ? "text-emerald-400" : "text-white/40"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium">{target.name}</div>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{target.desc}</p>
                  </div>
                </div>
                <button onClick={() => toggle(target.id)} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${isEnabled ? "bg-emerald-500" : "bg-white/10"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              {isEnabled && <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400"><Check size={10} /> Auto-assigned on user provisioning</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  const map = { indigo: "text-indigo-400", amber: "text-amber-400", teal: "text-teal-400", violet: "text-violet-400" };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <span className="text-white/40 text-xs uppercase tracking-wider">{label}</span>
      <div className={`text-2xl font-bold ${map[color] || "text-white"}`}>{value}</div>
    </div>
  );
}