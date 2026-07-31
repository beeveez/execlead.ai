import React from "react";
import { motion } from "framer-motion";
import { PenLine, Users, Brain, MessageSquare, Target, Scale, TrendingUp, Clock } from "lucide-react";

const DAYS = [
  { day: 1, title: "Executive Reflection", icon: PenLine, desc: "Reflect on your assessment results and define your leadership intent." },
  { day: 2, title: "Leadership Exercise", icon: Users, desc: "Practice a real-world leadership scenario from your current role." },
  { day: 3, title: "Executive Simulation", icon: Brain, desc: "Run an executive simulation tailored to your target role." },
  { day: 4, title: "Communication Practice", icon: MessageSquare, desc: "Sharpen executive communication and stakeholder messaging." },
  { day: 5, title: "Strategic Thinking Challenge", icon: Target, desc: "Tackle a strategic thinking challenge with AI feedback." },
  { day: 6, title: "Decision-Making Exercise", icon: Scale, desc: "Work through a high-stakes decision scenario." },
  { day: 7, title: "Executive Progress Review", icon: TrendingUp, desc: "Review your week and measure your readiness growth." },
];

export default function CoachingPlan7Day({ opportunity }) {
  const focus = opportunity || "your growth area";
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Clock size={15} className="text-accent-orange" /> Your 7-Day Executive Coaching Plan™</h3>
          <p className="text-[11px] text-white/40 mt-0.5">15–20 minutes a day · focused on {focus}</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange font-medium">Personalized</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
        {DAYS.map((d, i) => (
          <motion.div
            key={d.day}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-xl bg-white/[0.03] border border-white/8 p-3 hover:border-accent-orange/25 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-lg bg-accent-orange/10 flex items-center justify-center"><d.icon size={13} className="text-accent-orange" /></div>
              <span className="text-[9px] text-white/30 font-mono">DAY {d.day}</span>
            </div>
            <div className="text-[12px] font-semibold text-white leading-tight mb-1">{d.title}</div>
            <p className="text-[10px] text-white/40 leading-snug">{d.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}