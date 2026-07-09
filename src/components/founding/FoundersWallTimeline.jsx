import React from "react";
import { motion } from "framer-motion";
import { Flag, Rocket, Users, CreditCard, Trophy, Star } from "lucide-react";

const MILESTONE_ICONS = {
  first_reservation: Flag,
  first_payment: CreditCard,
  "100_founders": Users,
  "500_founders": Users,
  "1000_founders": Users,
  product_release: Rocket,
  founder_milestone: Trophy,
};

export default function FoundersWallTimeline({ milestones }) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy size={32} className="text-amber-400/30 mx-auto mb-3" />
        <p className="text-white/30 text-sm">Founder milestones will appear here as the community grows.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/30 via-amber-500/10 to-transparent md:-translate-x-1/2" />

      <div className="space-y-6">
        {milestones.map((m, i) => {
          const Icon = MILESTONE_ICONS[m.type] || Star;
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`relative flex items-center gap-4 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              {/* Icon node */}
              <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center z-10 flex-shrink-0">
                <Icon size={14} className="text-amber-400" />
              </div>

              {/* Content card */}
              <div className={`ml-12 md:ml-0 md:w-5/12 ${isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"}`}>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-amber-500/20 transition-colors">
                  <div className="text-amber-400/60 text-xs mb-1">
                    {m.date ? new Date(m.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-1">{m.title}</h4>
                  {m.description && <p className="text-white/40 text-xs">{m.description}</p>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}