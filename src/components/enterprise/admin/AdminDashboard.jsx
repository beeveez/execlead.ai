import React, { useState, useEffect } from "react";
import {
  Building2, Layers, Users, ShieldCheck, KeyRound, BarChart3, Heart,
  Ticket, AlertTriangle, Loader2, UserCheck, UserX, Mail, Cpu, Activity, Gauge,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import DashboardKPI from "@/components/enterprise/DashboardKPI";
import { ENTERPRISE_WORKSPACES } from "@/lib/enterpriseRoles";

export default function AdminDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [orgs, depts, teams, mems, users] = await Promise.all([
        base44.entities.Organization.list("-created_date", 200),
        base44.entities.Department.list("-created_date", 500),
        base44.entities.Team.list("-created_date", 500),
        base44.entities.OrgMembership.list("-created_date", 1000),
        base44.entities.User.list("-created_date", 500),
      ]);
      setData({ orgs, depts, teams, mems, users });
    } catch (e) {
      console.error("Admin dashboard load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;
  }

  const { orgs, depts, teams, mems, users } = data;
  const activeUsers = mems.filter((m) => m.status === "active");
  const inactiveUsers = mems.filter((m) => m.status === "suspended" || m.status === "deactivated");
  const pendingInvites = mems.filter((m) => m.status === "pending");
  const orgAdmins = activeUsers.filter((m) => ["super_admin", "platform_admin", "organization_admin"].includes(m.role));
  const deptAdmins = activeUsers.filter((m) => m.role === "department_admin");
  const managers = activeUsers.filter((m) => ["manager", "team_lead"].includes(m.role));
  const licensesAssigned = orgs.reduce((s, o) => s + (o.seats_used || 0), 0);
  const licensesAvailable = orgs.reduce((s, o) => s + Math.max(0, (o.seats_total || 0) - (o.seats_used || 0)), 0);
  const licensesTotal = orgs.reduce((s, o) => s + (o.seats_total || 0), 0);
  const today = new Date();
  const expiredLicenses = orgs.filter((o) => o.contract_end_date && new Date(o.contract_end_date) < today).length;
  const pendingPlans = orgs.filter((o) => o.plan_status === "pending").length;
  const activeOrgs = orgs.filter((o) => o.organization_status === "active").length;

  // Workspace usage
  const wsUsage = ENTERPRISE_WORKSPACES.map((ws) => ({
    ...ws,
    count: activeUsers.filter((m) => m.workspaces?.includes(ws.id)).length,
  }));

  // Organization health (composite across orgs)
  const orgHealthFactors = [
    { label: "Active Organizations", ok: activeOrgs >= orgs.length * 0.8 },
    { label: "Departments Populated", ok: depts.length >= orgs.length * 3 },
    { label: "Teams Populated", ok: teams.length >= orgs.length * 3 },
    { label: "Members Active", ok: activeUsers.length >= 5 },
    { label: "Managers Assigned", ok: managers.length >= 2 },
    { label: "Licenses Healthy", ok: expiredLicenses === 0 },
  ];
  const orgHealthScore = Math.round((orgHealthFactors.filter((f) => f.ok).length / orgHealthFactors.length) * 100);

  // Platform health (composite)
  const platformFactors = [
    { label: "Organizations Online", ok: activeOrgs > 0 },
    { label: "No Suspended Users", ok: inactiveUsers.length === 0 },
    { label: "License Capacity", ok: licensesAvailable > 0 },
    { label: "Admin Coverage", ok: orgAdmins.length > 0 },
    { label: "Workspace Adoption", ok: wsUsage.filter((w) => w.count > 0).length >= 3 },
  ];
  const platformHealth = Math.round((platformFactors.filter((f) => f.ok).length / platformFactors.length) * 100);

  return (
    <div className="space-y-4">
      {/* Row 1: Organization metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={Building2} label="Organizations" value={orgs.length} sub={`${activeOrgs} active`} color="indigo" />
        <DashboardKPI icon={Layers} label="Departments" value={depts.length} color="blue" />
        <DashboardKPI icon={Users} label="Teams" value={teams.length} color="teal" />
        <DashboardKPI icon={ShieldCheck} label="Users" value={users.length} sub={`${mems.length} memberships`} color="violet" />
      </div>

      {/* Row 2: User lifecycle */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={UserCheck} label="Active Users" value={activeUsers.length} color="emerald" />
        <DashboardKPI icon={UserX} label="Inactive Users" value={inactiveUsers.length} color="red" />
        <DashboardKPI icon={Mail} label="Pending Invites" value={pendingInvites.length} color="amber" />
        <DashboardKPI icon={KeyRound} label="Organization Admins" value={orgAdmins.length} color="indigo" />
      </div>

      {/* Row 3: Admin & licenses */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={ShieldCheck} label="Department Admins" value={deptAdmins.length} color="blue" />
        <DashboardKPI icon={Users} label="Managers" value={managers.length} color="teal" />
        <DashboardKPI icon={Ticket} label="Licenses Assigned" value={licensesAssigned} sub={`of ${licensesTotal}`} color="amber" />
        <DashboardKPI icon={Ticket} label="Licenses Available" value={licensesAvailable} color={licensesAvailable > 0 ? "emerald" : "red"} />
      </div>

      {/* Row 4: Platform health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={Cpu} label="Workspace Usage" value={wsUsage.filter((w) => w.count > 0).length} sub={`of ${ENTERPRISE_WORKSPACES.length}`} color="indigo" />
        <DashboardKPI icon={AlertTriangle} label="Expired Licenses" value={expiredLicenses} color={expiredLicenses === 0 ? "emerald" : "red"} />
        <DashboardKPI icon={Activity} label="Pending Plans" value={pendingPlans} color={pendingPlans === 0 ? "emerald" : "amber"} />
        <DashboardKPI icon={Heart} label="Organization Health" value={`${orgHealthScore}%`} color={orgHealthScore >= 80 ? "emerald" : orgHealthScore >= 50 ? "amber" : "red"} />
      </div>

      {/* Platform Health + Org Health breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HealthCard icon={Gauge} title="Platform Health" score={platformHealth} factors={platformFactors} color="indigo" />
        <HealthCard icon={Heart} title="Organization Health" score={orgHealthScore} factors={orgHealthFactors} color="emerald" />
      </div>

      {/* Workspace usage distribution */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-indigo-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Workspace Usage</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {wsUsage.map((ws) => (
            <div key={ws.id} className="flex items-center gap-2 bg-white/[0.02] rounded-lg px-3 py-2">
              <span className="text-white/40 text-xs truncate flex-1">{ws.name}</span>
              <span className="text-white font-bold text-sm">{ws.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthCard({ icon: Icon, title, score, factors, color }) {
  const colorMap = {
    indigo: "text-indigo-400", emerald: "text-emerald-400", amber: "text-amber-400", red: "text-red-400",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={14} className={colorMap[color]} />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        </div>
        <span className={`text-2xl font-bold ${score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`}>{score}%</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-sm">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${f.ok ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              {f.ok ? "✓" : "✗"}
            </span>
            <span className={f.ok ? "text-white/60" : "text-red-400/70"}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}