import React from "react";
import { motion } from "framer-motion";
import { Gauge, BarChart3, TrendingUp, CalendarCheck } from "lucide-react";

const CARDS = [
  { icon: Gauge, title: "Executive Readiness Score™", desc: "Know exactly where you stand today." },
  { icon: BarChart3, title: "Leadership Gap Analysis™", desc: "Identify the capabilities preventing your next promotion." },
  { icon: TrendingUp, title: "Promotion Forecast™", desc: "Understand what executive roles you're ready for and what you need to reach your target role." },
  { icon: CalendarCheck, title: "7-Day Executive Coaching Plan™", desc: "Receive personalized daily coaching to begin improving immediately." },
];

export default function OutcomeCardsSection() {
  return (
    <section className="py-16 md:py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-[11px] text-accent-orange font-semibold mb-3">
            <CalendarCheck size={12} /> In Just 10 Minutes
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">In Just 10 Minutes You'll Receive</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto">Everything you need to understand your executive readiness and start improving today.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 p-6 hover:border-accent-orange/25 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-orange/20 to-amber-500/10 flex items-center justify-center mb-4">
                <c.icon size={22} className="text-accent-orange" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">{c.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}