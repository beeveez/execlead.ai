import React from "react";
import { motion } from "framer-motion";
import { FOUNDING_MEMBER_BENEFITS } from "@/lib/foundingMember";

export default function FoundingMemberBenefits() {
  return (
    <div id="benefits" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 scroll-mt-20">
      {FOUNDING_MEMBER_BENEFITS.map((benefit, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="group bg-gradient-to-br from-white/[0.03] to-transparent border border-amber-500/10 hover:border-amber-500/25 rounded-2xl p-6 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/[0.03] border border-amber-500/15 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
            {benefit.icon}
          </div>
          <h4 className="text-white font-semibold text-sm mb-2">{benefit.title}</h4>
          <p className="text-white/40 text-sm leading-relaxed">{benefit.description}</p>
        </motion.div>
      ))}
    </div>
  );
}