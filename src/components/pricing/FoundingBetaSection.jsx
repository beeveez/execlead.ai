import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Gift, Users, MessageSquare, ArrowRight } from "lucide-react";

const BETA_FEATURES = [
  { icon: Mail, title: "Invitation Only", desc: "Access is granted through application and approval — not open registration." },
  { icon: Gift, title: "Complimentary Access", desc: "No payment required during the beta program. All features are free for approved participants." },
  { icon: Users, title: "Limited Seats", desc: "A select group of executives and organizations shaping the platform before GA." },
  { icon: MessageSquare, title: "Feedback Program", desc: "Active feedback, bug reports, and feature requests shape the product roadmap." },
];

export default function FoundingBetaSection() {
  return (
    <section className="pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 font-medium mb-4">
            🚀 Founding Private Beta™
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Current Access: Founding Private Beta™</h2>
          <p className="text-white/40 max-w-2xl mx-auto text-sm md:text-base">
            EXECLEAD.AI is currently available through an invitation-only beta program. No subscriptions, no payments — just partnership in building the future of executive leadership.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {BETA_FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.03] border border-amber-500/15 rounded-2xl p-5 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center mx-auto mb-3">
                <f.icon size={18} className="text-amber-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1.5">{f.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/beta"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-7 py-3 rounded-xl transition-colors"
          >
            Apply for Founding Private Beta™ <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}