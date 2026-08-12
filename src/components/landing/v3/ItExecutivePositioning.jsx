import React from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

/**
 * Technical-Leader Differentiator Reinforcement —
 * compact IT → Executive positioning strip near the top of the page.
 */
export default function ItExecutivePositioning() {
  return (
    <section className="py-10 md:py-12 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-[11px] text-indigo-300 font-semibold mb-3">
          <Cpu size={12} /> Built for the IT → Executive Transition
        </div>
        <p className="text-sm md:text-[15px] text-white/55 leading-relaxed max-w-3xl mx-auto">
          Unlike generic leadership platforms, EXECLEAD.AI is designed around the challenges technical professionals face when moving from hands-on delivery, operations, engineering, architecture, and service leadership into management, director, and executive responsibilities.
        </p>
      </div>
    </section>
  );
}