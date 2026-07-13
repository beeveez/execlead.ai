import React from "react";
import { motion } from "framer-motion";
import { Zap, Crown } from "lucide-react";

const BETA_BENEFITS = [
  { icon: "🚀", title: "Early Platform Access", desc: "Be among the first to explore EXECLEAD.AI before public release." },
  { icon: "🤖", title: "New AI Capabilities", desc: "Direct access to cutting-edge AI executive tools as they ship." },
  { icon: "💡", title: "Priority Feature Requests", desc: "Your feedback shapes the product roadmap — submitted directly to our team." },
  { icon: "🎙", title: "EXEC™ Founder Sessions", desc: "Exclusive sessions with the EXECLEAD.AI founding team." },
  { icon: "🛟", title: "Dedicated Support", desc: "White-glove onboarding and a direct line to our engineering team." },
  { icon: "🌐", title: "Exclusive Beta Community", desc: "Join a private circle of executive leaders shaping the platform." },
];

const GA_BENEFITS = [
  { icon: "🏅", title: "Lifetime Founding Member Badge", desc: "A permanent badge on your profile recognizing your early contribution." },
  { icon: "🔒", title: "Locked-in Pricing", desc: "Special founding pricing protected even as subscription prices increase." },
  { icon: "📜", title: "Founding Members Registry", desc: "Optional recognition in the official Founding Members registry." },
  { icon: "🗺", title: "Priority Roadmap Influence", desc: "Weighted voting on future capabilities and enterprise features." },
  { icon: "🏢", title: "Early Enterprise Access", desc: "First access to enterprise-grade capabilities at General Availability." },
];

export default function BetaBenefits() {
  return (
    <div className="space-y-8">
      {/* Immediate Beta Benefits */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <Zap size={16} className="text-amber-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">Beta Access — Immediate</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BETA_BENEFITS.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-white/[0.03] border border-white/5 rounded-xl p-5"
            >
              <div className="text-2xl mb-3">{b.icon}</div>
              <h4 className="text-white font-semibold text-sm mb-1.5">{b.title}</h4>
              <p className="text-white/40 text-xs leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* General Availability Benefits */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <Crown size={16} className="text-indigo-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">Founding Membership — General Availability</h3>
          <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] text-indigo-400 font-medium uppercase tracking-wider">
            Post-GA
          </span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GA_BENEFITS.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-white/[0.03] border border-white/5 rounded-xl p-5"
            >
              <div className="text-2xl mb-3">{b.icon}</div>
              <h4 className="text-white font-semibold text-sm mb-1.5">{b.title}</h4>
              <p className="text-white/40 text-xs leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}