import React from "react";
import { motion } from "framer-motion";
import { Quote, Users, Building2, BarChart3, Star } from "lucide-react";

const METRICS = [
  { icon: Star, value: "11", label: "AI Personas" },
  { icon: Building2, value: "126+", label: "Companies" },
  { icon: BarChart3, value: "12", label: "Leadership Dimensions" },
  { icon: Users, value: "18", label: "Learning Paths" },
];

export default function SocialProofSection() {
  return (
    <section className="py-20 md:py-32 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Future Leaders</h2>
          <p className="text-white/40 max-w-2xl mx-auto">Helping ambitious technology professionals develop the skills, confidence, and executive mindset needed for leadership success.</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {METRICS.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center"
            >
              <m.icon size={20} className="text-accent-orange mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{m.value}</div>
              <div className="text-white/30 text-sm mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonial Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/5 border-dashed rounded-2xl p-6 text-center"
            >
              <Quote size={24} className="text-white/10 mx-auto mb-4" />
              <div className="h-4 bg-white/5 rounded mb-2 w-3/4 mx-auto" />
              <div className="h-4 bg-white/5 rounded mb-2 w-1/2 mx-auto" />
              <div className="h-4 bg-white/5 rounded w-2/3 mx-auto mb-4" />
              <div className="w-10 h-10 bg-white/5 rounded-full mx-auto mb-2" />
              <div className="h-3 bg-white/5 rounded w-24 mx-auto" />
              <p className="text-white/20 text-xs mt-3">Your story could be here</p>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Logos Placeholder */}
        <div className="border-t border-white/5 pt-12">
          <h3 className="text-center text-sm font-semibold text-white/40 uppercase tracking-wider mb-6">Enterprise Partnerships in Progress</h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-24 bg-white/5 rounded-lg" />
            ))}
          </div>
          <p className="text-center text-white/20 text-xs mt-4">Enterprise partnerships in progress</p>
        </div>
      </div>
    </section>
  );
}