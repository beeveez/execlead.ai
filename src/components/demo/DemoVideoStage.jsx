import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { BrandRegistry } from '@/lib/brandRegistry';
import { base44 } from '@/api/base44Client';
import ProductDemo from '@/components/landing/ProductDemo';

export default function DemoVideoStage({ authed }) {
  const COPY = BrandRegistry.marketing.demo.video;
  const [showInteractive, setShowInteractive] = useState(false);
  const assessmentTo = authed ? '/assessment' : '/beta';

  const launchPreview = () => {
    try { base44.analytics.track({ eventName: 'demo_interactive_preview_launched' }); } catch (e) {}
    setShowInteractive(true);
  };

  return (
    <section className="px-6 lg:px-8 pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent overflow-hidden">
          <div className="aspect-video flex flex-col items-center justify-center text-center p-6 md:p-10 bg-[#0a0a0f]">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent-orange/15 rounded-full blur-[100px]" />
              <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-accent-orange/10 border border-accent-orange/25 flex items-center justify-center">
                <PlayCircle size={30} className="text-accent-orange" />
              </div>
              <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">{COPY.comingSoonLabel}</div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">EXECLEAD.AI Platform Demo™</h3>
              <p className="text-sm text-white/55 max-w-xl mx-auto leading-relaxed mb-6">{COPY.comingSoonBody}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={launchPreview} className="bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:-translate-y-0.5">
                  <Sparkles size={16} /> {COPY.launchPreview}
                </button>
                <Link to="/platform" className="bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition-colors">
                  {COPY.exploreFeatures} <ArrowRight size={15} />
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-white/35">
                <span className="inline-flex items-center gap-1.5"><Clock size={12} /> 3–5 min guided walkthrough</span>
                <span className="inline-flex items-center gap-1.5"><PlayCircle size={12} /> 90s interactive preview</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.02] p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
          <p className="flex-1 text-sm text-white/70 leading-relaxed">{COPY.comingSoonBody}</p>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link to="/platform" className="text-center text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium px-4 py-2.5 rounded-lg transition-colors">{COPY.exploreFeatures}</Link>
            <Link to={assessmentTo} className="text-center text-sm bg-accent-orange/10 hover:bg-accent-orange/15 border border-accent-orange/25 text-accent-orange font-medium px-4 py-2.5 rounded-lg transition-colors">{COPY.takeAssessment}</Link>
            <Link to="/beta" className="text-center text-sm bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 text-amber-400 font-medium px-4 py-2.5 rounded-lg transition-colors">{COPY.applyBeta}</Link>
          </div>
        </div>
      </div>

      <ProductDemo open={showInteractive} onClose={() => setShowInteractive(false)} authed={authed} />
    </section>
  );
}