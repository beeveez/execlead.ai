import React from "react";
import { motion } from "framer-motion";
import { FOUNDING_MEMBER_BENEFITS } from "@/lib/foundingMember";

export default function FoundingMemberBenefits() {
  return (
    <div id="benefits" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-mt-20">
      {FOUNDING_MEMBER_BENEFITS.map((benefit, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ y: -4 }}
          className="group bg-card border border-border rounded-2xl p-7 shadow-sm hover:shadow-lg transition-shadow"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-500/[0.03] border border-amber-500/15 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
            {benefit.icon}
          </div>
          <h4 className="text-foreground font-semibold text-base mb-2">{benefit.title}</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
        </motion.div>
      ))}
    </div>
  );
}