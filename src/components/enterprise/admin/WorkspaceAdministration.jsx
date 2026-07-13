import React, { useState, useEffect } from "react";
import { Boxes, Loader2, Power, PowerOff, Users, Activity } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { ENTERPRISE_WORKSPACES } from "@/lib/enterpriseRoles";

export default function WorkspaceAdministration({ organization, onUpdate }) {
  const { toast } = useToast();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    if (organization?.id) loadMembers();
  }, [organization?.id]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const mems = await base44.entities.OrgMembership.filter({ organization_id: organization.id, status: "active" });
      setMemberships(mems);
    } catch (e) {
      console.error("Workspace admin load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const enabled = organization?.workspaces_enabled || [];
  const available = ENTERPRISE_WORKSPACES.map((ws) => ({
    ...ws,
    enabled: enabled.includes(ws.id),
    users: memberships.filter((m) => m.workspaces?.includes(ws.id)).length,
  }));

  const toggle = async (wsId, enable) => {
    setSaving(wsId);
    try {
      const next = enable ? [...enabled, wsId] : enabled.filter((w) => w !== wsId);
      await base44.entities.Organization.update(organization.id, { workspaces_enabled: next });
      toast({ title: enable ? "Workspace enabled" : "Workspace disabled", description: ENTERPRISE_WORKSPACES.find((w) => w.id === wsId)?.name });
      onUpdate?.();
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Boxes size={14} className="text-indigo-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Total</span></div>
          <div className="text-white text-2xl font-bold">{ENTERPRISE_WORKSPACES.length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Power size={14} className="text-emerald-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Enabled</span></div>
          <div className="text-white text-2xl font-bold">{available.filter((w) => w.enabled).length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><PowerOff size={14} className="text-red-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Disabled</span></div>
          <div className="text-white text-2xl font-bold">{available.filter((w) => !w.enabled).length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-teal-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Assigned Users</span></div>
          <div className="text-white text-2xl font-bold">{available.reduce((s, w) => s + w.users, 0)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {available.map((ws) => (
          <div key={ws.id} className={`bg-white/[0.02] border rounded-xl p-4 ${ws.enabled ? "border-emerald-500/20" : "border-white/5"}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">{ws.name}</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs border ${ws.enabled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {ws.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <p className="text-white/40 text-xs mt-1">{ws.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-white/50">
                  <Users size={11} /> {ws.users} users assigned
                </div>
              </div>
              <button
                disabled={saving === ws.id}
                onClick={() => toggle(ws.id, !ws.enabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${ws.enabled ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}`}
              >
                {saving === ws.id ? "..." : ws.enabled ? "Disable" : "Enable"}
              </button>
            </div>
            {ws.enabled && ws.users > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1 text-xs text-white/40 mb-1"><Activity size={10} /> Adoption</div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, (ws.users / Math.max(1, memberships.length)) * 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}