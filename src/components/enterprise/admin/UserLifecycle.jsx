import React, { useState, useEffect } from "react";
import {
  Users, Loader2, Search, UserPlus, UserCheck, UserX, RotateCcw, Trash2, ArrowLeftRight, KeyRound, Shield, Mail,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { ENTERPRISE_ROLES } from "@/lib/enterpriseRoles";

const STATUS_OPTIONS = ["active", "suspended", "pending", "deactivated"];

export default function UserLifecycle({ organization }) {
  const { toast } = useToast();
  const [memberships, setMemberships] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [actionUser, setActionUser] = useState(null);
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    if (organization?.id) loadAll();
  }, [organization?.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [mems, depts, tms] = await Promise.all([
        base44.entities.OrgMembership.filter({ organization_id: organization.id }, "-created_date", 500),
        base44.entities.Department.filter({ organization_id: organization.id }),
        base44.entities.Team.filter({ organization_id: organization.id }),
      ]);
      setMemberships(mems);
      setDepartments(depts);
      setTeams(tms);
    } catch (e) {
      console.error("User lifecycle load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = memberships.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (m.user_name || "").toLowerCase().includes(q) || (m.user_email || "").toLowerCase().includes(q) || (m.job_title || "").toLowerCase().includes(q);
    }
    return true;
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await base44.users.inviteUser(inviteEmail, "user");
      await base44.entities.OrgMembership.create({
        organization_id: organization.id,
        organization_name: organization.name,
        user_email: inviteEmail,
        user_name: inviteEmail.split("@")[0],
        role: inviteRole,
        status: "pending",
        joined_date: new Date().toISOString().split("T")[0],
      });
      toast({ title: "Invite sent", description: `${inviteEmail} invited as ${inviteRole}.` });
      setInviteEmail("");
      loadAll();
    } catch (e) {
      toast({ title: "Invite failed", description: e.message, variant: "destructive" });
    }
  };

  const updateMember = async (member, patch, label) => {
    try {
      await base44.entities.OrgMembership.update(member.id, patch);
      toast({ title: label, description: `${member.user_name} → ${Object.values(patch).join(", ")}` });
      setActionUser(null);
      loadAll();
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  const loadAudit = async (member) => {
    setActionUser({ ...member, _mode: "audit", _loading: true });
    try {
      const logs = await base44.entities.SubscriptionAuditLog.filter({ user_id: member.user_id }, "-created_date", 20);
      setActionUser({ ...member, _mode: "audit", _loading: false, _logs: logs });
    } catch {
      setActionUser({ ...member, _mode: "audit", _loading: false, _logs: [] });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  return (
    <div className="space-y-4">
      {/* Invite bar */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={14} className="text-indigo-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Invite User</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@company.com"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500" />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
            {ENTERPRISE_ROLES.map((r) => <option key={r.id} value={r.id} className="bg-[#0d0d14]">{r.name}</option>)}
          </select>
          <button onClick={handleInvite} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center gap-2">
            <Mail size={14} /> Send Invite
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-9 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
          <option value="all" className="bg-[#0d0d14]">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#0d0d14]">{s}</option>)}
        </select>
      </div>

      {/* User table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Department</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="text-white/80 font-medium">{m.user_name}</div>
                    <div className="text-white/30 text-xs">{m.user_email}</div>
                  </td>
                  <td className="px-4 py-3"><span className="text-white/60 capitalize">{(m.role || "member").replace(/_/g, " ")}</span></td>
                  <td className="px-4 py-3 text-white/50">{m.department_name || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {m.status === "active" ? (
                        <ActionBtn icon={UserX} title="Suspend" color="amber" onClick={() => updateMember(m, { status: "suspended" }, "User suspended")} />
                      ) : (
                        <ActionBtn icon={UserCheck} title="Activate" color="emerald" onClick={() => updateMember(m, { status: "active" }, "User activated")} />
                      )}
                      <ActionBtn icon={KeyRound} title="Assign Role" color="indigo" onClick={() => setActionUser({ ...m, _mode: "role" })} />
                      <ActionBtn icon={ArrowLeftRight} title="Transfer" color="blue" onClick={() => setActionUser({ ...m, _mode: "transfer" })} />
                      <ActionBtn icon={Shield} title="Audit History" color="violet" onClick={() => loadAudit(m)} />
                      <ActionBtn icon={Trash2} title="Remove" color="red" onClick={() => { if (confirm(`Remove ${m.user_name}?`)) updateMember(m, { status: "deactivated" }, "User deactivated"); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-white/30 py-8">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action modal */}
      {actionUser && (
        <ActionModal member={actionUser} departments={departments} teams={teams} onClose={() => setActionUser(null)}
          onApply={(patch, label) => updateMember(actionUser, patch, label)} />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    suspended: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    pending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    deactivated: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return <span className={`px-2 py-0.5 rounded-md text-xs border capitalize ${map[status] || map.active}`}>{status}</span>;
}

function ActionBtn({ icon: Icon, title, color, onClick }) {
  const map = {
    indigo: "hover:bg-indigo-500/10 text-indigo-400", emerald: "hover:bg-emerald-500/10 text-emerald-400",
    amber: "hover:bg-amber-500/10 text-amber-400", red: "hover:bg-red-500/10 text-red-400",
    blue: "hover:bg-blue-500/10 text-blue-400", violet: "hover:bg-violet-500/10 text-violet-400",
  };
  return (
    <button title={title} onClick={onClick} className={`p-1.5 rounded-md text-white/40 ${map[color]}`}>
      <Icon size={14} />
    </button>
  );
}

function ActionModal({ member, departments, teams, onClose, onApply }) {
  const [role, setRole] = useState(member.role || "member");
  const [deptId, setDeptId] = useState(member.department_id || "");
  const [teamId, setTeamId] = useState(member.team_id || "");
  const [manager, setManager] = useState(member.manager_name || "");

  const apply = () => {
    if (member._mode === "role") onApply({ role }, "Role updated");
    if (member._mode === "transfer") {
      const dept = departments.find((d) => d.id === deptId);
      const team = teams.find((t) => t.id === teamId);
      onApply({ department_id: deptId, department_name: dept?.name || "", team_id: teamId, team_name: team?.name || "", manager_name: manager }, "User transferred");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-white font-medium mb-4 capitalize">{member._mode} · {member.user_name}</h3>
        {member._mode === "role" && (
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
            {ENTERPRISE_ROLES.map((r) => <option key={r.id} value={r.id} className="bg-[#0d0d14]">{r.name}</option>)}
          </select>
        )}
        {member._mode === "transfer" && (
          <div className="space-y-3">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider">Department</label>
              <select value={deptId} onChange={(e) => setDeptId(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="" className="bg-[#0d0d14]">— None —</option>
                {departments.map((d) => <option key={d.id} value={d.id} className="bg-[#0d0d14]">{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider">Team</label>
              <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="" className="bg-[#0d0d14]">— None —</option>
                {teams.filter((t) => !deptId || t.department_id === deptId).map((t) => <option key={t.id} value={t.id} className="bg-[#0d0d14]">{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider">Manager</label>
              <input value={manager} onChange={(e) => setManager(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
          </div>
        )}
        {member._mode === "audit" && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {member._loading ? <div className="text-white/30 text-sm">Loading...</div> :
              (member._logs?.length ? member._logs.map((l) => (
                <div key={l.id} className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm capitalize">{(l.event_type || "").replace(/_/g, " ")}</span>
                    <span className="text-white/30 text-xs">{l.timestamp ? new Date(l.timestamp).toLocaleDateString() : ""}</span>
                  </div>
                  <div className="text-white/40 text-xs mt-1">{l.reason || l.source}</div>
                </div>
              )) : <div className="text-white/30 text-sm">No audit history.</div>)
            }
          </div>
        )}
        {member._mode !== "audit" && (
          <div className="flex gap-2 mt-5">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm">Cancel</button>
            <button onClick={apply} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">Apply</button>
          </div>
        )}
      </div>
    </div>
  );
}