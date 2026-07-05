import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { COMPANIES, CAREER_PATHS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Target, ArrowRight, Check, Search } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredCompanies = COMPANIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const handleComplete = async () => {
    setSaving(true);
    try {
      await base44.entities.UserProfile.create({
        target_company: company,
        target_role: role,
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
      window.location.href = "/";
    } catch (e) {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-indigo-400">EXEC</span>
            <span className="text-white/80">LEAD</span>
            <span className="text-indigo-400">.</span>
            <span className="text-[10px] text-white/30 ml-2 tracking-widest">AI</span>
          </h1>
          <p className="text-white/30 text-sm">Executive Leadership Operating System</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step ? "bg-indigo-500 text-white" : s === step ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/50" : "bg-white/5 text-white/20"
              }`}>
                {s < step ? <Check size={14} /> : s}
              </div>
              {s < 2 && <div className={`w-12 h-px ${step > 1 ? "bg-indigo-500/50" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-6">
                <Building2 className="mx-auto mb-3 text-indigo-400" size={28} />
                <h2 className="text-xl font-semibold text-white mb-1">Target Company</h2>
                <p className="text-white/40 text-sm">Which organization are you preparing for?</p>
              </div>
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {filteredCompanies.map(c => (
                  <button
                    key={c}
                    onClick={() => setCompany(c)}
                    className={`px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                      company === c
                        ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30"
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                disabled={!company}
                onClick={() => setStep(2)}
                className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                Continue <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-6">
                <Target className="mx-auto mb-3 text-indigo-400" size={28} />
                <h2 className="text-xl font-semibold text-white mb-1">Target Role</h2>
                <p className="text-white/40 text-sm">What position are you aiming for at {company}?</p>
              </div>
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {CAREER_PATHS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full px-4 py-3 rounded-lg text-sm text-left transition-all ${
                      role === r
                        ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30"
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-lg text-sm text-white/40 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={!role || saving}
                  onClick={handleComplete}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Launch My Journey <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}