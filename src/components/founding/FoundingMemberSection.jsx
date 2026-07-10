import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Clock, ArrowRight, Check, Sparkles, Users } from "lucide-react";
import {
  useFoundingMemberCountdown,
  FOUNDING_MEMBER_TERMS,
} from "@/lib/foundingMember";
import { useSubscription } from "@/lib/SubscriptionContext";
import FoundingMemberCountdown from "./FoundingMemberCountdown";
import FoundingMemberBenefits from "./FoundingMemberBenefits";
import FoundingMemberValueCalc from "./FoundingMemberValueCalc";
import FoundingMemberCelebration from "./FoundingMemberCelebration";

export default function FoundingMemberSection() {
  const { expired } = useFoundingMemberCountdown();
  const [showCelebration, setShowCelebration] = useState(false);
  const { membership } = useSubscription();

  if (expired) return null;

  const alreadyMember = membership?.type === "founding_member";

  const handleJoin = () => {
    if (alreadyMember) {
      setShowCelebration(true);
    } else {
      window.location.href = "/billing?founding=1";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-orange-500/[0.02] to-transparent p-8 md:p-12 lg:p-16"
    >
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-16 md:space-y-20">
        {/* Header + Countdown */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-full mb-6 gold-glow"
            >
              <Crown size={14} className="text-amber-400" />
              <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider">
                Limited Time · Founding Member
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Become a Founding Member
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-4 max-w-md">
              Join the inaugural cohort of EXECLEAD.AI leaders and receive exclusive lifetime
              benefits reserved only for our earliest supporters.
            </p>
            <p className="text-amber-400/60 text-base leading-relaxed max-w-md">
              Once the Founding Member Program closes, it will never be offered again.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-amber-400 mb-6">
              <Clock size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Program Closes In</span>
            </div>
            <FoundingMemberCountdown />
          </div>
        </div>

        {/* Benefits */}
        <FoundingMemberBenefits />

        {/* Why Join */}
        <div className="bg-amber-500/[0.04] border border-amber-500/15 rounded-2xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
              <Sparkles size={18} className="text-amber-400" />
            </div>
            <h3 className="text-white font-semibold text-lg">Why Become a Founding Member?</h3>
          </div>
          <p className="text-white/50 text-base leading-relaxed max-w-3xl">
            You're not simply purchasing a subscription. You're joining the first generation of
            leaders helping shape the future of AI-powered executive leadership development. Your
            early support helps build a platform designed to empower professionals and organizations
            worldwide.
          </p>
        </div>

        {/* Value Calculator */}
        <FoundingMemberValueCalc />

        {/* Limited Availability */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Users size={20} className="text-amber-400" />
          </div>
          <p className="text-amber-100/70 text-base">
            Founding Membership is limited. Available only during the launch period or until all
            available memberships have been claimed.{" "}
            <span className="text-amber-300 font-medium">This opportunity will never return.</span>
          </p>
        </div>

        {/* Terms */}
        <div className="grid md:grid-cols-2 gap-3">
          {FOUNDING_MEMBER_TERMS.map((term, i) => (
            <div key={i} className="flex items-start gap-2.5 text-base text-white/40">
              <Check size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              {term}
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoin}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold px-8 py-4 rounded-xl transition-all gold-glow shadow-lg shadow-amber-500/20"
          >
            <Crown size={18} /> {alreadyMember ? "View My Benefits" : "Become a Founding Member"}{" "}
            <ArrowRight size={16} />
          </motion.button>
          <a
            href="#benefits"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-foreground font-medium px-6 py-4 rounded-xl transition-colors text-sm border border-border"
          >
            View Membership Benefits
          </a>
        </div>
      </div>

      <FoundingMemberCelebration open={showCelebration} onClose={() => setShowCelebration(false)} />
    </motion.div>
  );
}