import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, MessagesSquare, Network, Check } from 'lucide-react';

/**
 * Product Tangibility Boost™ — "What You'll Experience" strip.
 * Placed immediately before the flagship simulation section.
 */

function ReadinessMock() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0f] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">Executive Readiness Report</span>
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
    </div>
  );
}

function CoachMock() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0f] p-4 space-y-2">
      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">EXEC™ AI Executive Coach</div>
      <div className="flex justify-end">
        <div className="bg-indigo-500/15 border border-indigo-500/25 rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] text-white/85 max-w-[80%]">
          How do I communicate a strategic pivot to my board without losing credibility?
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] text-white/75 max-w-[88%]">
          Lead with the decision rationale, then the evidence, then the risk mitigation. Avoid opening with the change itself.
        </div>
      </div>
    </div>
  );
}

function IdentityMock() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0f] p-4">
      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Executive Identity Preview</div>
      <div className="relative h-24 flex items-center justify-center">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <g stroke="rgba(255,255,255,0.12)" strokeWidth="1">
            <line x1="100" y1="50" x2="40" y2="22" /><line x1="100" y1="50" x2="160" y2="22" />
            <line x1="100" y1="50" x2="35" y2="80" /><line x1="100" y1="50" x2="165" y2="80" />
          </g>
          <circle cx="100" cy="50" r="13" fill="#f59e0b" />
          <circle cx="40" cy="22" r="6" fill="#22d3ee" /><circle cx="160" cy="22" r="6" fill="#22d3ee" />
          <circle cx="35" cy="80" r="6" fill="#6366f1" /><circle cx="165" cy="80" r="6" fill="#6366f1" />
        </svg>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Verified Evidence</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">Growth Trajectory</span>
      </div>
    </div>
  );
}

const PREVIEWS = [
  {
    icon: Gauge,
    title: 'Executive Readiness Report',
    mock: ReadinessMock,
    bullets: ['Readiness score', 'Competency radar', 'AI gap analysis'],
  },
  {
    icon: MessagesSquare,
    title: 'EXEC™ AI Executive Coach',
    mock: CoachMock,
    bullets: ['Real leadership conversation', 'Executive communication feedback', 'Decision-quality coaching'],
  },
  {
    icon: Network,
    title: 'Executive Identity Preview',
    mock: IdentityMock,
    bullets: ['Leadership strengths', 'Verified evidence indicators', 'Growth trajectory summary'],
  },
];

export default function ProductTangibility() {
  return (
    <section className="py-16 md:py-20 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">
            Product Tangibility
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">What You'll Experience</h2>
          <p className="text-sm text-white/45 max-w-xl mx-auto">
            A quick look at the experiences you'll use as a member.
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
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="mb-4">
                <p.mock />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <p.icon size={16} className="text-accent-orange" />
                <h3 className="text-white font-semibold text-sm">{p.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-xs text-white/65">
                    <Check size={12} className="text-emerald-400/80 flex-shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}