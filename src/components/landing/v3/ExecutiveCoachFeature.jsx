import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, User, Sparkles } from 'lucide-react';

const PERSONAS = ['Board Member', 'CEO', 'Investor', 'Enterprise CIO', 'Activist Stakeholder'];

export default function ExecutiveCoachFeature({ authed }) {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-indigo-400/80 font-semibold mb-2">Executive AI Coach</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Not Just Answers. Executive Thinking.</h2>
          <p className="text-white/55 leading-relaxed mb-6">
            The AI Executive Coach™ doesn't hand you scripts. It rehearses the way executives actually think —
            questioning your assumptions, pressure-testing your reasoning, and strengthening your executive presence.
          </p>
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-wider text-white/35 font-semibold mb-3">Practice With Executive Personas</div>
            <div className="flex flex-wrap gap-2">
              {PERSONAS.map((p) => (
                <span key={p} className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[12px] text-white/70">{p}</span>
              ))}
            </div>
          </div>
          <Link to={authed ? '/coach' : '/beta'} className="inline-flex items-center gap-1.5 text-sm text-accent-orange hover:text-accent-orange/80 transition-colors font-medium">
            Open the AI Executive Coach™ <ArrowRight size={14} />
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/10 bg-[#0d0d14] overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8 bg-white/[0.02]">
            <Brain size={14} className="text-accent-orange" />
            <span className="text-[11px] text-white/50 font-medium">AI Executive Coach™</span>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-accent-orange/15 border border-accent-orange/20 px-3.5 py-2.5">
                <div className="flex items-center gap-1.5 text-[9px] text-white/40 mb-1"><User size={10} /> You</div>
                <p className="text-[12px] text-white/85 leading-relaxed">I need to defend a 15% budget cut to the board next week. How do I frame it without looking reactive?</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 px-3.5 py-2.5">
                <div className="flex items-center gap-1.5 text-[9px] text-accent-orange/70 mb-1"><Sparkles size={10} /> Coach</div>
                <p className="text-[12px] text-white/70 leading-relaxed">Before the framing — what outcome does the board most need to hear? A defensive frame invites scrutiny. A strategic frame invites confidence. Which are you choosing, and why?</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 px-3.5 py-2.5">
                <p className="text-[12px] text-white/70 leading-relaxed">Let's pressure-test the three assumptions underneath your cut. If any one is wrong, the whole case collapses in the room.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}