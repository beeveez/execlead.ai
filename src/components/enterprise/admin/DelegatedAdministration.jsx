import React, { useState, useEffect } from "react";
import { Shield, Loader2, KeyRound, Users, Check, Clock, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DELEGATED_SCOPES = ["Departments", "Teams", "Users", "Licenses", "Reports", "Workspaces"];

export default function DelegatedAdministration({ organization }) {
  const [memberships, setMemberships] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization?.id) loadAll();
  }, [organization?.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [mems, depts] = await Promise.all([
        base44.entities.OrgMembership.filter({ organization_id: organization.id, status: "active" }),
        base44.entities.Department.filter({ organization_id: organization.id }),
      ]);
      setMemberships(mems);
      setDepartments(depts);
      const adminIds = mems.filter((m) => ["organization_admin", "department_admin"].includes(m.role)).map((m) => m.user_id).filter(Boolean);
      let logs = [];
      if (adminIds.length > 0) {
        try { logs = await base44.entities.SubscriptionAuditLog.filter({ source: "admin_action" }, "-created_date", 30); } catch {}
      }
      setAuditLogs(logs);
    } catch (e) {
      console.error("Delegated admin load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  const delegated = memberships.filter((m) => ["organization_admin", "department_admin"].includes(m.role));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Shield} label="Delegated Admins" value={delegated.length} color="indigo" />
        <Stat icon={KeyRound} label="Org Admins" value={delegated.filter((m) => m.role === "organization_admin").length} color="violet" />
        <Stat icon={Users} label="Dept Admins" value={delegated.filter((m) => m.role === "department_admin").length} color="blue" />
        <Stat icon={FileText} label="Audit Entries" value={auditLogs.length} color="teal" />
      </div>

      {/* Delegated admins */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-indigo-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Delegated Permissions</h3>
        </div>
        <div className="space-y-2">
          {delegated.map((m) => {
            const isOrgAdmin = m.role === "organization_admin";
            const scopes = isOrgAdmin ? DELEGATED_SCOPES : ["Teams", "Users", "Reports"];
            const scopeLabel = m.department_name || (isOrgAdmin ? "Organization-wide" : "Department scope");
            return (
              <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-white/80 text-sm font-medium">{m.user_name}</span>
                    <span className="text-white/30 text-xs ml-2 capitalize">{(m.role || "").replace(/_/g, " ")}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/50 text-xs">{scopeLabel}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {scopes.map((s) => (
                    <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                      <Check size={10} /> {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span className="flex items-center gap-1"><Clock size={10} /> Joined {m.joined_date || "—"}</span>
                  <span>·</span>
                  <span>No expiration</span>
                </div>
              </div>
            );
          })}
          {delegated.length === 0 && <p className="text-white/30 text-sm text-center py-6">No delegated administrators.</p>}
        </div>
      </div>

      {/* Audit trail */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={14} className="text-teal-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Delegation Audit Trail</h3>
        </div>
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {auditLogs.map((l) => (
            <div key={l.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
              <div>
                <span className="text-white/70 text-sm capitalize">{(l.event_type || "").replace(/_/g, " ")}</span>
                <span className="text-white/30 text-xs ml-2">{l.initiated_by_name || l.user_name}</span>
              </div>
              <span className="text-white/30 text-xs">{l.timestamp ? new Date(l.timestamp).toLocaleDateString() : ""}</span>
            </div>
          ))}
          {auditLogs.length === 0 && <p className="text-white/30 text-sm text-center py-4">No delegation audit events.</p>}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  const map = { indigo: "text-indigo-400", violet: "text-violet-400", blue: "text-blue-400", teal: "text-teal-400" };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1"><Icon size={14} className={map[color]} /><span className="text-white/40 text-xs uppercase tracking-wider">{label}</span></div>
      <div className="text-white text-2xl font-bold">{value}</div>
    </div>
  );
}