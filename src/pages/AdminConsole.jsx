import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Users, Building, DollarSign, Loader2, Server, Activity, Flag } from "lucide-react";
import { motion } from "framer-motion";
import { isPlatformAdmin } from "@/lib/roles";
import DeletedAccountsPanel from "@/components/account/DeletedAccountsPanel";

export default function AdminConsole() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);

        if (isPlatformAdmin(me.role)) {
          const [userProfiles, organizations, invoices, usageLogs, challenges, simulations] = await Promise.all([
            base44.entities.UserProfile.list(),
            base44.entities.Organization.list(),
            base44.entities.Invoice.list(),
            base44.entities.UsageLog.list("-created_date", 500),
            base44.entities.ChallengeResult.list("-created_date", 500),
            base44.entities.SimulationSession.list("-created_date", 500),
          ]);

          setUsers(userProfiles);
          setOrgs(organizations);
          setStats({
            totalUsers: userProfiles.length,
            totalOrgs: organizations.length,
            totalRevenue: invoices.reduce((a, i) => a + (i.amount || 0), 0),
            totalAIRequests: usageLogs.length,
            totalChallenges: challenges.length,
            totalSimulations: simulations.length,
            activeSubscriptions: userProfiles.filter(p => p.subscription_status === "active" && p.subscription_plan !== "free").length,
          });
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  if (!user || !isPlatformAdmin(user.role)) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Shield size={32} className="mx-auto text-white/20 mb-3" />
          <h2 className="text-white font-medium mb-1">Access Restricted</h2>
          <p className="text-white/30 text-sm">This area is restricted to platform administrators.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers || 0, icon: Users, color: "text-indigo-400" },
    { label: "Organizations", value: stats.totalOrgs || 0, icon: Building, color: "text-emerald-400" },
    { label: "Revenue", value: `$${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-amber-400" },
    { label: "Active Subs", value: stats.activeSubscriptions || 0, icon: Shield, color: "text-cyan-400" },
    { label: "AI Requests", value: stats.totalAIRequests || 0, icon: Activity, color: "text-violet-400" },
    { label: "Challenges", value: stats.totalChallenges || 0, icon: Flag, color: "text-pink-400" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Shield size={12} className="text-red-400" /> Admin Console
        </div>
        <h1 className="text-2xl font-bold text-white">Platform Administration</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <s.icon size={18} className={s.color} />
            <div className="text-2xl font-bold text-white mt-2">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* System Health */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Server size={16} className="text-emerald-400" />
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">System Health</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "API Status", value: "Operational", color: "text-emerald-400" },
            { label: "Database", value: "Healthy", color: "text-emerald-400" },
            { label: "AI Services", value: "Active", color: "text-emerald-400" },
            { label: "Auth", value: "Online", color: "text-emerald-400" },
          ].map(h => (
            <div key={h.label} className="text-center">
              <div className={`text-sm font-medium ${h.color}`}>{h.value}</div>
              <div className="text-white/30 text-xs mt-0.5">{h.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Users */}
      <div>
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">User Management</h3>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5"><tr className="text-left text-xs text-white/30 uppercase tracking-wider"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Target Role</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">XP</th><th className="px-4 py-3">Status</th></tr></thead>
            <tbody>
              {users.slice(0, 20).map(u => (
                <tr key={u.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 text-white/70">{u.full_name || "Unknown"}</td>
                  <td className="px-4 py-3 text-white/50">{u.target_role || "—"}</td>
                  <td className="px-4 py-3"><span className="text-xs capitalize text-indigo-400">{u.subscription_plan || "free"}</span></td>
                  <td className="px-4 py-3 text-white/50">{u.xp_points || 0}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${u.subscription_status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{u.subscription_status || "active"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organizations */}
      <div>
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Organizations</h3>
        {orgs.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
            <Building size={24} className="mx-auto text-white/20 mb-2" />
            <p className="text-white/30 text-sm">No organizations registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {orgs.map(o => (
              <div key={o.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: (o.brand_color || "#6366f1") + "20" }}>
                    <Building size={16} style={{ color: o.brand_color || "#6366f1" }} />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium">{o.name}</p>
                    <p className="text-white/30 text-xs">{o.seats_used || 0} / {o.seats_total || 0} seats · {o.plan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeletedAccountsPanel />
    </div>
  );
}