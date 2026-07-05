import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { COMPANIES, CAREER_PATHS, AI_PERSONALITIES, SCORE_DIMENSIONS } from "@/lib/constants";
import { User, Save, Loader2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer
} from "recharts";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ target_company: "", target_role: "", ai_personality: "executive_mentor" });
  const [results, setResults] = useState([]);

  useEffect(() => {
    const load = async () => {
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setForm({
          target_company: profiles[0].target_company,
          target_role: profiles[0].target_role,
          ai_personality: profiles[0].ai_personality || "executive_mentor",
        });
      }
      const res = await base44.entities.ChallengeResult.list("-created_date", 50);
      setResults(res);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, form);
    setProfile({ ...profile, ...form });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate avg scores from results
  const avgScores = results.length > 0
    ? SCORE_DIMENSIONS.map(dim => ({
        dimension: dim.label,
        value: Math.round(results.reduce((a, r) => a + (r[dim.key] || 0), 0) / results.length),
      }))
    : SCORE_DIMENSIONS.map(dim => ({ dimension: dim.label, value: 0 }));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <User size={12} className="text-pink-400" />
          Executive Profile
        </div>
        <h1 className="text-2xl font-bold text-white">Your Leadership Profile</h1>
      </div>

      {/* Radar Chart */}
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-400" />
              Performance Overview ({results.length} challenges)
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={avgScores}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-5">
        <h2 className="text-white font-semibold">Settings</h2>

        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Target Company</label>
          <select
            value={form.target_company}
            onChange={e => setForm(f => ({ ...f, target_company: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          >
            {COMPANIES.map(c => <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Target Role</label>
          <select
            value={form.target_role}
            onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          >
            {CAREER_PATHS.map(r => <option key={r} value={r} className="bg-[#0d0d14]">{r}</option>)}
          </select>
        </div>

        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">AI Personality</label>
          <div className="grid grid-cols-2 gap-2">
            {AI_PERSONALITIES.map(p => (
              <button
                key={p.id}
                onClick={() => setForm(f => ({ ...f, ai_personality: p.id }))}
                className={`px-3 py-3 rounded-lg text-left transition-all ${
                  form.ai_personality === p.id
                    ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30"
                    : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                <div className="text-sm font-medium">{p.icon} {p.name}</div>
                <div className="text-xs opacity-50 mt-0.5">{p.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-white">{profile?.challenges_completed || 0}</div>
            <div className="text-white/30 text-xs">Challenges</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{profile?.sessions_completed || 0}</div>
            <div className="text-white/30 text-xs">Simulations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{profile?.streak_days || 0}</div>
            <div className="text-white/30 text-xs">Day Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{results.length}</div>
            <div className="text-white/30 text-xs">Total Answers</div>
          </div>
        </div>
      </div>
    </div>
  );
}