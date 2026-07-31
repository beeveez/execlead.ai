import React from "react";
import { motion } from "framer-motion";
import {
  Compass, Target, MessageSquare, Swords, Brain, GraduationCap,
  ShieldCheck, Sparkles, FileText, TrendingUp, Award, Check, ArrowDown,
  Network, BookOpen, FolderOpen, Crown, Gauge, Cpu, Layers, DollarSign, Users, Briefcase,
} from "lucide-react";

/* Scene 1 — The Challenge */
function SceneChallenge() {
  const steps = ["Engineer", "Senior Engineer", "Team Lead", "IT Manager", "Director", "CIO"];
  return (
    <div className="flex flex-col items-center justify-center gap-0 py-6">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: i * 1.1, duration: 0.45 }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${i === 5 ? "bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/20" : "bg-white/[0.03] border-white/10"}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 5 ? "bg-amber-500 text-black" : "bg-white/10 text-white/70"}`}>{i + 1}</div>
            <span className={`text-sm font-medium ${i === 5 ? "text-amber-300" : "text-white/80"}`}>{s}</span>
          </motion.div>
          {i < steps.length - 1 && (
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 1.1 + 0.4, duration: 0.5 }} className="w-px h-5 bg-gradient-to-b from-white/20 to-white/5 origin-top" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* Scene 2 — Choose Your Leadership Journey */
function SceneJourney() {
  const paths = [
    { icon: Cpu, label: "Technology" },
    { icon: Briefcase, label: "Business" },
    { icon: DollarSign, label: "Finance" },
    { icon: Users, label: "People" },
  ];
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {paths.map((p, i) => {
          const Icon = p.icon;
          const on = i === 0;
          return (
            <motion.div key={p.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.4 }}
              className={`rounded-xl border p-4 text-center ${on ? "bg-accent-orange/15 border-accent-orange/40" : "bg-white/[0.03] border-white/10"}`}>
              <div className={`w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center ${on ? "bg-accent-orange/20" : "bg-white/5"}`}><Icon size={18} className={on ? "text-accent-orange" : "text-white/60"} /></div>
              <div className="text-[11px] text-white/75 font-medium">{p.label}</div>
              {on && <div className="text-[9px] text-accent-orange mt-1">Selected</div>}
            </motion.div>
          );
        })}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className="text-center text-[11px] text-white/45 mt-4">Every module personalizes to your path.</motion.div>
    </div>
  );
}
/* Scene 3 — Executive Readiness Assessment™ */
function SceneAssessment() {
  const opts = ["Reallocate and coach on prioritization", "Extend their deadlines", "Let them manage it", "Escalate to HR"];
  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5">
        <div className="flex items-center gap-2 mb-3"><Gauge size={14} className="text-accent-orange" /><span className="text-[10px] uppercase tracking-wider text-accent-orange/80 font-semibold">Leadership</span></div>
        <p className="text-sm text-white/85 mb-3">Your top performer is overloaded and missing deadlines. What do you do first?</p>
        <div className="space-y-2">
          {opts.map((o, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.5 }}
              className={`flex items-center gap-2.5 rounded-lg p-2.5 border ${i === 0 ? "bg-accent-orange/10 border-accent-orange/40" : "bg-white/[0.03] border-white/10"}`}>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${i === 0 ? "border-accent-orange bg-accent-orange" : "border-white/25"}`}>{i === 0 && <Check size={9} className="text-black" />}</span>
              <span className="text-[11px] text-white/75">{o}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* Scene 4 — Executive Readiness Report™ */
function SceneReport() {
  const axes = ["Strategy", "Communication", "Decision", "Stakeholder", "Influence", "Vision"];
  const vals = [0.82, 0.7, 0.88, 0.74, 0.79, 0.85];
  const cx = 100, cy = 100, R = 80;
  const point = (i, v) => { const ang = (Math.PI * 2 * i) / axes.length - Math.PI / 2; return [cx + R * v * Math.cos(ang), cy + R * v * Math.sin(ang)]; };
  const poly = vals.map((v, i) => point(i, v).join(",")).join(" ");
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col sm:flex-row gap-5 items-center">
      <svg viewBox="0 0 200 200" className="w-44 h-44">
        {[0.25, 0.5, 0.75, 1].map((r) => (<polygon key={r} points={axes.map((_, i) => point(i, r).join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />))}
        {axes.map((_, i) => { const [x, y] = point(i, 1); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />; })}
        <motion.polygon points={poly} fill="rgba(245,158,11,0.18)" stroke="#f59e0b" strokeWidth="1.5" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: "easeOut" }} style={{ transformOrigin: "100px 100px" }} />
      </svg>
      <div className="flex-1 w-full">
        <div className="flex items-baseline gap-2"><span className="text-3xl font-bold text-white">82</span><span className="text-xs text-emerald-400">↑ +6</span></div>
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Readiness Score</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400"><Check size={11} /> Strengths: Decision, Vision</div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400"><TrendingUp size={11} /> Growth: Communication</div>
          <div className="flex items-center gap-1.5 text-[11px] text-accent-orange"><Compass size={11} /> 90-day roadmap generated</div>
        </div>
      </div>
    </div>
  );
}

/* Scene 5 — Meet EXEC™ */
function SceneExec() {
  const tools = [
    { icon: Brain, label: "Executive Coach™" },
    { icon: Sparkles, label: "Concierge™" },
    { icon: Swords, label: "Debate™" },
    { icon: Layers, label: "Decision Lab™" },
  ];
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {tools.map((t, i) => { const Icon = t.icon; return (
          <motion.div key={t.label} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.4 }}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/10 p-3">
            <div className="w-9 h-9 rounded-lg bg-accent-orange/15 flex items-center justify-center"><Icon size={15} className="text-accent-orange" /></div>
            <span className="text-[10px] text-white/70 text-center">{t.label}</span>
          </motion.div>
        ); })}
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }} className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
        <div className="text-[10px] text-white/40 mb-1">You</div>
        <div className="text-[12px] text-white/80 mb-2">How do I handle a board that keeps changing priorities?</div>
        <div className="text-[10px] text-accent-orange mb-1">EXEC™ Coach</div>
        <div className="text-[12px] text-white/65">Before tactics — what does the board need to feel confident? A reactive answer loses the room.</div>
      </motion.div>
    </div>
  );
}

/* Scene 6 — Practice Leadership */
function ScenePractice() {
  const events = ["Simulation started", "Decision recorded", "Evidence captured", "Feedback generated"];
  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
        <div className="flex items-center gap-2 mb-1"><Swords size={13} className="text-accent-orange" /><span className="text-[11px] font-semibold text-white/85">Executive Simulation: Stakeholder Pushback</span></div>
        <div className="text-[11px] text-white/50">You proposed a $2M initiative. The CFO pushes back on ROI.</div>
      </motion.div>
      <div className="space-y-2">
        {events.map((e, i) => (
          <motion.div key={e} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 + i * 0.9 }}
            className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check size={11} className="text-emerald-400" /></div>
            <span className="text-[12px] text-white/75">{e}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* Scene 7 — Evidence Engine™ */
function SceneEvidence() {
  const chain = [
    { icon: ShieldCheck, label: "Evidence™", c: "#10b981" },
    { icon: Gauge, label: "Reliability™", c: "#06b6d4" },
    { icon: TrendingUp, label: "Outcome Intelligence™", c: "#ec4899" },
    { icon: BookOpen, label: "Executive Success Story™", c: "#f59e0b" },
    { icon: Network, label: "Executive Identity™", c: "#6366f1" },
  ];
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-1">
        {chain.map((c, i) => { const Icon = c.icon; return (
          <React.Fragment key={c.label}>
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.6 + i * 1.1, duration: 0.4 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border w-full max-w-xs" style={{ borderColor: `${c.c}44` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c.c}22` }}><Icon size={14} style={{ color: c.c }} /></div>
              <span className="text-[12px] text-white/80">{c.label}</span>
            </motion.div>
            {i < chain.length - 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 1.1 + 0.3 }}><ArrowDown size={12} className="text-white/30" /></motion.div>}
          </React.Fragment>
        ); })}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6.5 }} className="text-center text-[11px] text-accent-orange/80 mt-4">Leadership is earned through demonstrated capability.</motion.div>
    </div>
  );
}

/* Scene 8 — Executive Identity™ */
function SceneIdentity() {
  const chips = [
    { icon: Network, label: "Identity Graph™" },
    { icon: FolderOpen, label: "Portfolio™" },
    { icon: Award, label: "Brand™" },
  ];
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative h-32 flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-accent-orange/25 border border-accent-orange/40 flex items-center justify-center text-[10px] font-bold text-accent-orange z-10">EI</div>
        {[[22, 18], [78, 22], [20, 75], [80, 72]].map(([l, t], i) => (
          <div key={i} className="absolute w-8 h-8 rounded-full bg-white/8 border border-white/15" style={{ left: `${l}%`, top: `${t}%` }} />
        ))}
        <svg className="absolute inset-0 w-full h-full" stroke="#f59e0b" strokeWidth="0.5" opacity="0.4">
          <line x1="50%" y1="50%" x2="26%" y2="26%" /><line x1="50%" y1="50%" x2="78%" y2="30%" />
          <line x1="50%" y1="50%" x2="24%" y2="78%" /><line x1="50%" y1="50%" x2="76%" y2="74%" />
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {chips.map((c, i) => { const Icon = c.icon; return (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.4 }}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/10 p-3">
            <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center"><Icon size={14} className="text-accent-orange" /></div>
            <span className="text-[10px] text-white/70 text-center">{c.label}</span>
          </motion.div>
        ); })}
      </div>
    </div>
  );
}

/* Scene 9 — Executive Outcomes™ */
function SceneOutcomes() {
  const bars = [30, 40, 38, 55, 50, 65, 70, 82];
  return (
    <div className="w-full max-w-lg mx-auto grid grid-cols-2 gap-4">
      <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Readiness Trend</div>
        <div className="h-16 flex items-end gap-1">{bars.map((h, i) => <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500/40 to-accent-orange/40 rounded-t" style={{ height: `${h}%` }} />)}</div>
        <div className="flex items-center justify-between mt-2 text-[11px]"><span className="text-white/50">82</span><span className="text-emerald-400">+18</span></div>
      </div>
      <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Promotion Forecast™</div>
        <div className="flex items-center gap-2 mb-2"><Crown size={16} className="text-amber-400" /><span className="text-sm font-bold text-white">Director</span></div>
        <div className="text-[11px] text-white/55">Estimated 6–12 months</div>
        <div className="text-[10px] text-emerald-400 mt-1">Confidence: Medium-High</div>
      </div>
    </div>
  );
}

/* Scene 10 — Call to Action */
function SceneCTA() {
  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent mb-2">Your Executive Leadership Journey Starts Today.</div>
        <div className="text-sm text-white/55">Become the Executive Every Organization Wants to Hire.</div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-orange text-white font-semibold text-sm">
        <Gauge size={16} /> Start Executive Readiness Assessment™
      </motion.div>
    </div>
  );
}

export const SCENES = [
  { id: "challenge", title: "The Challenge", narration: "Technology professionals often master technical skills — but struggle with executive readiness.", takeaway: "Technical mastery is not executive readiness.", duration: 8, Visual: SceneChallenge },
  { id: "journey", title: "Choose Your Leadership Journey", narration: "Select your leadership path. EXECLEAD.AI personalizes every module to your executive destination.", takeaway: "One platform. Personalized to your path.", duration: 8, Visual: SceneJourney },
  { id: "assessment", title: "Executive Readiness Assessment™", narration: "A ten-minute assessment reveals your leadership gaps across the competencies that matter.", takeaway: "Know exactly where you stand.", duration: 8, Visual: SceneAssessment },
  { id: "report", title: "Executive Readiness Report™", narration: "Your report highlights strengths, growth areas, and a personalized ninety-day roadmap.", takeaway: "Strengths, gaps, and a roadmap.", duration: 10, Visual: SceneReport },
  { id: "exec", title: "Meet EXEC™", narration: "An AI coach, concierge, debate partner, and decision lab — built for executive thinking, not generic chat.", takeaway: "AI that challenges, not just answers.", duration: 10, Visual: SceneExec },
  { id: "practice", title: "Practice Leadership", narration: "Rehearse real executive decisions. Every simulation generates verified leadership evidence.", takeaway: "Practice decisions. Generate evidence.", duration: 10, Visual: ScenePractice },
  { id: "evidence", title: "Evidence Engine™", narration: "Evidence becomes reliability, becomes outcomes, becomes your story, becomes your identity.", takeaway: "Leadership is earned through demonstrated capability.", duration: 12, Visual: SceneEvidence },
  { id: "identity", title: "Executive Identity™", narration: "One verified identity powers your portfolio, your brand, and every professional experience.", takeaway: "One identity. Every experience.", duration: 8, Visual: SceneIdentity },
  { id: "outcomes", title: "Executive Outcomes™", narration: "Track readiness growth, competency gains, and your promotion forecast over time.", takeaway: "Measurable growth. A real forecast.", duration: 10, Visual: SceneOutcomes },
  { id: "cta", title: "Your Journey Starts Today", narration: "Your executive leadership journey starts today. Begin your Executive Readiness Assessment.", takeaway: "Become the executive every organization wants to hire.", duration: 6, Visual: SceneCTA },
];

export const DEMO_TOTAL = SCENES.reduce((s, sc) => s + sc.duration, 0); // 90