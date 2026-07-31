import React from 'react';
import { X, Check } from 'lucide-react';

const TRADITIONAL = ['Learning hours', 'Certificates', 'Static assessments', 'Generic coaching', 'One-size-fits-all learning'];
const EXECLEAD = ['Executive Readiness™', 'Verified leadership evidence', 'Executive Identity™', 'Outcome Intelligence™', 'Continuous executive development', 'Explainable AI recommendations'];

export default function WhyExecLead() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-indigo-400/80 font-semibold mb-2">Why EXECLEAD.AI</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Leadership Development Has Changed.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">The old model measured activity. The new model measures executive readiness.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
            <div className="text-[11px] uppercase tracking-wider text-white/35 font-semibold mb-4">Traditional Leadership Development</div>
            <div className="space-y-3">
              {TRADITIONAL.map((t) => (
                <div key={t} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0"><X size={13} className="text-white/40" /></span>
                  <span className="text-sm text-white/50 line-through decoration-white/20">{t}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/30 mt-5 leading-relaxed">Activity metrics tell you what was consumed — never what was learned or how leadership changed.</p>
          </div>
          <div className="rounded-2xl border border-accent-orange/25 bg-gradient-to-br from-accent-orange/[0.06] to-transparent p-6">
            <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-4">EXECLEAD.AI</div>
            <div className="space-y-3">
              {EXECLEAD.map((t) => (
                <div key={t} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent-orange/15 border border-accent-orange/30 flex items-center justify-center shrink-0"><Check size={13} className="text-accent-orange" /></span>
                  <span className="text-sm text-white/85 font-medium">{t}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/40 mt-5 leading-relaxed">Evidence-based outcomes that demonstrate real executive development — and travel with you.</p>
          </div>
        </div>
        <p className="text-center text-sm text-white/55 mt-8 max-w-2xl mx-auto">Leadership should be measured by <span className="text-white font-semibold">demonstrated capability</span>, not completed courses.</p>
      </div>
    </section>
  );
}