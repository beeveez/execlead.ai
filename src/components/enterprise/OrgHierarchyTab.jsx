import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Building2, Users, ChevronRight, ChevronDown, Network } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function OrgHierarchyTab({ organization }) {
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    if (!organization?.id) return;
    loadAll();
  }, [organization?.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [depts, tms, mems] = await Promise.all([
        base44.entities.Department.filter({ organization_id: organization.id }),
        base44.entities.Team.filter({ organization_id: organization.id }),
        base44.entities.UserMembership.filter({ organization_id: organization.id }),
      ]);
      setDepartments(depts);
      setTeams(tms);
      setMembers(mems);
    } catch (e) {
      console.error("Failed to load hierarchy:", e);
    } finally {
      setLoading(false);
    }
  };

  const tree = useMemo(() => {
    const deptMap = {};
    departments.forEach((d) => { deptMap[d.id] = { ...d, children: [], teams: [] }; });
    const roots = [];
    departments.forEach((d) => {
      const node = deptMap[d.id];
      if (d.parent_department_id && deptMap[d.parent_department_id]) {
        deptMap[d.parent_department_id].children.push(node);
      } else {
        roots.push(node);
      }
    });
    teams.forEach((t) => {
      if (t.department_id && deptMap[t.department_id]) {
        deptMap[t.department_id].teams.push(t);
      }
    });
    return roots;
  }, [departments, teams]);

  const toggle = (id) => setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;
  }

  const memberCount = members.length;

  const renderDept = (node, depth = 1) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children.length > 0 || node.teams.length > 0;
    const typeLabel = node.department_type === "business_unit" ? "Business Unit" : "Department";
    const typeColor = node.department_type === "business_unit" ? "text-purple-400" : "text-blue-400";

    return (
      <div key={node.id} style={{ marginLeft: `${depth * 20}px` }}>
        <button
          onClick={() => hasChildren && toggle(node.id)}
          className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors text-left"
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} className="text-white/30" /> : <ChevronRight size={14} className="text-white/30" />
          ) : (
            <span className="w-3.5" />
          )}
          <Building2 size={14} className={typeColor} />
          <span className="text-white text-sm font-medium flex-1 truncate">{node.name}</span>
          <span className={`text-xs ${typeColor}`}>{typeLabel}</span>
          <span className="text-white/30 text-xs">{node.member_count || 0} members</span>
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-0.5">
            {node.children.map((child) => renderDept(child, depth + 1))}
            {node.teams.map((team) => (
              <div key={team.id} style={{ marginLeft: `${(depth + 1) * 20}px` }} className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-white/5 transition-colors">
                <span className="w-3.5" />
                <Users size={12} className="text-teal-400" />
                <span className="text-white/70 text-sm flex-1 truncate">{team.name}</span>
                <span className="text-teal-400 text-xs">Team</span>
                <span className="text-white/30 text-xs">{team.member_count || 0}/{team.capacity || 10}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Hierarchy stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Building2 size={14} className="text-indigo-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Business Units</span></div>
          <div className="text-white text-2xl font-bold">{departments.filter((d) => d.department_type === "business_unit").length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Network size={14} className="text-blue-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Departments</span></div>
          <div className="text-white text-2xl font-bold">{departments.filter((d) => d.department_type === "department").length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-teal-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Teams</span></div>
          <div className="text-white text-2xl font-bold">{teams.length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-emerald-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Members</span></div>
          <div className="text-white text-2xl font-bold">{memberCount}</div>
        </div>
      </div>

      {/* Tree visualization */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <Network size={14} className="text-indigo-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Organization Hierarchy</h3>
        </div>
        {/* Root */}
        <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 mb-1">
          <Building2 size={16} className="text-indigo-400" />
          <span className="text-white font-medium text-sm">{organization?.name || "Organization"}</span>
          <span className="text-indigo-400 text-xs ml-auto">Root</span>
        </div>
        <div className="space-y-0.5">
          {tree.map((node) => renderDept(node, 1))}
          {tree.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm">No departments yet. Create departments to build your hierarchy.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Visual Flow</div>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="px-3 py-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Organization</span>
          <ChevronRight size={14} className="text-white/20" />
          <span className="px-3 py-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">Business Units</span>
          <ChevronRight size={14} className="text-white/20" />
          <span className="px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">Departments</span>
          <ChevronRight size={14} className="text-white/20" />
          <span className="px-3 py-1.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20">Teams</span>
          <ChevronRight size={14} className="text-white/20" />
          <span className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Users</span>
        </div>
      </div>
    </div>
  );
}