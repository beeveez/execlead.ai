import React, { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Lock, Shield, Fingerprint, Calendar, ArrowRight } from "lucide-react";

export default function CapsuleSuccess({ capsule, founderNumber, onContinue }) {
  const unlockDate = new Date(capsule.unlock_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const sealedDate = capsule.sealed_at ? new Date(capsule.sealed_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#f59e0b", "#fbbf24", "#fde68a"];

    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <div className="max-w-xl mx-auto text-center py-8">
      {/* Seal Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center gold-glow"
      >
        <Lock size={36} className="text-amber-400" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Congratulations!</h1>
        <p className="text-white/60 text-lg mb-1">Your Founder Time Capsule has been sealed.</p>
        <p className="text-white/40 text-sm mb-8">Your legacy has become part of EXECLEAD.AI history.</p>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 rounded-2xl p-6 mb-8"
      >
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-amber-400 flex-shrink-0" />
            <span className="text-white/40 text-sm">Opens on</span>
            <span className="text-amber-400 font-medium text-sm ml-auto">{unlockDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-amber-400 flex-shrink-0" />
            <span className="text-white/40 text-sm">Founder Number</span>
            <span className="text-white/80 font-medium text-sm ml-auto">{founderNumber || capsule.founding_member_number}</span>
          </div>
          <div className="flex items-center gap-3">
            <Fingerprint size={16} className="text-amber-400 flex-shrink-0" />
            <span className="text-white/40 text-sm">Capsule ID</span>
            <span className="text-white/80 font-mono text-sm ml-auto">{capsule.capsule_id}</span>
          </div>
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-amber-400 flex-shrink-0" />
            <span className="text-white/40 text-sm">Sealed on</span>
            <span className="text-white/80 text-sm ml-auto">{sealedDate}</span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium px-8 py-3.5 rounded-xl transition-colors"
        >
          View Sealed Capsule <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}