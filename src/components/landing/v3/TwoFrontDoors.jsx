import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Building2, ArrowRight, Sparkles } from "lucide-react";

// Two Front Doors™ — the single question every visitor answers first.
// Forks the experience between the individual leadership journey and the
// enterprise leader-development journey, without exposing the wrong
// capabilities to either audience.
export default function TwoFrontDoors({ authed }) {
  const [choice, setChoice] = useState(null); // 'career' | 'enterprise'

  const select = (c) => {
    setChoice(c);
    try { localStorage.setItem("execlead_frontdoor", c); } catch {}
  };

  const careerTo = authed ? "/dashboard" : "/register";
  const enterpriseTo = authed ? "/enterprise-intelligence" : "/contact";

  return (
    <section className="py-16 md:py-20 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-accent-orange mb-3">
            <Sparkles size={13} /><span className="text-[11px] uppercase tracking-wider font-semibold">Who are you?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">One platform. Two journeys.</h2>
          <p className="text-white/45 text-sm max-w-lg mx-auto">Tell us what you're here for and we'll reveal the right path. Everything else stays hidden until it's relevant to you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Option A — Growing My Career */}
          <motion.button
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            onClick={() => select("career")}
            className={`relative text-left rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 ${choice === "career" ? "border-accent-orange/50 bg-accent-orange/[0.06] ring-1 ring-accent-orange/30" : "border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"}`}
          >
            <div className="w-11 h-11 rounded-xl bg-accent-orange/15 flex items-center justify-center mb-4">
              <TrendingUp size={20} className="text-accent-orange" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">I'm Growing My Career</h3>
            <p className="text-[13px] text-white/50 leading-relaxed mb-5">Prepare for promotion, strengthen your leadership, and become executive ready.</p>
            {choice === "career" ? (
              <Link to={careerTo} onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-[13px] font-semibold transition-colors">
                Start My Leadership Journey <ArrowRight size={15} />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-white/35"><span className="w-1.5 h-1.5 rounded-full bg-white/25" /> Click to choose this path</span>
            )}
          </motion.button>

          {/* Option B — Developing Leaders */}
          <motion.button
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.06 }}
            onClick={() => select("enterprise")}
            className={`relative text-left rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 ${choice === "enterprise" ? "border-indigo-500/50 bg-indigo-500/[0.06] ring-1 ring-indigo-500/30" : "border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"}`}
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 flex items-center justify-center mb-4">
              <Building2 size={20} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">I'm Developing Leaders</h3>
            <p className="text-[13px] text-white/50 leading-relaxed mb-5">Develop high-potential talent, strengthen succession, and build executive capability across your organization.</p>
            {choice === "enterprise" ? (
              <Link to={enterpriseTo} onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-semibold transition-colors">
                Explore Enterprise <ArrowRight size={15} />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-white/35"><span className="w-1.5 h-1.5 rounded-full bg-white/25" /> Click to choose this path</span>
            )}
          </motion.button>
        </div>

        <p className="text-center text-[11px] text-white/30 mt-8">Your choice personalizes the experience. You can change it anytime — and every path leads to <span className="text-accent-orange/70">becoming executive ready.</span></p>
      </div>
    </section>
  );
}