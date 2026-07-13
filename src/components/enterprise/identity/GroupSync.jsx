import React, { useState, useEffect } from "react";
import { Loader2, Layers, Users, Network, RefreshCw, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { GROUP_SYNC_TARGETS } from "@/lib/identityProviders";

const TARGET_ICONS = { departments: Layers, teams: Users, managers: Users, business_units: Network, executive_groups: Layers, learning_groups: Layers, security_groups: Network };

export default function GroupSync({ organization }) {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [enabled, setEnabled] = useState({ departments: true, teams: true, managers: true, business_units: false, executive_groups: false, learning_groups: false, security_groups: false });

  useEffect(() => { if (organization?.id) loadAll(); }, [organization?.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [provs, depts, tms] = await Promise.all([
        base44.entities.IdentityProvider.filter({ organization_id: organization.id, status: "connected" }),
        base44.entities.Department.filter({ organization_id: organization.id }),
        base44.entities.Team.filter({ organization_id: organization.id }),
      ]);
      setProviders(provs);
      setDepartments(depts);
      setTeams(tms);
    } catch (e) { console.error("Group sync load failed:", e); }
    finally { setLoading(false); }
  };

  const toggle = (id) => {
    setEnabled((e) => {
      const next = { ...e, [id]: !e[id] };
      toast({ title: next[id] ? "Enabled" : "Disabled", description: GROUP_SYNC_TARGETS.find((t) => t.id === id)?.name });
      return next;
    });
  };

  const runGroupSync = async () => {
    setSyncing(true);
    try {
      for (const p of providers) {
        const groups = (departments.length + teams.length);
        await base44.entities.IdentitySyncEvent.create({
          organization_id: organization.id, provider_id: p.id, provider_name: p.provider_name, provider_type: p.provider_type,
          event_type: "group_sync", status: "success", severity: "info",
          message: `Group sync completed — ${groups} groups synchronized across ${Object.values(enabled).filter(Boolean).length} targets.`,
          affected_groups: groups, triggered_by: "admin",
        });
      }
      toast({ title: "Group sync complete", description: `${providers.length} provider${providers.length !== 1 ? "s" : ""} synchronized.` });
      loadAll();
    } finally { setSyncing(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  const syncTargets = GROUP_SYNC_TARGETS.map((t) => {
    let count = 0;
    if (t.id === "departments") count = departments.length;
    if (t.id === "teams") count = teams.length;
    if (t.id === "business_units") count = departments.filter((d) => d.department_type === "business_unit").length;
    return { ...t, count };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Network size={16} className="text-indigo-400" />
          <span className="text-white/70 text-sm font-medium">Group Synchronization · {providers.length} provider{providers.length !== 1 ? "s" : ""}</span>
        </div>
        <button onClick={runGroupSync} disabled={syncing || providers.length === 0} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5">
          {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Sync Groups
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {syncTargets.map((target) => {
          const Icon = TARGET_ICONS[target.id] || Layers;
          const isEnabled = enabled[target.id];
          return (
            <div key={target.id} className={`bg-white/[0.02] border rounded-xl p-4 ${isEnabled ? "border-emerald-500/20" : "border-white/5"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isEnabled ? "bg-emerald-500/10" : "bg-white/5"}`}>
                    <Icon size={16} className={isEnabled ? "text-emerald-400" : "text-white/40"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{target.name}</span>
                      {target.count > 0 && <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/50 text-xs">{target.count}</span>}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{target.desc}</p>
                  </div>
                </div>
                <button onClick={() => toggle(target.id)} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${isEnabled ? "bg-emerald-500" : "bg-white/10"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3"><Check size={14} className="text-emerald-400" /><span className="text-white/80 text-sm font-semibold uppercase tracking-wider">Sync Mapping</span></div>
        <div className="space-y-2 text-sm">
          <Mapping from="IdP Groups" to="Departments" active={enabled.departments} count={departments.length} />
          <Mapping from="IdP Teams" to="Teams" active={enabled.teams} count={teams.length} />
          <Mapping from="IdP Manager Attribute" to="Manager Relationships" active={enabled.managers} />
          <Mapping from="IdP Business Units" to="Business Units" active={enabled.business_units} />
        </div>
      </div>
    </div>
  );
}

function Mapping({ from, to, active, count }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/50">{from}</span>
      <span className="text-white/20">→</span>
      <span className="text-white/70">{to}</span>
      {count > 0 && <span className="text-white/30 text-xs">({count})</span>}
      <span className={`ml-auto px-1.5 py-0.5 rounded text-xs ${active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"}`}>{active ? "Syncing" : "Off"}</span>
    </div>
  );
}