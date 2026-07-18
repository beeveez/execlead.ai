import React from "react";
import { motion } from "framer-motion";
import { Compass, Rocket, Eye, Map, ArrowUpRight } from "lucide-react";

const INSIGHTS = [
  { icon: Compass, title: "Latest Articles", desc: "Founder perspectives on executive leadership and AI", tag: "Weekly" },
  { icon: Rocket, title: "Platform Updates", desc: "New features, capabilities, and product releases", tag: "Ongoing" },
  { icon: Eye, title: "Vision", desc: "The future of executive leadership development", tag: "Mission" },
  { icon: Map, title: "Roadmap", desc: "Behind-the-scenes development and what's coming next", tag: "Transparent" },
];

export default function FounderInsightsSection() {
  return (
    <section className="py-20 md:py-32 px-6 lg:px-8 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 mb-4">
            <Compass size={12} />
            Founder Insights
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">From the Founder's Desk</h2>
          <p className="text-white/40 max-w-2xl mx-auto">Vision, roadmap, and behind-the-scenes development from the EXECLEAD.AI founding team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {INSIGHTS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-amber-500/20 transition-all cursor-default group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <item.icon size={20} className="text-amber-400" />
                </div>
                <span className="text-[10px] text-amber-400/60 font-medium uppercase tracking-wider">{item.tag}</span>
              </div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">{item.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-accent-orange opacity-0 group-hover:opacity-100 transition-opacity">
                Read more <ArrowUpRight size={12} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Founder Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mt-16 text-center"
        >
          <blockquote className="text-xl md:text-2xl font-medium text-white/70 leading-relaxed">
            "EXECLEAD.AI should not only be a platform people use. It should become a platform people trust.
            Authority is earned through consistency. Trust is earned through transparency."
          </blockquote>
          <p className="text-amber-400 text-sm font-medium mt-4">— EXECLEAD.AI Founding Team</p>
        </motion.div>
      </div>
    </section>
  );
}