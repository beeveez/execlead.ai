import React from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, FileBarChart, CalendarRange, LayoutDashboard, TrendingUp, Crown } from "lucide-react";

const STEPS = [
  { icon: ClipboardCheck, label: "Take Assessment" },
  { icon: FileBarChart, label: "Receive Executive Report" },
  { icon: CalendarRange, label: "Follow Your 7-Day Coaching Plan" },
  { icon: LayoutDashboard, label: "Unlock Your Executive Workspace" },
  { icon: TrendingUp, label: "Track Executive Growth" },
  { icon: Crown, label: "Become Executive Ready" },
];

export default function ExecutiveTransformation() {
  return (
    <section className="py-16 md:py-20 px-6 lg:px-8 bg-white/[0.01]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">The Executive Transformation</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto">From your first 10 minutes to executive ready — one connected journey.</p>
        </div>
        <div className="relative">
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent-orange/40 via-white/10 to-transparent" />
          <div className="space-y-4">
            {STEPS.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: left ? -24 : 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.45 }}
                  className={`relative flex items-center gap-4 md:w-1/2 ${left ? 'md:pr-8' : 'md:ml-auto md:pl-8'}`}
                >
                  <div className="absolute left-5 md:left-auto md:right-0 md:translate-x-1/2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-orange border-2 border-[#0a0a0f] z-10" />
                  <div className="ml-12 md:ml-0 flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/8 px-4 py-3.5 w-full">
                    <div className="w-9 h-9 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
                      <s.icon size={16} className="text-accent-orange" />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider">Step {i + 1}</div>
                      <div className="text-sm font-semibold text-white">{s.label}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}