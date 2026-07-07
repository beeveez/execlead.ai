import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Users, Network, TrendingUp, ClipboardCheck, ArrowRight, Loader2, AlertTriangle, CheckCircle2, Clock, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";

export default function HRDashboard() {
  const { members, loading: loadingMembers } = useOrganizationMembers();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const load = async () => {
      if (loadingMembers) return;
      try {
        const memberIds = new Set(members.map((m) => m.created_by_id));
        const memberNames = new Set(members.map((m) => m.full_name));

        const [plans, assignments, results] = await Promise.all([
          base44.entities.SuccessionPlan.list(),
          base44.entities.LearningAssignment.list(),
          base44.entities.ChallengeResult.list("-created_date", 200),
        ]);

        const orgAssignments = assignments.filter((a) => memberNames.has(a.assignee_name));
        const orgResults = results.filter((r) => memberIds.has(r.created_by_id));

        const today = new Date().toISOString().split("T")[0];
        const activeToday = members.filter((m) => m.last_active_date === today).length;
        const avgReadiness = members.length > 0
          ? Math.round(members.reduce((a, m) => a + (m.promotion_readiness || 0), 0) / members.length)
          : 0;

        let rolesCovered = 0;
        plans.forEach((p) => {
          try {
            const succ = JSON.parse(p.successors_json || "[]");
            if (succ.some((s) => s.readiness >= 70)) rolesCovered++;
          } catch (e) {}
        });
        const successionCoverage = plans.length > 0 ? Math.round((rolesCovered / plans.length) * 100) : 0;
        const criticalRoles = plans.filter((p) => p.risk_level === "critical" || p.risk_level === "high").length;

        const completed = orgAssignments.filter((a) => a.status === "completed").length;
        const inProgress = orgAssignments.filter((a) => a.status === "in_progress").length;
        const overdue = orgAssignments.filter((a) => a.status === "overdue" || (a.due_date && a.due_date < today && a.status !== "completed")).length;
        const completionRate = orgAssignments.length > 0 ? Math.round((completed / orgAssignments.length) * 100) : 0;

        setStats({
          members: members.length, activeToday, avgReadiness,
          totalPlans: plans.length, successionCoverage, criticalRoles, rolesCovered,
          totalAssignments: orgAssignments.length, completed, inProgress, overdue, completionRate,
          totalChallenges: orgResults.length,
        });
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [loadingMembers, members]);

  if (loading || loadingMembers) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  const QUICK_LINKS = [
    { path: "/succession-planning", label: "Succession Planning", desc: "Manage key role successors", icon: Network, color: "from-indigo-600 to-violet-600" },
    { path: "/promotion-readiness", label: "Promotion Readiness", desc: "Assess promotion candidates", icon: TrendingUp, color: "from-emerald-600 to-teal-600" },
    { path: "/learning-assignments", label: "Learning Assignments", desc: "Assign & track learning", icon: ClipboardCheck, color: "from-amber-600 to-orange-600" },
    { path: "/sso", label: "SSO & Identity", desc: "Azure AD, SCIM, provisioning", icon: Shield, color: "from-blue-600 to-cyan-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Users size={12} className="text-indigo-400" />
          HR Dashboard
        </div>
        <h1 className="text-2xl font-bold text-white">Talent & Workforce Overview</h1>
      </div>

      {/* Workforce Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Team Members", value: stats.members || 0, icon: Users, color: "text-indigo-400" },
          { label: "Active Today", value: stats.activeToday || 0, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Avg Readiness", value: `${stats.avgReadiness || 0}%`, icon: TrendingUp, color: "text-cyan-400" },
          { label: "Total Challenges", value: stats.totalChallenges || 0, icon: ClipboardCheck, color: "text-amber-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <s.icon size={18} className={s.color} />
            <div className="text-2xl font-bold text-white mt-2">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Talent Pipeline & Learning Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Network size={16} className="text-indigo-400" />
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Talent Pipeline</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Succession Coverage</span>
              <span className="text-white font-bold">{stats.successionCoverage || 0}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${stats.successionCoverage || 0}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">Roles with ready successors</span>
              <span className="text-white/70">{stats.rolesCovered || 0} / {stats.totalPlans || 0}</span>
            </div>
            {stats.criticalRoles > 0 && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-red-400 text-xs">{stats.criticalRoles} critical/high risk roles need successors</span>
              </div>
            )}
            <Link to="/succession-planning" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2">
              Manage succession plans <ArrowRight size={10} />
            </Link>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck size={16} className="text-amber-400" />
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Learning Compliance</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Completion Rate</span>
              <span className="text-white font-bold">{stats.completionRate || 0}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${stats.completionRate || 0}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center bg-white/5 rounded-lg py-2">
                <div className="text-emerald-400 font-bold text-sm">{stats.completed || 0}</div>
                <div className="text-white/30 text-xs">Completed</div>
              </div>
              <div className="text-center bg-white/5 rounded-lg py-2">
                <div className="text-amber-400 font-bold text-sm">{stats.inProgress || 0}</div>
                <div className="text-white/30 text-xs">In Progress</div>
              </div>
              <div className="text-center bg-white/5 rounded-lg py-2">
                <div className="text-red-400 font-bold text-sm">{stats.overdue || 0}</div>
                <div className="text-white/30 text-xs">Overdue</div>
              </div>
            </div>
            <Link to="/learning-assignments" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2">
              Manage assignments <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">HR Suite</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map((action, i) => (
            <motion.div key={action.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={action.path} className="block group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon size={16} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-0.5 group-hover:text-indigo-400 transition-colors">{action.label}</h3>
                <p className="text-white/30 text-xs">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}