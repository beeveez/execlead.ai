import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  COMPANIES, CAREER_PATHS, COUNTRIES, INDUSTRIES, LEARNING_STYLES
} from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Target, ArrowRight, Check, Search, User, Briefcase,
  Trophy, Loader2, Sparkles
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    target_company: "",
    target_role: "",
    full_name: "",
    country: "",
    industry: "",
    years_experience: 0,
    current_role: "",
    current_company: "",
    leadership_experience: "",
    certifications: "",
    career_goals: "",
    preferred_learning_style: "",
  });
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [growthPlan, setGrowthPlan] = useState(null);

  const filteredCompanies = COMPANIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const steps = [
    { num: 1, icon: User, label: "About You" },
    { num: 2, icon: Briefcase, label: "Career" },
    { num: 3, icon: Target, label: "Target" },
    { num: 4, icon: Trophy, label: "Goals" },
  ];

  const completeOnboarding = async () => {
    setSaving(true);
    try {
      const planRes = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a personalized Executive Growth Plan for:

Name: ${form.full_name}
Country: ${form.country}
Industry: ${form.industry}
Years of Experience: ${form.years_experience}
Current Role: ${form.current_role}
Current Company: ${form.current_company}
Target Role: ${form.target_role}
Target Company: ${form.target_company}
Leadership Experience: ${form.leadership_experience}
Certifications: ${form.certifications}
Career Goals: ${form.career_goals}
Preferred Learning Style: ${form.preferred_learning_style}

Create a concise but powerful 6-month executive growth plan. Include:
1. **Executive Summary** - 2-3 sentences on their readiness and key gap
2. **Phase 1 (Months 1-2)** - Foundation building priorities
3. **Phase 2 (Months 3-4)** - Skill acceleration focus
4. **Phase 3 (Months 5-6)** - Executive readiness and interview prep
5. **Key Focus Areas** - Top 3 skills to develop
6. **Recommended Starting Point** - What to do first on the platform

Be specific to their target role at ${form.target_company}. Keep it under 400 words.`,
      });
      setGrowthPlan(planRes);
      setSaving(false);
    } catch (e) {
      setSaving(false);
    }
  };

  const finalize = async () => {
    setSaving(true);
    try {
      await base44.entities.UserProfile.create({
        ...form,
        growth_plan: growthPlan,
        ai_personality: "executive_mentor",
        interview_readiness: 0,
        promotion_readiness: 0,
        leadership_maturity: 0,
        commercial_maturity: 0,
        communication_growth: 0,
        executive_presence: 0,
        confidence: 0,
        sessions_completed: 0,
        challenges_completed: 0,
        streak_days: 0,
        weak_areas: [],
        strong_areas: [],
      });
      window.location.href = "/dashboard";
    } catch (e) {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";
  const labelClass = "text-white/40 text-xs uppercase tracking-wider mb-2 block";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1">
            <span className="text-indigo-400">EXEC</span>
            <span className="text-white/80">LEAD</span>
            <span className="text-indigo-400">.</span>
            <span className="text-[10px] text-white/30 ml-2 tracking-widest">AI</span>
          </h1>
          <p className="text-white/30 text-sm">Develop Executive Leaders. Not Interview Candidates.</p>
        </div>

        {/* Step indicator */}
        {!growthPlan && (
          <div className="flex items-center justify-center gap-1 mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s.num < step ? "bg-indigo-500 text-white" : s.num === step ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/50" : "bg-white/5 text-white/20"
                }`}>
                  {s.num < step ? <Check size={14} /> : s.num}
                </div>
                {i < steps.length - 1 && <div className={`w-6 h-px ${step > s.num ? "bg-indigo-500/50" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Personal Info */}
          {step === 1 && !growthPlan && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="text-center mb-4">
                <User className="mx-auto mb-2 text-indigo-400" size={24} />
                <h2 className="text-lg font-semibold text-white">Tell us about you</h2>
              </div>
              <div>
                <label className={labelClass}>Full Name</label>
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Your name" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Country</label>
                  <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className={inputClass}>
                    <option value="" className="bg-[#0d0d14]">Select</option>
                    {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Years Exp.</label>
                  <input type="number" value={form.years_experience || ""} onChange={e => setForm(f => ({ ...f, years_experience: parseInt(e.target.value) || 0 }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Industry</label>
                <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className={inputClass}>
                  <option value="" className="bg-[#0d0d14]">Select industry</option>
                  {INDUSTRIES.map(c => <option key={c} value={c} className="bg-[#0d0d14]">{c}</option>)}
                </select>
              </div>
              <button
                disabled={!form.full_name || !form.country}
                onClick={() => setStep(2)}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                Continue <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Career */}
          {step === 2 && !growthPlan && (
            <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="text-center mb-4">
                <Briefcase className="mx-auto mb-2 text-indigo-400" size={24} />
                <h2 className="text-lg font-semibold text-white">Your current career</h2>
              </div>
              <div>
                <label className={labelClass}>Current Role</label>
                <input value={form.current_role} onChange={e => setForm(f => ({ ...f, current_role: e.target.value }))} placeholder="e.g. Service Delivery Manager" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Current Company</label>
                <input value={form.current_company} onChange={e => setForm(f => ({ ...f, current_company: e.target.value }))} placeholder="Current employer" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Leadership Experience</label>
                <textarea value={form.leadership_experience} onChange={e => setForm(f => ({ ...f, leadership_experience: e.target.value }))} placeholder="Describe your leadership experience..." rows={3} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className={labelClass}>Certifications</label>
                <input value={form.certifications} onChange={e => setForm(f => ({ ...f, certifications: e.target.value }))} placeholder="e.g. ITIL v4, PMP, AWS" className={inputClass} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-3 rounded-lg text-sm text-white/40 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-colors">Back</button>
                <button
                  disabled={!form.current_role}
                  onClick={() => setStep(3)}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Target */}
          {step === 3 && !growthPlan && (
            <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="text-center mb-4">
                <Target className="mx-auto mb-2 text-indigo-400" size={24} />
                <h2 className="text-lg font-semibold text-white">Your target</h2>
              </div>
              <div>
                <label className={labelClass}>Target Company</label>
                <div className="relative mb-2">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                  {filteredCompanies.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, target_company: c }))} className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${form.target_company === c ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Target Role</label>
                <select value={form.target_role} onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))} className={inputClass}>
                  <option value="" className="bg-[#0d0d14]">Select role</option>
                  {CAREER_PATHS.map(r => <option key={r} value={r} className="bg-[#0d0d14]">{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-6 py-3 rounded-lg text-sm text-white/40 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-colors">Back</button>
                <button
                  disabled={!form.target_company || !form.target_role}
                  onClick={() => setStep(4)}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Goals */}
          {step === 4 && !growthPlan && (
            <motion.div key="s4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="text-center mb-4">
                <Trophy className="mx-auto mb-2 text-indigo-400" size={24} />
                <h2 className="text-lg font-semibold text-white">Your goals</h2>
              </div>
              <div>
                <label className={labelClass}>Career Goals</label>
                <textarea value={form.career_goals} onChange={e => setForm(f => ({ ...f, career_goals: e.target.value }))} placeholder="What are your executive career goals?" rows={3} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className={labelClass}>Preferred Learning Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {LEARNING_STYLES.map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, preferred_learning_style: s }))} className={`px-3 py-2.5 rounded-lg text-xs transition-all ${form.preferred_learning_style === s ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="px-6 py-3 rounded-lg text-sm text-white/40 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-colors">Back</button>
                <button
                  disabled={saving}
                  onClick={completeOnboarding}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Generating Plan...</> : <><Sparkles size={16} /> Generate Growth Plan</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* Growth Plan Display */}
          {growthPlan && (
            <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="text-indigo-400" size={24} />
                </div>
                <h2 className="text-lg font-semibold text-white">Your Executive Growth Plan</h2>
                <p className="text-white/30 text-sm">Personalized for {form.target_role} at {form.target_company}</p>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 max-h-80 overflow-y-auto">
                <div className="text-white/70 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{growthPlan}</ReactMarkdown>
                </div>
              </div>
              <button
                onClick={finalize}
                disabled={saving}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Start My Journey</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}