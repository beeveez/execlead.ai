import React, { useState, useEffect } from "react";
import { Loader2, Check, X, Building2, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { ENTERPRISE_WORKSPACES } from "@/lib/enterpriseRoles";

const WS_ICONS = {
  Briefcase: Building2,
  Code: Building2,
  Building2: Building2,
  GraduationCap: Building2,
  Settings: Building2,
  ShieldCheck: ShieldCheck,
  Lock: ShieldCheck,
  BarChart3: Building2,
};

export default function WorkspaceManagementTab({ organization }) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    if (!organization) return;
    setEnabled(organization.workspaces_enabled || []);
    setLoading(false);
  }, [organization]);

  const handleToggle = async (wsId) => {
    setToggling(wsId);
    const newEnabled = enabled.includes(wsId) ? enabled.filter((w) => w !== wsId) : [...enabled, wsId];
    try {
      await base44.entities.Organization.update(organization.id, { workspaces_enabled: newEnabled });
      setEnabled(newEnabled);
      toast({
        title: newEnabled.includes(wsId) ? "Workspace enabled" : "Workspace disabled",
        description: ENTERPRISE_WORKSPACES.find((w) => w.id === wsId)?.name,
      });
    } catch (e) {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  const activeCount = enabled.length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Building2 size={14} className="text-indigo-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Total Workspaces</span></div>
          <div className="text-white text-2xl font-bold">{ENTERPRISE_WORKSPACES.length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Check size={14} className="text-emerald-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Enabled</span></div>
          <div className="text-white text-2xl font-bold">{activeCount}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><X size={14} className="text-white/40" /><span className="text-white/40 text-xs uppercase tracking-wider">Disabled</span></div>
          <div className="text-white text-2xl font-bold">{ENTERPRISE_WORKSPACES.length - activeCount}</div>
        </div>
      </div>

      {/* Workspace grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ENTERPRISE_WORKSPACES.map((ws) => {
          const isEnabled = enabled.includes(ws.id);
          const Icon = WS_ICONS[ws.icon] || Building2;
          return (
            <div key={ws.id} className={`rounded-xl p-4 border transition-colors ${isEnabled ? "bg-indigo-500/5 border-indigo-500/20" : "bg-white/[0.02] border-white/5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isEnabled ? "bg-indigo-500/10" : "bg-white/5"}`}>
                    <Icon size={18} className={isEnabled ? "text-indigo-400" : "text-white/30"} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium">{ws.name}</div>
                    <div className="text-white/40 text-xs mt-0.5">{ws.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(ws.id)}
                  disabled={toggling === ws.id}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isEnabled ? "bg-indigo-600" : "bg-white/10"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs">
                <span className={isEnabled ? "text-emerald-400" : "text-white/30"}>{isEnabled ? "Enabled" : "Disabled"}</span>
                {isEnabled && <span className="text-white/30">· Assignable to roles</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}