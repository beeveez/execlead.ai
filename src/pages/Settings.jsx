import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  COMPANIES, CAREER_PATHS, AI_PERSONALITIES, COUNTRIES, INDUSTRIES, LEARNING_STYLES
} from "@/lib/constants";
import { Settings as SettingsIcon, Save, Loader2, User, Sliders } from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/lib/SubscriptionContext";
import AppearanceSection from "@/components/settings/AppearanceSection";

export default function Settings() {
  const { profile, refreshProfile } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", country: "", industry: "", years_experience: 0,
    current_role: "", current_company: "", target_company: "", target_role: "",
    leadership_experience: "", certifications: "", career_goals: "",
    preferred_learning_style: "", ai_personality: "executive_mentor",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        country: profile.country || "",
        industry: profile.industry || "",
        years_experience: profile.years_experience || 0,
        current_role: profile.current_role || "",
        current_company: profile.current_company || "",
        target_company: profile.target_company || "",
        target_role: profile.target_role || "",
        leadership_experience: profile.leadership_experience || "",
        certifications: profile.certifications || "",
        career_goals: profile.career_goals || "",
        preferred_learning_style: profile.preferred_learning_style || "",
        ai_personality: profile.ai_personality || "executive_mentor",
      });
    }
    setLoading(false);
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, form);
    await refreshProfile();
    setSaving(false);
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";
  const labelClass = "text-white/40 text-xs uppercase tracking-wider mb-2 block";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <SettingsIcon size={12} className="text-white/50" />
          Settings
        </div>
        <h1 className="text-2xl font-bold text-white">Account & Preferences</h1>
      </div>

      <AppearanceSection />

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-5">
        <h2 className="flex items-center gap-2 text-white font-semibold"><User size={16} className="text-indigo-400" /> Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className={inputClass}>
              <option value="" className="bg-[#0d0d14]">Select country</option>
              {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Industry</label>
            <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className={inputClass}>
              <option value="" className="bg-[#0d0d14]">Select industry</option>
              {INDUSTRIES.map(c => <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Years of Experience</label>
            <input type="number" value={form.years_experience} onChange={e => setForm(f => ({ ...f, years_experience: parseInt(e.target.value) || 0 }))} className={inputClass} />
          </div>
        </div>
      </motion.div>

      {/* Career Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-5">
        <h2 className="flex items-center gap-2 text-white font-semibold"><Sliders size={16} className="text-cyan-400" /> Career Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Current Role</label>
            <input value={form.current_role} onChange={e => setForm(f => ({ ...f, current_role: e.target.value }))} placeholder="e.g. Service Delivery Manager" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Current Company</label>
            <input value={form.current_company} onChange={e => setForm(f => ({ ...f, current_company: e.target.value }))} placeholder="Current employer" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Target Company</label>
            <select value={form.target_company} onChange={e => setForm(f => ({ ...f, target_company: e.target.value }))} className={inputClass}>
              {COMPANIES.map(c => <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Target Role</label>
            <select value={form.target_role} onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))} className={inputClass}>
              {CAREER_PATHS.map(r => <option key={r} value={r} className="bg-[#0d0d14]">{r}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Leadership Experience</label>
          <textarea value={form.leadership_experience} onChange={e => setForm(f => ({ ...f, leadership_experience: e.target.value }))} placeholder="Describe your leadership experience..." rows={2} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className={labelClass}>Certifications</label>
          <input value={form.certifications} onChange={e => setForm(f => ({ ...f, certifications: e.target.value }))} placeholder="e.g. ITIL v4, PMP, AWS, Six Sigma" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Career Goals</label>
          <textarea value={form.career_goals} onChange={e => setForm(f => ({ ...f, career_goals: e.target.value }))} placeholder="What are your executive career goals?" rows={2} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className={labelClass}>Preferred Learning Style</label>
          <select value={form.preferred_learning_style} onChange={e => setForm(f => ({ ...f, preferred_learning_style: e.target.value }))} className={inputClass}>
            <option value="" className="bg-[#0d0d14]">Select style</option>
            {LEARNING_STYLES.map(s => <option key={s} value={s} className="bg-[#0d0d14]">{s}</option>)}
          </select>
        </div>
      </motion.div>

      {/* AI Personality */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold">AI Coach Personality</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AI_PERSONALITIES.map(p => (
            <button
              key={p.id}
              onClick={() => setForm(f => ({ ...f, ai_personality: p.id }))}
              className={`px-3 py-3 rounded-lg text-left transition-all ${
                form.ai_personality === p.id ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30" : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{p.icon}</span>
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs opacity-50">{p.subtitle} · {p.difficulty}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><div className="text-2xl font-bold text-white">{profile?.challenges_completed || 0}</div><div className="text-white/30 text-xs">Challenges</div></div>
          <div><div className="text-2xl font-bold text-white">{profile?.sessions_completed || 0}</div><div className="text-white/30 text-xs">Simulations</div></div>
          <div><div className="text-2xl font-bold text-white">{profile?.streak_days || 0}</div><div className="text-white/30 text-xs">Day Streak</div></div>
          <div><div className="text-2xl font-bold text-white">{profile?.promotion_readiness || 0}%</div><div className="text-white/30 text-xs">Promotion Ready</div></div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        Save Changes
      </button>
    </div>
  );
}