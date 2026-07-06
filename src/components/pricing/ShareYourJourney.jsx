import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, ArrowRight, Sparkles } from "lucide-react";
import { ACHIEVEMENT_TYPES } from "@/lib/socialShare";
import ShareCard from "@/components/social/ShareCard";

const ACHIEVEMENT_LIST = Object.entries(ACHIEVEMENT_TYPES).slice(0, 12);

export default function ShareYourJourney({ authed }) {
  const sampleAchievement = ACHIEVEMENT_TYPES.certificate_earned;

  return (
    <div>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
          <Share2 size={14} className="text-indigo-400" />
          <span className="text-indigo-400 text-xs font-medium">Share Your Journey</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Celebrate Every Milestone</h2>
        <p className="text-white/40 max-w-2xl mx-auto text-lg">Every achievement deserves recognition. Share your executive leadership milestones with branded cards, LinkedIn posts, and professional certificates.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Achievement grid */}
        <div>
          <h3 className="text-white/50 text-xs uppercase tracking-wider mb-4">Shareable Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ACHIEVEMENT_LIST.map(([key, ach], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col items-center gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: `${ach.color}15` }}>{ach.badge}</div>
                <span className="text-white/40 text-[10px] text-center leading-tight">{ach.label}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-4">+ certificates, referral links, founding member badges, and more</p>
        </div>

        {/* Sample share card */}
        <div className="flex flex-col items-center">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-4">Sample Share Card</div>
          <div style={{ transform: "scale(0.7)", transformOrigin: "top center", marginBottom: -120 }}>
            <ShareCard achievement={sampleAchievement} title="Executive Certificate Earned" userName="Sarah Mitchell" executiveScore={92} leadershipLevel="Senior Leader" referralCode="EXEC-DEMO1234" />
          </div>
          <Link to={authed ? "/dashboard" : "/register"} className="inline-flex items-center gap-2 mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            <Sparkles size={16} /> {authed ? "Share Your Achievements" : "Start Your Journey"} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}