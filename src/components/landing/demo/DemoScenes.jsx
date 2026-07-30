import React from "react";
import { motion } from "framer-motion";
import {
  Compass, Target, MessageSquare, Swords, Brain, GraduationCap,
  ShieldCheck, Sparkles, FileText, TrendingUp, Award, Check, ArrowDown,
} from "lucide-react";

/* ---------- Scene 1: From Technical Expert... ---------- */
function SceneCareerTimeline() {
  const steps = ["Engineer", "Senior Engineer", "Team Lead", "IT Manager", "Director", "CIO"];
  return (
    <div className="flex flex-col items-center justify-center gap-0 py-6">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: i * 1.4, duration: 0.5 }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
              i === 5
                ? "bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/20"
                : "bg-white/[0.03] border-white/10"
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
              i === 5 ? "bg-amber-500 text-black" : "bg-white/10 text-white/70"
            }`}>{i + 1}</div>
            <span className={`text-sm font-medium ${i === 5 ? "text-amber-300" : "text-white/80"}`}>{s}</span>
          </motion.div>
          {i < steps.length - 1 && (
            <motion.div
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: i * 1.4 + 0.5, duration: 0.6 }}
              className="w-px h-5 bg-gradient-to-b from-white/20 to-white/5 origin-top"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- Scene 2: Meet EXECLEAD.AI ---------- */
function ScenePlatform() {
  const cards = [
    { icon: Compass, label: "Executive Journey™", c: "#6366f1" },
    { icon: Target, label: "Executive Readiness™", c: "#f59e0b" },
    { icon: GraduationCap, label: "Leadership Path™", c: "#10b981" },
  ];
  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 backdrop-blur-xl p-6 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
          className="text-center mb-5"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/30 text-[11px] text-accent-orange font-semibold">
            Your Executive Leadership Operating System
          </span>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.5, duration: 0.5 }}
              className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-center"
            >
              <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${c.c}20` }}>
                <c.icon size={18} style={{ color: c.c }} />
              </div>
              <div className="text-[11px] text-white/70 font-medium">{c.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Scene 3: Know Where You Stand ---------- */
function SceneRadar() {
  const axes = ["Strategy", "Communication", "Decision", "Stakeholder", "Influence", "Vision"];
  const vals = [0.82, 0.7, 0.88, 0.74, 0.79, 0.85];
  const cx = 100, cy = 100, R = 80;
  const point = (i, v) => {
    const ang = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return [cx + R * v * Math.cos(ang), cy + R * v * Math.sin(ang)];
  };
  const poly = vals.map((v, i) => point(i, v).join(",")).join(" ");
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col sm:flex-row gap-5 items-center">
      <svg viewBox="0 0 200 200" className="w-52 h-52">
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon key={r} points={axes.map((_, i) => point(i, r).join(",")).join(" ")}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
        ))}
        {axes.map((_, i) => {
          const [x, y] = point(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />;
        })}
        <motion.polygon
          points={poly} fill="rgba(245,158,11,0.18)" stroke="#f59e0b" strokeWidth="1.5"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: "100px 100px" }}
        />
      </svg>
      <div className="flex-1 space-y-2.5 w-full">
        <div className="flex items-baseline gap-2">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-white">78</motion.span>
          <span className="text-xs text-emerald-400">↑ +6</span>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-white/40">Readiness Score</div>
        <div className="space-y-1.5 pt-1">
          {axes.map((a, i) => (
            <div key={a} className="flex justify-between text-[11px]">
              <span className="text-white/50">{a}</span>
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.15 }}
                className={vals[i] > 0.8 ? "text-emerald-400" : "text-amber-400"}>
                {Math.round(vals[i] * 100)}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Scene 4: Practice Executive Leadership ---------- */
function ScenePractice() {
  const tools = [
    { icon: MessageSquare, label: "Executive Coach™" },
    { icon: Sparkles, label: "EXEC™ Concierge™" },
    { icon: Brain, label: "Executive Simulation™" },
    { icon: Swords, label: "Decision Lab™" },
    { icon: Swords, label: "Leadership Debate™" },
  ];
  const events = ["Recommendation generated", "Simulation completed", "Evidence recorded", "Feedback displayed"];
  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {tools.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.6 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
          >
            <t.icon size={13} className="text-indigo-400" />
            <span className="text-[11px] text-white/75">{t.label}</span>
          </motion.div>
        ))}
      </div>
      <div className="space-y-2">
        {events.map((e, i) => (
          <motion.div
            key={e}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 3 + i * 0.9 }}
            className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check size={11} className="text-emerald-400" />
            </div>
            <span className="text-[12px] text-white/75">{e}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Scene 5: Every Action Becomes Evidence ---------- */
function SceneEvidenceFlow() {
  const targets = [
    { label: "Readiness", c: "#f59e0b" },
    { label: "Recommendations", c: "#6366f1" },
    { label: "Outcomes", c: "#ec4899" },
  ];
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-center mb-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15"
        >
          <FileText size={16} className="text-amber-400" />
          <span className="text-sm font-semibold text-white">Evidence Ledger™</span>
        </motion.div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {targets.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.5 }}
            className="rounded-xl p-3 text-center border"
            style={{ background: `${t.c}12`, borderColor: `${t.c}33` }}
          >
            <div className="text-[12px] font-semibold" style={{ color: t.c }}>{t.label}</div>
            <div className="text-[9px] text-white/40 mt-0.5">Provenance tracked</div>
          </motion.div>
        ))}
      </div>
      {/* flowing particles */}
      <svg className="w-full h-14 mt-1" viewBox="0 0 300 56">
        {targets.map((_, i) => {
          const x = 50 + i * 100;
          return (
            <React.Fragment key={i}>
              <line x1="150" y1="6" x2={x} y2="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <motion.circle r="2.5" fill="#f59e0b"
                initial={{ cx: 150, cy: 6, opacity: 0 }}
                animate={{ cx: [150, x], cy: [6, 40], opacity: [0, 1, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: 1.5 + i * 0.3, repeatDelay: 0.5 }}
              />
            </React.Fragment>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-4 text-[10px] text-white/40">
        <span>Evidence Provenance™</span><span>·</span><span>Outcome Attribution™</span>
      </div>
    </div>
  );
}

/* ---------- Scene 6: AI That Explains Itself ---------- */
function SceneTransparency() {
  const chain = [
    { icon: Sparkles, label: "Recommendation", c: "#ec4899" },
    { icon: ShieldCheck, label: "Decision Transparency™", c: "#14b8a6" },
    { icon: FileText, label: "Evidence", c: "#10b981" },
    { icon: TrendingUp, label: "Confidence", c: "#06b6d4" },
    { icon: Target, label: "Expected Impact", c: "#f59e0b" },
    { icon: ShieldCheck, label: "AI Trust Score™", c: "#6366f1" },
  ];
  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-center mb-3 text-[12px] text-white/50 italic"
      >
        "Why did the AI recommend this?"
      </motion.div>
      <div className="flex flex-col items-center gap-1">
        {chain.map((c, i) => (
          <React.Fragment key={c.label}>
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.8 + i * 1.1, duration: 0.4 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/12 w-full max-w-xs"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c.c}20` }}>
                <c.icon size={14} style={{ color: c.c }} />
              </div>
              <span className="text-[12px] text-white/80">{c.label}</span>
              {i === chain.length - 1 && (
                <span className="ml-auto text-[11px] font-bold text-emerald-400">92%</span>
              )}
            </motion.div>
            {i < chain.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 1.1 + 0.3 }}
              >
                <ArrowDown size={12} className="text-white/30" />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------- Scene 7: Become Executive Ready ---------- */
function SceneJourney() {
  const milestones = ["Assess", "Train", "Practice", "Track", "Certify"];
  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="flex items-center justify-between mb-5">
        {milestones.map((m, i) => (
          <React.Fragment key={m}>
            <motion.div
              initial={{ opacity: 0.4, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 1.2 }}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < 4 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-300"
              }`}>{i + 1}</div>
              <span className="text-[9px] text-white/50">{m}</span>
            </motion.div>
            {i < milestones.length - 1 && (
              <div className="flex-1 h-0.5 bg-white/5 mx-1 rounded relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: i * 1.2 + 0.4, duration: 1 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/60 to-amber-500/60"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 6 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40"
      >
        <Award size={16} className="text-amber-400" />
        <span className="text-sm font-semibold text-amber-300">Executive Certified</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 7.5 }}
        className="mt-5 space-y-1"
      >
        <div className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
          One Leadership Journey.
        </div>
        <div className="text-base text-white/70">Measure. Practice. Lead. Become Executive Ready.</div>
      </motion.div>
    </div>
  );
}

export const SCENES = [
  { id: "career", title: "From Technical Expert…", narration: "Technical expertise gets you promoted. Executive leadership gets you to the boardroom.", duration: 10, Visual: SceneCareerTimeline },
  { id: "platform", title: "Meet EXECLEAD.AI", narration: "Your Executive Leadership Operating System — Journey, Readiness, and a Leadership Path.", duration: 10, Visual: ScenePlatform },
  { id: "stand", title: "Know Where You Stand", narration: "Measure your executive readiness across the leadership competencies that matter most.", duration: 15, Visual: SceneRadar },
  { id: "practice", title: "Practice Executive Leadership", narration: "Coach, Concierge, Simulation, Decision Lab, and Debate — every action becomes evidence.", duration: 15, Visual: ScenePractice },
  { id: "evidence", title: "Every Action Becomes Evidence", narration: "The platform continuously measures your leadership development using evidence-based intelligence.", duration: 15, Visual: SceneEvidenceFlow },
  { id: "transparency", title: "AI That Explains Itself", narration: "Recommendation → Transparency → Evidence → Confidence → Impact → AI Trust Score™.", duration: 15, Visual: SceneTransparency },
  { id: "ready", title: "Become Executive Ready", narration: "One Leadership Journey. One AI Platform. One Executive Future.", duration: 10, Visual: SceneJourney },
];

export const DEMO_TOTAL = SCENES.reduce((s, sc) => s + sc.duration, 0); // 90