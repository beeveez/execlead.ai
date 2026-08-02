import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap, CalendarDays, Compass, DollarSign, Users, CheckCircle2,
  AlertTriangle, Sparkles, ShieldCheck, Award, ArrowRight, RotateCcw,
} from "lucide-react";

// InteractiveSimulationOutcome — the flagship executive analysis a visitor
// receives after deciding. Replaces generic feedback with executive-level
// analysis: time-horizon consequences, stakeholder reactions, financial
// implications, leadership strengths/blind spots, evidence-based Executive
// Readiness™ gain, and one personalized coaching recommendation.
export default function InteractiveSimulationOutcome({ choice, onReset, ctaTo }) {
  // Executive Readiness™ is updated using ONLY demonstrated evidence — the
  // competency deltas this decision actually surfaced. No activity credits.
  const demonstratedReadiness = choice
    ? Math.max(-5, Math.min(8, Math.round((choice.competencies || []).reduce((s, c) => s + c.delta, 0) / 5)))
    : 0;

  if (!choice) return null;

  const ev = choice.evidenceGained || {};
  const positive = demonstratedReadiness >= 0;

  return (
    <motion.div
      key={choice.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 space-y-5"
    >
      {/* Verdict + demonstrated-evidence readiness */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-2">
          {positive ? <CheckCircle2 size={15} className="text-emerald-400" /> : <AlertTriangle size={15} className="text-amber-400" />}
          <span className="text-[13px] font-medium text-white/85">{choice.verdict}</span>
        </div>
        <span className={`text-[13px] font-bold ${positive ? "text-emerald-400" : "text-amber-400"}`}>
          {positive ? "+" : ""}{demonstratedReadiness} Executive Readiness™
        </span>
      </div>

      {/* Consequences across three time horizons */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Compass size={14} className="text-accent-orange" />
          <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">Executive Consequence Analysis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ConsequenceCard icon={Zap} label="Immediate" text={choice.consequences.immediate} tone="amber" />
          <ConsequenceCard icon={CalendarDays} label="30-Day" text={choice.consequences.thirtyDay} tone="sky" />
          <ConsequenceCard icon={Compass} label="12-Month" text={choice.consequences.twelveMonth} tone="violet" />
        </div>
      </div>

      {/* Stakeholder reactions + financial implications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-indigo-400" />
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">Stakeholder Reactions</span>
          </div>
          <div className="space-y-2.5">
            {choice.council.map((p) => (
              <div key={p.persona} className="flex items-start gap-2">
                <SentimentDot sentiment={p.sentiment} />
                <div>
                  <span className="text-[12px] font-medium text-white/75">{p.persona}</span>
                  <p className="text-[11px] text-white/45 leading-snug">{p.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={14} className="text-emerald-400" />
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">Financial Implications</span>
          </div>
          <p className="text-[12px] text-white/65 leading-relaxed">{choice.financial}</p>
        </div>
      </div>

      {/* Leadership strengths / blind spots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold">Leadership Strengths</span>
          </div>
          <ul className="space-y-1.5">
            {choice.strengths.map((s) => (
              <li key={s} className="text-[12px] text-white/65 flex items-start gap-2">
                <span className="text-emerald-400 mt-1 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-[11px] uppercase tracking-wider text-amber-300/80 font-semibold">Leadership Blind Spots</span>
          </div>
          <ul className="space-y-1.5">
            {choice.blindSpots.map((s) => (
              <li key={s} className="text-[12px] text-white/65 flex items-start gap-2">
                <span className="text-amber-400 mt-1 w-1 h-1 rounded-full bg-amber-400 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Executive Readiness™ evidence gained */}
      <div className="rounded-xl border border-accent-orange/25 bg-gradient-to-br from-accent-orange/[0.06] via-white/[0.02] to-transparent p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={14} className="text-accent-orange" />
          <span className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold">Executive Readiness™ Evidence Gained</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange">
            <Award size={10} /> {ev.level}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(ev.competencies || []).map((c) => (
            <span key={c} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] border border-white/8 text-white/70">{c}</span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Metric label="Evidence Confidence" value={`${ev.confidence || 0}%`} />
          <Metric label="Demonstrated Competencies" value={(ev.competencies || []).length} />
        </div>
        <p className="text-[11.5px] text-white/55 leading-relaxed">{ev.summary}</p>
      </div>

      {/* One personalized coaching recommendation */}
      <div className="rounded-xl border border-accent-orange/20 bg-accent-orange/[0.05] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-accent-orange" />
          <span className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold">Your Personalized Coaching Recommendation</span>
        </div>
        <p className="text-[13px] text-white/75 leading-relaxed">{choice.coachingRecommendation}</p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-accent-orange/[0.06] to-transparent p-4">
        <div className="flex items-center gap-2 text-[12px] text-white/55">
          <ShieldCheck size={14} className="text-accent-orange/70" /> This is a fraction of your full Executive Readiness Report™.
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onReset} className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors">
            <RotateCcw size={12} /> Try another decision
          </button>
          <Link to={ctaTo} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-[13px] font-semibold transition-colors">
            See Your Full Readiness Report <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function ConsequenceCard({ icon: Icon, label, text, tone }) {
  const tones = {
    amber: "border-amber-500/15 bg-amber-500/[0.04] text-amber-300",
    sky: "border-sky-500/15 bg-sky-500/[0.04] text-sky-300",
    violet: "border-violet-500/15 bg-violet-500/[0.04] text-violet-300",
  };
  return (
    <div className={`rounded-lg border p-3 ${tones[tone] || "border-white/10 bg-white/[0.02]"}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} />
        <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-[11.5px] text-white/60 leading-relaxed">{text}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/8 px-3 py-2">
      <div className="text-[15px] font-bold text-white">{value}</div>
      <div className="text-[9px] text-white/35 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function SentimentDot({ sentiment }) {
  const color = { support: "bg-emerald-400", caution: "bg-amber-400", oppose: "bg-rose-400" }[sentiment] || "bg-white/40";
  return <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${color}`} />;
}