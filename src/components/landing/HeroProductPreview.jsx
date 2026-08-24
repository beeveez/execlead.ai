import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, MessageSquare, Swords, BarChart3, TrendingUp, ShieldCheck,
  Check, Sparkles, ArrowUpRight, Cpu
} from "lucide-react";

const SCREENS = [
  { id: "readiness", label: "Executive Readiness Dashboard", tag: "Illustrative interface", icon: Activity, accent: "#f59e0b" },
  { id: "coach", label: "EXEC™ AI Executive Coach", tag: "Context-aware coaching", icon: MessageSquare, accent: "#6366f1" },
  { id: "simulator", label: "Executive Simulation™", tag: "Leadership practice", icon: Swords, accent: "#10b981" },
  { id: "analytics", label: "Leadership Analytics™", tag: "Development tracking", icon: BarChart3, accent: "#06b6d4" },
];

const DIMENSIONS = [
  { name: "Strategic Vision", val: 82 },
  { name: "Stakeholder Mgmt", val: 74 },
  { name: "Decision Judgment", val: 88 },
  { name: "Communication", val: 79 },
];

function ReadinessScreen() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ScoreRing value={78} color="#f59e0b" />
        <div className="flex-1 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Executive Readiness™</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">78</span>
            <span className="text-xs text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight size={12} /> +6 this week
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {DIMENSIONS.map((d, i) => (
          <div key={d.name}>
            <div className="flex justify-between text-[10px] text-white/40 mb-1">
              <span>{d.name}</span><span className="text-white/60">{d.val}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${d.val}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500/80 to-orange-400"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoachScreen() {
  const bubbles = [
    { role: "ai", text: "Your stakeholder framing is strong, but the financial impact is vague. Quantify it." },
    { role: "you", text: "We reduced incident MTTR by 40%, saving ~$2.1M annually." },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
          <Cpu size={13} className="text-indigo-400" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-white">Former CIO Persona</div>
          <div className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active</div>
        </div>
      </div>
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.3 }}
          className={`rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
            b.role === "ai" ? "bg-indigo-500/10 border border-indigo-500/20 text-white/80" : "bg-white/5 border border-white/10 text-white/70 ml-auto max-w-[85%]"
          }`}
        >
          {b.text}
        </motion.div>
      ))}
      <div className="flex items-center gap-1 pt-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
        <span className="text-[9px] text-white/30 ml-2">Analyzing evidence…</span>
      </div>
    </div>
  );
}

function SimulatorScreen() {
  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-wider text-emerald-400/80">Crisis Simulation</div>
      <div className="text-[12px] font-semibold text-white leading-snug">
        Production outage during enterprise migration. Your move.
      </div>
      <div className="space-y-2">
        {[
          { label: "Delegate incident command", risk: "low" },
          { label: "Communicate to board immediately", risk: "med" },
          { label: "Delay migration rollback", risk: "high" },
        ].map((opt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
          >
            <span className="text-[11px] text-white/70">{opt.label}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${
              opt.risk === "low" ? "bg-emerald-500/15 text-emerald-400" :
              opt.risk === "med" ? "bg-amber-500/15 text-amber-400" :
              "bg-rose-500/15 text-rose-400"
            }`}>{opt.risk}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  const bars = [45, 60, 52, 70, 64, 82, 78];
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-1.5 h-24">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }} animate={{ height: `${b}%` }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
            className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/30 to-cyan-400/80"
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{ k: "Avg Score", v: "76" }, { k: "Trend", v: "↑ 12%" }, { k: "Streak", v: "14d" }].map((s) => (
          <div key={s.k} className="rounded-lg bg-white/[0.03] border border-white/10 px-2 py-1.5 text-center">
            <div className="text-[14px] font-bold text-white">{s.v}</div>
            <div className="text-[9px] text-white/40">{s.k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutcomesScreen() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-pink-500/20 bg-pink-500/[0.06] p-3">
        <div className="text-[10px] text-pink-400 uppercase tracking-wider mb-1">Observed Outcome</div>
        <div className="text-[12px] text-white font-medium leading-snug">Promoted to Director of IT Ops</div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "87%" }} transition={{ duration: 1 }} className="h-full bg-pink-400/80 rounded-full" />
          </div>
          <span className="text-[10px] text-white/60">87% attribution</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[{ k: "Primary Driver", v: "Decision Judgment" }, { k: "Confidence", v: "High" }].map((s) => (
          <div key={s.k} className="rounded-lg bg-white/[0.03] border border-white/10 px-2 py-1.5">
            <div className="text-[9px] text-white/40">{s.k}</div>
            <div className="text-[11px] text-white/80">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransparencyScreen() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-white/70">Why this recommendation?</div>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} transition={{ duration: 1 }} className="h-full bg-teal-400/80 rounded-full" />
          </div>
          <span className="text-[10px] text-teal-400 font-medium">92%</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {[
          { icon: Check, t: "Grounded in 4 evidence items", c: "text-emerald-400" },
          { icon: Sparkles, t: "Model: claude-sonnet-5 · v1.2", c: "text-teal-400" },
          { icon: ShieldCheck, t: "Passed AI Governance review", c: "text-blue-400" },
        ].map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
            className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/10 px-3 py-1.5"
          >
            <row.icon size={12} className={row.c} />
            <span className="text-[11px] text-white/70">{row.t}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const RENDERERS = {
  readiness: ReadinessScreen,
  coach: CoachScreen,
  simulator: SimulatorScreen,
  analytics: AnalyticsScreen,
  outcomes: OutcomesScreen,
  transparency: TransparencyScreen,
};

function ScoreRing({ value, color }) {
  return (
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <motion.circle
          cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray="97.4"
          initial={{ strokeDashoffset: 97.4 }}
          animate={{ strokeDashoffset: 97.4 * (1 - value / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">{value}</div>
    </div>
  );
}

export default function HeroProductPreview() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % SCREENS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const screen = SCREENS[active];
  const Renderer = RENDERERS[screen.id];

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative rounded-2xl border border-white/10 bg-[#0d0d14]/90 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
      >
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <div className="ml-3 text-[10px] text-white/30 font-mono">Product interface preview</div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${screen.accent}20` }}>
              <screen.icon size={14} style={{ color: screen.accent }} />
            </div>
            <div>
              <div className="text-[12px] font-semibold text-white leading-tight">{screen.label}</div>
              <div className="text-[9px] text-white/40">{screen.tag}</div>
            </div>
          </div>
          <span className="text-[9px] text-amber-300 flex items-center gap-1">
              Illustrative data
            </span>
        </div>
        <div className="p-4 min-h-[230px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <Renderer />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-white/5">
          {SCREENS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              className={`h-1 rounded-full transition-all ${i === active ? "w-6 bg-accent-orange" : "w-1.5 bg-white/15"}`}
              aria-label={s.label}
            />
          ))}
        </div>
      </motion.div>
      <div className="absolute -inset-4 -z-10 bg-gradient-to-br from-accent-orange/10 via-indigo-500/5 to-transparent rounded-3xl blur-2xl" />
    </div>
  );
}