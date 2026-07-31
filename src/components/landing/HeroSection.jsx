import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Play, Check, Brain, Swords, TrendingUp, Zap,
} from "lucide-react";
import HeroProductPreview from "./HeroProductPreview";
import LeadershipTrackCallout from "./LeadershipTrackCallout";

const VALUE_CARDS = [
  { icon: Brain, title: "Develop Like an Executive", desc: "Learn how executive leaders think through AI coaching, structured learning, and executive guidance." },
  { icon: Swords, title: "Practice Before It Matters", desc: "Build confidence through realistic executive simulations, debates, decision labs, and leadership scenarios." },
  { icon: TrendingUp, title: "Prove Your Growth", desc: "Track Executive Readiness™, leadership evidence, AI recommendations, and measurable outcomes over time." },
];

const TRUST_ITEMS = [
  "10-minute assessment",
  "Personalized AI analysis",
  "Executive Readiness Report™",
  "Promotion Forecast™",
  "7-Day Coaching Plan™",
  "No credit card required during beta",
];

export default function HeroSection({ authed, onWatchDemo }) {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-orange/20 rounded-full blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px]"
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="xMidYMid slice">
          <g stroke="#f59e0b" strokeWidth="0.5" fill="#f59e0b">
            <line x1="10%" y1="20%" x2="30%" y2="60%" />
            <line x1="30%" y1="60%" x2="55%" y2="35%" />
            <line x1="55%" y1="35%" x2="80%" y2="55%" />
            <line x1="80%" y1="55%" x2="90%" y2="25%" />
            <line x1="30%" y1="60%" x2="20%" y2="85%" />
            <line x1="55%" y1="35%" x2="65%" y2="80%" />
          </g>
          {[["10%","20%"],["30%","60%"],["55%","35%"],["80%","55%"],["90%","25%"],["20%","85%"],["65%","80%"]].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r="2.5" className="pi-node-pulse" />
          ))}
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-10 items-center">
          <div className="w-full lg:w-[55%] text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-xs text-accent-orange font-semibold tracking-wide mb-5"
            >
              <Zap size={12} />
              FOUNDING PRIVATE BETA™
              <span className="hidden sm:inline text-white/30 font-normal">· Invitation Only · Limited Founding Members</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08] mb-5"
            >
              Become the Executive Every
              <br className="hidden sm:block" />{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Organization Wants to Hire.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.18 }}
              className="text-base md:text-lg text-white/60 max-w-2xl mx-auto lg:mx-0 mb-3 leading-relaxed"
            >
              Measure your Executive Readiness, discover the leadership gaps holding you back, and receive a
              personalized AI-powered development plan that accelerates your journey toward executive leadership.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.24 }}
              className="text-sm md:text-base text-white/40 max-w-2xl mx-auto lg:mx-0 mb-7 leading-relaxed"
            >
              Designed for ambitious professionals across technology, business, finance, human resources, sales,
              healthcare, education, government, and more. Choose your Leadership Track and follow a personalized
              AI-powered journey toward becoming the executive every organization wants to hire.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
              {VALUE_CARDS.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                  className="rounded-xl bg-white/[0.03] border border-white/8 p-4 hover:bg-white/[0.05] hover:border-white/15 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
                    <card.icon size={16} className="text-indigo-400" />
                  </div>
                  <div className="text-[13px] font-semibold text-white mb-1.5 leading-tight">{card.title}</div>
                  <div className="text-[11px] text-white/45 leading-relaxed">{card.desc}</div>
                </motion.div>
              ))}
            </div>

            <LeadershipTrackCallout />

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8"
            >
              <Link
                to={authed ? "/assessment" : "/beta"}
                className="w-full sm:w-auto bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25"
              >
                Take the Executive Readiness Assessment™
                <ArrowRight size={17} />
              </Link>
              <button
                type="button"
                onClick={onWatchDemo}
                className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/15 text-white/80 font-medium px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Play size={16} /> Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2"
            >
              {TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-[11px] text-white/45">
                  <Check size={12} className="text-emerald-400/80" />
                  {item}
                </div>
              ))}
            </motion.div>
          </div>

          <div className="w-full lg:w-[45%]">
            <HeroProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
}