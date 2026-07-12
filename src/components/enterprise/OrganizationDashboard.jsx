import React, { useState, useEffect } from "react";
import { Building2, Layers, Users, ShieldCheck, KeyRound, BarChart3, Heart, Ticket, AlertTriangle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DashboardKPI from "@/components/enterprise/DashboardKPI";
import { ENTERPRISE_WORKSPACES, ROLE_BY_ID } from "@/lib/enterpriseRoles";

export default function OrganizationDashboard({ organization }) {
  const [orgs, setOrgs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;
    loadAll();
  }, [organization?.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [allOrgs, depts, tms, mems] = await Promise.all([
        base44.entities.Organization.list("-created_date", 100),
        base44.entities.Department.filter({ organization_id: organization.id }),
        base44.entities.Team.filter({ organization_id: organization.id }),
        base44.entities.OrgMembership.filter({ organization_id: organization.id }),
      ]);
      setOrgs(allOrgs);
      setDepartments(depts);
      setTeams(tms);
      setMemberships(mems);
    } catch (e) {
      console.error("Dashboard load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;
  }

  const activeUsers = memberships.filter((m) => m.status === "active");
  const managers = activeUsers.filter((m) => ["super_admin", "platform_admin", "organization_admin", "department_admin", "manager", "team_lead"].includes(m.role));
  const businessUnits = departments.filter((d) => d.department_type === "business_unit");
  const regularDepts = departments.filter((d) => d.department_type === "department");

  // Workspace distribution
  const wsDistribution = ENTERPRISE_WORKSPACES.map((ws) => ({
    ...ws,
    count: activeUsers.filter((m) => m.workspaces?.includes(ws.id)).length,
  }));

  // License usage
  const seatsUsed = organization.seats_used || activeUsers.length;
  const seatsTotal = organization.seats_total || 100;
  const licensePct = Math.round((seatsUsed / seatsTotal) * 100);

  // Department health
  const deptHealth = regularDepts.map((dept) => {
    const deptMembers = activeUsers.filter((m) => m.department_id === dept.id);
    const deptTeams = teams.filter((t) => t.department_id === dept.id);
    const hasHead = !!dept.head_name;
    const hasMembers = deptMembers.length > 0;
    const hasTeams = deptTeams.length > 0;
    const score = [hasHead, hasMembers, hasTeams].filter(Boolean).length;
    return { ...dept, memberCount: deptMembers.length, teamCount: deptTeams.length, hasHead, score, healthPct: Math.round((score / 3) * 100) };
  });

  // Team capacity
  const teamCapacity = teams.map((team) => {
    const count = team.member_count || 0;
    const cap = team.capacity || 10;
    return { ...team, fillPct: Math.round((count / cap) * 100), remaining: cap - count };
  });

  // Organization health (composite)
  const orgHealthFactors = [
    { label: "Departments", ok: departments.length >= 3 },
    { label: "Teams", ok: teams.length >= 3 },
    { label: "Members", ok: activeUsers.length >= 5 },
    { label: "Managers", ok: managers.length >= 2 },
    { label: "Workspaces", ok: (organization.workspaces_enabled?.length || 0) >= 3 },
    { label: "License Utilization", ok: licensePct < 90 },
  ];
  const orgHealthScore = Math.round((orgHealthFactors.filter((f) => f.ok).length / orgHealthFactors.length) * 100);

  return (
    <div className="space-y-4">
      {/* Row 1: Core KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={Building2} label="Total Organizations" value={orgs.length} color="indigo" />
        <DashboardKPI icon={Layers} label="Departments" value={departments.length} sub={`${businessUnits.length} BU · ${regularDepts.length} dept`} color="blue" />
        <DashboardKPI icon={Users} label="Teams" value={teams.length} color="teal" />
        <DashboardKPI icon={ShieldCheck} label="Active Users" value={activeUsers.length} sub={`${managers.length} managers`} color="emerald" />
      </div>

      {/* Row 2: Enterprise metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={KeyRound} label="Managers" value={managers.length} color="violet" />
        <DashboardKPI icon={Ticket} label="License Usage" value={`${licensePct}%`} sub={`${seatsUsed}/${seatsTotal} seats`} color={licensePct >= 90 ? "red" : "amber"} />
        <DashboardKPI icon={Heart} label="Organization Health" value={`${orgHealthScore}%`} color={orgHealthScore >= 80 ? "emerald" : orgHealthScore >= 50 ? "amber" : "red"} />
        <DashboardKPI icon={BarChart3} label="Workspaces Enabled" value={organization.workspaces_enabled?.length || 0} sub={`of ${ENTERPRISE_WORKSPACES.length}`} color="indigo" />
      </div>

      {/* Organization Health Breakdown */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={14} className="text-emerald-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Organization Health</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {orgHealthFactors.map((f) => (
            <div key={f.label} className="flex items-center gap-2 text-sm">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${f.ok ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                {f.ok ? "✓" : "✗"}
              </span>
              <span className={f.ok ? "text-white/60" : "text-red-400/70"}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Department Health + Team Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Department Health */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={14} className="text-blue-400" />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Department Health</h3>
          </div>
          <div className="space-y-2">
            {deptHealth.map((d) => (
              <div key={d.id} className="flex items-center gap-3 py-1.5">
                <span className="text-white/70 text-sm w-32 truncate">{d.name}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${d.healthPct === 100 ? "bg-emerald-500" : d.healthPct >= 67 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${d.healthPct}%` }} />
                </div>
                <span className="text-white/40 text-xs w-8 text-right">{d.healthPct}%</span>
                {!d.hasHead && <AlertTriangle size={12} className="text-amber-400" />}
              </div>
            ))}
            {deptHealth.length === 0 && <p className="text-white/30 text-sm text-center py-4">No departments yet.</p>}
          </div>
        </div>

        {/* Team Capacity */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-teal-400" />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Team Capacity</h3>
          </div>
          <div className="space-y-2">
            {teamCapacity.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-1.5">
                <span className="text-white/70 text-sm w-32 truncate">{t.name}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${t.fillPct >= 90 ? "bg-red-500" : t.fillPct >= 70 ? "bg-amber-500" : "bg-teal-500"}`} style={{ width: `${Math.min(100, t.fillPct)}%` }} />
                </div>
                <span className="text-white/40 text-xs font-mono w-12 text-right">{t.member_count}/{t.capacity}</span>
                {t.fillPct >= 90 && <AlertTriangle size={12} className="text-red-400" />}
              </div>
            ))}
            {teamCapacity.length === 0 && <p className="text-white/30 text-sm text-center py-4">No teams yet.</p>}
          </div>
        </div>
      </div>

      {/* Workspace Distribution */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-indigo-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Workspace Distribution</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {wsDistribution.map((ws) => (
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