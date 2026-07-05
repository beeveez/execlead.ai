import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Building, Users, TrendingUp, Loader2, Plus, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function EnterpriseDashboard() {
  const [profile, setProfile] = useState(null);
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) setProfile(profiles[0]);

        if (profiles[0]?.organization_id) {
          const orgs = await base44.entities.Organization.filter({ id: profiles[0].organization_id });
          if (orgs.length > 0) setOrg(orgs[0]);
          const allProfiles = await base44.entities.UserProfile.list();
          setMembers(allProfiles);
          const r = await base44.entities.ChallengeResult.list("-created_date", 200);
          setResults(r);
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const createOrg = async () => {
    if (!orgName.trim() || !profile) return;
    setCreating(true);
    try {
      const newOrg = await base44.entities.Organization.create({
        name: orgName, plan: "enterprise", seats_total: 50, seats_used: 1,
      });
      await base44.entities.UserProfile.update(profile.id, {
        organization_id: newOrg.id, custom_role: "Enterprise Admin",
      });
      setOrg(newOrg);
      setProfile({ ...profile, organization_id: newOrg.id, custom_role: "Enterprise Admin" });
      setOrgName("");
    } catch (e) {}
    setCreating(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  const memberResults = members.map(m => {
    const r = results.filter(res => res.created_by_id === m.created_by_id);
    const avg = r.length > 0 ? Math.round(r.reduce((a, x) => a + (x.overall_score || 0), 0) / r.length) : 0;
    return { ...m, avgScore: avg, challengeCount: r.length };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Building size={12} className="text-emerald-400" /> Enterprise Dashboard
        </div>
        <h1 className="text-2xl font-bold text-white">Team Leadership Analytics</h1>
      </div>

      {!org ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8">
          <Building size={32} className="mx-auto text-white/20 mb-3" />
          <h3 className="text-center text-white font-medium mb-1">No Organization</h3>
          <p className="text-center text-white/30 text-sm mb-6">Create your organization to unlock team analytics, seat management, and department insights.</p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Organization name..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
            <button onClick={createOrg} disabled={creating || !orgName.trim()} className="px-5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white font-medium rounded-lg text-sm flex items-center gap-2 transition-colors">
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Org Info */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-white/[0.02] border border-emerald-500/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: (org.brand_color || "#10b981") + "20" }}>
                  <Building size={22} style={{ color: org.brand_color || "#10b981" }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{org.name}</h2>
                  <p className="text-white/40 text-sm">{org.seats_used || 1} / {org.seats_total || 50} seats used</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 capitalize">{org.plan}</span>
            </div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Team Members", value: members.length, icon: Users, color: "text-indigo-400" },
              { label: "Total Challenges", value: results.length, icon: TrendingUp, color: "text-cyan-400" },
              { label: "Avg Score", value: memberResults.length > 0 ? Math.round(memberResults.reduce((a, m) => a + m.avgScore, 0) / memberResults.length) : 0, icon: Crown, color: "text-amber-400" },
              { label: "Active Today", value: members.filter(m => m.last_active_date === new Date().toISOString().split("T")[0]).length, icon: TrendingUp, color: "text-emerald-400" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <s.icon size={18} className={s.color} />
                <div className="text-2xl font-bold text-white mt-2">{s.value}</div>
                <div className="text-white/30 text-xs">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Team Members */}
          <div>
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Team Members</h2>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-white/5"><tr className="text-left text-xs text-white/30 uppercase tracking-wider"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Target Role</th><th className="px-4 py-3">Challenges</th><th className="px-4 py-3">Avg Score</th><th className="px-4 py-3">Level</th></tr></thead>
                <tbody>
                  {memberResults.map(m => (
                    <tr key={m.id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">{(m.full_name || "U").charAt(0)}</div><span className="text-white/70">{m.full_name || "Unknown"}</span></div></td>
                      <td className="px-4 py-3 text-white/50">{m.target_role || "-"}</td>
                      <td className="px-4 py-3 text-white/50">{m.challengeCount}</td>
                      <td className="px-4 py-3"><span className={`font-medium ${m.avgScore >= 70 ? "text-emerald-400" : m.avgScore >= 40 ? "text-amber-400" : "text-red-400"}`}>{m.avgScore || "-"}</span></td>
                      <td className="px-4 py-3 text-white/50">{Math.floor((m.xp_points || 0) / 100) + 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}