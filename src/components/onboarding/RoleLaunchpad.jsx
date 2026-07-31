import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles, Users, Briefcase, TrendingUp, Crown, GraduationCap, Search,
  Building2, Rocket, Code, ArrowRight, Check, Map, Target, Dna,
  MessageSquare, Play, Shield, Fingerprint, Trophy, Compass, Clock,
} from "lucide-react";
import {
  ROLES, EXECUTIVE_VALUE_PATH, FIRST_TIME_STEPS,
  READINESS_EXPLANATION, COMPETENCY_FRAMEWORK, setSelectedRoleId, getRoleById,
} from "@/lib/roleLaunchpad";

const ICONS = {
  Sparkles, Users, Briefcase, TrendingUp, Crown, GraduationCap, Search,
  Building2, Rocket, Code, Map, Target, Dna, MessageSquare, Play,
  Shield, Fingerprint, Trophy, Compass,
};

export default function RoleLaunchpad({ onContinue }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = getRoleById(selectedId);

  const pick = (role) => {
    setSelectedId(role.id);
    setSelectedRoleId(role.id);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-accent-orange mb-3">
          <Compass size={14} /><span className="text-[11px] uppercase tracking-wider font-semibold">Role-Based Launchpad™</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome to EXECLEAD.AI</h1>
        <p className="text-white/50 text-sm max-w-xl mx-auto">Choose the experience that best matches your current role or objective. You can change this anytime from Settings.</p>
      </div>

      {/* Role grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {ROLES.map((role, i) => {
          const Icon = ICONS[role.icon] || Sparkles;
          const active = selectedId === role.id;
          return (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => pick(role)}
              className={`relative rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-1 ${active ? "border-accent-orange/50 bg-accent-orange/[0.07] ring-1 ring-accent-orange/40" : "border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"}`}
            >
              {active && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent-orange flex items-center justify-center"><Check size={11} className="text-white" /></span>
              )}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${active ? "bg-accent-orange/15" : "bg-white/5"}`}>
                <Icon size={16} className={active ? "text-accent-orange" : "text-white/65"} />
              </div>
              <div className="text-[12.5px] font-semibold text-white leading-tight mb-1">{role.label}</div>
              <div className="text-[10px] text-white/40 leading-snug">{role.tagline}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Personalized experience reveal */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* EXEC personalization */}
            <div className="rounded-2xl border border-accent-orange/25 bg-gradient-to-br from-accent-orange/[0.06] via-white/[0.02] to-transparent p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent-orange/15 flex items-center justify-center shrink-0"><Sparkles size={16} className="text-accent-orange" /></div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-1">EXEC™ has adapted to your role</div>
                  <p className="text-[13px] text-white/75 leading-relaxed">{selected.coachFocus}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selected.quickActions.map((qa) => (
                      <Link key={qa.label} to={qa.path} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/12 text-[10.5px] text-white/70 hover:border-accent-orange/30 hover:text-white/90 transition-colors">{qa.label}</Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Value Path™ */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Map size={14} className="text-accent-orange/80" />
                <h3 className="text-[15px] font-semibold text-white">Your Leadership Journey</h3>
                <span className="text-[10px] text-white/30">Executive Value Path™</span>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-2 top-1 bottom-1 w-px bg-gradient-to-b from-accent-orange/40 via-white/10 to-transparent" />
                <div className="space-y-3">
                  {EXECUTIVE_VALUE_PATH.map((s, i) => {
                    const Icon = ICONS[s.icon] || Target;
                    return (
                      <div key={s.step} className="relative flex items-start gap-3">
                        <div className="absolute -left-[18px] w-4 h-4 rounded-full bg-[#0a0a0f] border border-accent-orange/40 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-orange/70" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0"><Icon size={14} className="text-white/65" /></div>
                        <div className="flex-1">
                          <div className="text-[12.5px] font-medium text-white/85">{s.step}</div>
                          <div className="text-[10.5px] text-white/40 leading-snug">{s.description}</div>
                        </div>
                        {i < EXECUTIVE_VALUE_PATH.length - 1 && <ArrowRight size={12} className="text-white/15 mt-2.5 rotate-90" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* First-time guided onboarding */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target size={14} className="text-accent-orange/80" />
                <h3 className="text-[15px] font-semibold text-white">Your First-Time Experience</h3>
                <span className="text-[10px] text-white/30">Estimated total: ~35 min</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {FIRST_TIME_STEPS.map((s) => {
                  const Icon = ICONS[s.icon] || Target;
                  return (
                    <div key={s.n} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-accent-orange/10 flex items-center justify-center"><Icon size={13} className="text-accent-orange/80" /></div>
                        <span className="text-[10px] text-white/30 font-medium">Step {s.n}</span>
                      </div>
                      <div className="text-[11px] text-white/75 leading-snug mb-1.5">{s.label}</div>
                      <div className="flex items-center gap-1 text-[9.5px] text-white/35"><Clock size={9} /> {s.est}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Executive Readiness explanation */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-accent-orange/80" />
                <h3 className="text-[14px] font-semibold text-white">{READINESS_EXPLANATION.title}</h3>
              </div>
              <p className="text-[12px] text-white/55 leading-relaxed mb-3">{READINESS_EXPLANATION.body}</p>
              <div className="flex flex-wrap gap-2">
                {READINESS_EXPLANATION.dimensions.map((d) => (
                  <span key={d} className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[10.5px] text-indigo-300">{d}</span>
                ))}
              </div>
            </div>

            {/* Competency framework preview */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-2">
                <Dna size={14} className="text-accent-orange/80" />
                <h3 className="text-[14px] font-semibold text-white">Executive Competency Framework™</h3>
                <span className="text-[10px] text-white/30">simulations evaluate against these</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COMPETENCY_FRAMEWORK.map((c) => (
                  <span key={c} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/12 text-[10.5px] text-white/65">{c}</span>
                ))}
              </div>
            </div>

            {/* Continue */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => onContinue?.(selected)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-[14px] font-semibold transition-colors"
              >
                Continue with {selected.label} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && (
        <div className="text-center text-[11px] text-white/30">
          Select a role above to personalize your Executive Leadership Journey.
        </div>
      )}
    </div>
  );
}