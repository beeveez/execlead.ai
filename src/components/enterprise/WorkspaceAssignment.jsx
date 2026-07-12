import React, { useState, useEffect } from "react";
import { Loader2, Search, Save, X, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ENTERPRISE_WORKSPACES, ENTERPRISE_ROLES, ROLE_BY_ID } from "@/lib/enterpriseRoles";

const ROLE_BADGE = {
  super_admin: "bg-red-500/10 text-red-400",
  platform_admin: "bg-orange-500/10 text-orange-400",
  organization_admin: "bg-indigo-500/10 text-indigo-400",
  department_admin: "bg-blue-500/10 text-blue-400",
  manager: "bg-cyan-500/10 text-cyan-400",
  team_lead: "bg-teal-500/10 text-teal-400",
  coach: "bg-violet-500/10 text-violet-400",
  mentor: "bg-fuchsia-500/10 text-fuchsia-400",
  member: "bg-slate-500/10 text-slate-400",
  guest: "bg-gray-500/10 text-gray-400",
  auditor: "bg-yellow-500/10 text-yellow-400",
  read_only: "bg-zinc-500/10 text-zinc-400",
};

export default function WorkspaceAssignment({ organization }) {
  const { toast } = useToast();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [editWorkspaces, setEditWorkspaces] = useState([]);

  useEffect(() => {
    if (!organization?.id) return;
    load();
  }, [organization?.id]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.OrgMembership.filter({ organization_id: organization.id });
      setMemberships(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = memberships.filter((m) =>
    !search || m.user_name?.toLowerCase().includes(search.toLowerCase()) || m.user_email?.toLowerCase().includes(search.toLowerCase()) || m.role?.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (m) => {
    setEditing(m.id);
    setEditWorkspaces(m.workspaces || []);
  };

  const toggleWs = (wsId) => {
    setEditWorkspaces((prev) => prev.includes(wsId) ? prev.filter((w) => w !== wsId) : [...prev, wsId]);
  };

  const handleSave = async (membershipId) => {
    try {
      await base44.entities.OrgMembership.update(membershipId, { workspaces: editWorkspaces });
      setMemberships((prev) => prev.map((m) => m.id === membershipId ? { ...m, workspaces: editWorkspaces } : m));
      setEditing(null);
      toast({ title: "Workspaces assigned", description: `${editWorkspaces.length} workspace(s) assigned.` });
    } catch (e) {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Members list */}
      <div className="space-y-1.5">
        {filtered.map((m) => {
          const role = ROLE_BY_ID[m.role] || { name: m.role, color: ROLE_BADGE[m.role] || ROLE_BADGE.member };
          const isEditing = editing === m.id;
          return (
            <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                  {m.user_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">{m.user_name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${ROLE_BADGE[m.role] || ROLE_BADGE.member}`}>{role.name}</span>
                  </div>
                  <div className="text-white/30 text-xs truncate">{m.user_email || "—"} · {m.department_name || "Unassigned"}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(m.workspaces || []).map((ws) => (
                    <span key={ws} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs">{ws}</span>
                  ))}
                  {!isEditing && (m.workspaces || []).length === 0 && <span className="text-white/20 text-xs">No workspaces</span>}
                </div>
                {!isEditing ? (
                  <button onClick={() => startEdit(m)} className="text-white/30 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5">Edit</button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleSave(m.id)} className="text-emerald-400 hover:text-emerald-300 p-1"><Save size={14} /></button>
                    <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white p-1"><X size={14} /></button>
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Assign Workspaces</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ENTERPRISE_WORKSPACES.map((ws) => {
                      const active = editWorkspaces.includes(ws.id);
                      return (
                        <button
                          key={ws.id}
                          onClick={() => toggleWs(ws.id)}
                          className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${active ? "bg-indigo-600 text-white border-indigo-500" : "bg-white/5 text-white/40 border-white/10 hover:text-white/70"}`}
                        >
                          {active && <ShieldCheck size={10} className="inline mr-1" />}{ws.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-white/30 text-sm">{search ? "No members match your search." : "No members yet. Seed organization data to populate."}</p>
          </div>
        )}
      </div>
    </div>
  );
}