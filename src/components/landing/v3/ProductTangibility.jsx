import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gauge, MessagesSquare, Network, ArrowRight, PlayCircle } from 'lucide-react';

/**
 * Product Tangibility™ — "See the Platform in Action".
 * Three high-quality mock previews with What / Why / Outcome.
 */

function ReadinessMock() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0f] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">Executive Readiness Report™</span>
        <span className="text-[10px] text-emerald-400">Verified</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
            <circle cx="40" cy="40" r="34" stroke="#f59e0b" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="160" strokeDashoffset="48" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">70</span>
            <span className="text-[8px] text-white/40">/100</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {[['Strategic Judgment', 78], ['Executive Presence', 64], ['Decision Quality', 72], ['Stakeholder Influence', 69]].map(([l, v]) => (
            <div key={l}>
              <div className="flex justify-between text-[9px] text-white/45 mb-0.5">
                <span>{l}</span><span>{v}</span>
              </div>
              <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-accent-orange" style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/8 grid grid-cols-3 gap-2 text-[9px] text-white/40">
        <div><div className="text-white/60 font-medium">AI Gap</div>Communication</div>
        <div><div className="text-white/60 font-medium">Focus</div>Strategy</div>
        <div><div className="text-white/60 font-medium">90-Day</div>Roadmap</div>
      </div>
    </div>
  );
}

function CoachMock() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0f] p-4 space-y-2">
      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">EXEC™ AI Executive Coach™</div>
      <div className="flex justify-end">
        <div className="bg-indigo-500/15 border border-indigo-500/25 rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] text-white/85 max-w-[80%]">
          How do I communicate a strategic pivot to my board without losing credibility?
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] text-white/75 max-w-[88%]">
          Lead with the decision rationale, then the evidence, then the risk mitigation. Avoid opening with the change itself — frame it as a refinement of the existing strategy.
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[9px] text-white/35 pt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Context-aware · Decision-quality feedback
      </div>
    </div>
  );
}

function IdentityMock() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0f] p-4">
      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Executive Identity Graph™</div>
      <div className="relative h-28 flex items-center justify-center">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <g stroke="rgba(255,255,255,0.12)" strokeWidth="1">
            <line x1="100" y1="55" x2="40" y2="25" /><line x1="100" y1="55" x2="160" y2="25" />
            <line x1="100" y1="55" x2="35" y2="85" /><line x1="100" y1="55" x2="165" y2="85" />
            <line x1="100" y1="55" x2="100" y2="100" />
          </g>
          <circle cx="100" cy="55" r="14" fill="#f59e0b" />
          <circle cx="40" cy="25" r="7" fill="#22d3ee" /><circle cx="160" cy="25" r="7" fill="#22d3ee" />
          <circle cx="35" cy="85" r="7" fill="#6366f1" /><circle cx="165" cy="85" r="7" fill="#6366f1" />
          <circle cx="100" cy="100" r="6" fill="#10b981" />
        </svg>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Verified Evidence</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">Strengths</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">Growth Trajectory</span>
      </div>
    </div>
  );
}

const PREVIEWS = [
  {
    icon: Gauge,
    title: 'Executive Readiness Report™',
    mock: ReadinessMock,
    what: 'A personalized readiness score, competency radar, AI gap analysis, and 90-day roadmap preview.',
    why: 'Tells you exactly where you stand as an executive — and what to develop next.',
    outcome: 'A clear, evidence-based path from where you are to executive-ready.',
  },
  {
    icon: MessagesSquare,
    title: 'EXEC™ AI Executive Coach™',
    mock: CoachMock,
    what: 'A real, context-aware coaching conversation with decision-quality feedback.',
    why: 'On-demand executive guidance — not generic advice, but feedback on your actual decisions.',
    outcome: 'Sharper executive communication and judgment you can apply immediately.',
  },
  {
    icon: Network,
    title: 'Executive Identity Graph™',
    mock: IdentityMock,
    what: 'A leadership identity summary with verified evidence indicators, strengths, and growth trajectory.',
    why: 'Turns your experience into a credible, evidence-backed executive identity.',
    outcome: 'A portable executive reputation you can show to decision-makers.',
  },
];

export default function ProductTangibility() {
  return (
    <section className="py-20 md:py-24 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">
            Product Tangibility™
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">See the Platform in Action</h2>
          <p className="text-sm text-white/45 max-w-xl mx-auto">
            Real product experiences — not marketing claims. Here's what you'll use as a member.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {PREVIEWS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col"
            >
              <div className="mb-4">
                <p.mock />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <p.icon size={16} className="text-accent-orange" />
                <h3 className="text-white font-semibold text-sm">{p.title}</h3>
              </div>
              <dl className="space-y-2.5 text-xs flex-1">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">What you're seeing</dt>
                  <dd className="text-white/65 mt-0.5 leading-relaxed">{p.what}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Why it matters</dt>
                  <dd className="text-white/65 mt-0.5 leading-relaxed">{p.why}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Expected outcome</dt>
                  <dd className="text-white/65 mt-0.5 leading-relaxed">{p.outcome}</dd>
                </div>
              </dl>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <PlayCircle size={17} /> Explore Interactive Platform <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}