import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Users, Server, Layers, GitBranch, Briefcase, RefreshCw, Crown, Zap, ArrowRight, Target } from 'lucide-react';

const AUDIENCE = [
  { icon: Cpu, label: 'Technology Professionals' },
  { icon: Users, label: 'IT Managers' },
  { icon: Server, label: 'Service Delivery Managers' },
  { icon: Layers, label: 'Architects' },
  { icon: GitBranch, label: 'Technical Leads' },
  { icon: Briefcase, label: 'Engineering Managers' },
  { icon: RefreshCw, label: 'Transformation Leaders' },
  { icon: Target, label: 'Future Directors' },
  { icon: Zap, label: 'Future CIOs' },
  { icon: ArrowRight, label: 'Future CTOs' },
  { icon: Crown, label: 'Future Executives' },
];

export default function WhoIsItForSection() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Who Is It For?</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Built for Ambitious Technology Leaders.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">If you are a technology professional preparing for your next executive role, EXECLEAD.AI was built for you.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {AUDIENCE.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div key={a.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }} className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/8 p-3.5">
                <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0"><Icon size={15} className="text-accent-orange" /></div>
                <span className="text-[12px] font-medium text-white/75 leading-tight">{a.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}