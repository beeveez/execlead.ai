import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, ArrowRight, Clock, ListChecks, FileBarChart } from "lucide-react";

const STEPS = [
  { icon: Target, title: "Choose Your Leadership Track", desc: "Select your target executive role across 10 leadership disciplines." },
  { icon: ListChecks, title: "Answer 20 Questions", desc: "A focused 10-minute assessment across 5 executive capability areas." },
  { icon: FileBarChart, title: "Receive Your Report", desc: "Get your Executive Readiness Score™, gap analysis, and 7-day plan instantly." },
];

export default function AssessmentSection({ authed }) {
  return (
    <section className="py-16 md:py-20 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-[11px] text-accent-orange font-semibold mb-3">
            <Clock size={12} /> What Happens First
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Take the Executive Readiness Assessment™</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">Three simple steps. Ten minutes. One personalized executive development plan.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="relative rounded-2xl bg-white/[0.02] border border-white/8 p-5">
              <div className="text-[10px] font-mono text-accent-orange/60 mb-2">STEP {i + 1}</div>
              <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center mb-3"><s.icon size={18} className="text-accent-orange" /></div>
              <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
              <p className="text-white/45 text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to={authed ? "/assessment" : "/beta"} className="inline-flex items-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25">
            Take the Executive Readiness Assessment™ <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}