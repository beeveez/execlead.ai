import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, Compass, Cpu, Wrench, Crown, Target, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Leadership Profile Preview™ — real-time personalization surface that
// reflects the visitor's selected leadership path. Pure presentational;
// receives the selected domain object + callbacks.
export default function LeadershipProfilePreview({ domain, authed, onWatchDemo }) {
  if (!domain) return null;
  const ctaTo = authed ? '/assessment' : '/register';

  const track = (eventName, props = {}) => {
    try { base44.analytics.track({ eventName, properties: { path: domain.domain, ...props } }); } catch (e) {}
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={domain.domain}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mt-10 space-y-5"
      >
        {/* Microcopy */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-accent-orange mb-2"><Sparkles size={13} /><span className="text-[12.5px] font-semibold">EXECLEAD.AI is already adapting to your chosen leadership journey.</span></div>
          <p className="text-[11.5px] text-white/40 leading-relaxed">This same personalization continues throughout your Executive Leadership Journey.</p>
        </div>

        {/* Profile Preview card */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-accent-orange/25 bg-gradient-to-br from-accent-orange/[0.06] via-white/[0.02] to-transparent p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-orange/15 flex items-center justify-center"><Compass size={15} className="text-accent-orange" /></div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-accent-orange/80 font-semibold">Your Leadership Profile Preview</div>
              <div className="text-[14px] font-bold text-white">{domain.domain}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Primary Competencies */}
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/40 font-semibold mb-2 flex items-center gap-1"><Cpu size={11} className="text-accent-orange/70" /> Primary Competencies</div>
              <ul className="space-y-1.5">
                {domain.competencies.map((c) => (
                  <li key={c} className="text-[11.5px] text-white/70 flex items-start gap-1.5"><span className="text-accent-orange mt-1.5 w-1 h-1 rounded-full bg-accent-orange shrink-0" />{c}</li>
                ))}
              </ul>
            </div>

            {/* Recommended AI Experiences */}
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/40 font-semibold mb-2 flex items-center gap-1"><Sparkles size={11} className="text-accent-orange/70" /> Recommended AI Experiences</div>
              <ul className="space-y-1.5">
                {domain.aiExperiences.map((x) => (
                  <li key={x} className="text-[11.5px] text-white/70 flex items-start gap-1.5"><span className="text-emerald-400 mt-0.5 shrink-0">✓</span>{x}</li>
                ))}
              </ul>
            </div>

            {/* Expected Executive Outcomes */}
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/40 font-semibold mb-2 flex items-center gap-1"><Crown size={11} className="text-accent-orange/70" /> Expected Executive Outcomes</div>
              <div className="flex flex-col gap-1.5">
                {domain.career.split(' → ').map((step, idx, arr) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className={`text-[11px] ${idx === arr.length - 1 ? 'text-accent-orange font-semibold' : 'text-white/65'}`}>{step}</span>
                    {idx < arr.length - 1 && <span className="text-white/25 text-[10px]">↓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Competency chips */}
        <PreviewBlock icon={Target} title="EXECLEAD.AI will prioritize">
          <div className="flex flex-wrap gap-2">
            {domain.competencies.map((c, i) => (
              <motion.span key={c} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                onClick={() => track('competency_interaction', { competency: c })}
                className="px-2.5 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/25 text-[10.5px] text-accent-orange/90 cursor-default hover:bg-accent-orange/15 transition-colors">{c}</motion.span>
            ))}
          </div>
        </PreviewBlock>

        {/* Simulations */}
        <PreviewBlock icon={Play} title="Recommended Executive Simulations™">
          <div className="flex flex-wrap gap-2">
            {domain.simulations.map((s, i) => (
              <motion.span key={s} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                onClick={() => { track('simulation_preview_click', { simulation: s }); onWatchDemo?.(domain.demoScene); }}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/12 text-[10.5px] text-white/70 hover:border-accent-orange/30 hover:text-white/90 cursor-pointer transition-colors">{s}</motion.span>
            ))}
          </div>
        </PreviewBlock>

        {/* Coach */}
        <PreviewBlock icon={Wrench} title={`EXEC™ will adapt your coaching toward ${domain.coachFocus}`}>
          <p className="text-[11.5px] text-white/55 leading-relaxed">
            Your AI Executive Coach will frame every conversation, exercise, and reflection around <span className="text-accent-orange font-medium">{domain.coachFocus}</span> — connecting your daily decisions to the executive capabilities this path demands.
          </p>
        </PreviewBlock>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Companies */}
          <PreviewBlock icon={TrendingUp} title="Popular companies for this path">
            <div className="flex flex-wrap gap-2">
              {domain.companies.map((c) => (
                <span key={c} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/12 text-[10.5px] text-white/65">{c}</span>
              ))}
            </div>
          </PreviewBlock>

          {/* Readiness */}
          <PreviewBlock icon={Target} title="Your Executive Readiness™ will emphasize">
            <div className="flex flex-wrap gap-2">
              {domain.readiness.map((r) => (
                <span key={r} className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[10.5px] text-indigo-300">{r}</span>
              ))}
            </div>
          </PreviewBlock>
        </div>

        {/* Personalized CTA + Demo */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to={ctaTo} onClick={() => track('leadership_path_cta', { destination: ctaTo })}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-[13px] font-semibold transition-colors">
            Continue with your personalized Executive Readiness Assessment™ <ArrowRight size={15} />
          </Link>
          <button onClick={() => { track('leadership_path_demo', { scene: domain.demoScene }); onWatchDemo?.(domain.demoScene); }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/12 text-white/80 text-[13px] font-medium transition-colors">
            <Play size={14} /> See {domain.domain} in action
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function PreviewBlock({ icon: Icon, title, children }) {
  return (
    <div className="max-w-4xl mx-auto rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="flex items-center gap-1.5 mb-3"><Icon size={12} className="text-accent-orange/70" /><span className="text-[10px] uppercase tracking-wider text-white/45 font-semibold">{title}</span></div>
      {children}
    </div>
  );
}