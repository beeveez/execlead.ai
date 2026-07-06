import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Rocket, Share2, X, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { ACHIEVEMENT_TYPES, buildLinkedInPost, getUserReferralCode } from "@/lib/socialShare";
import ShareCard from "./ShareCard";
import ShareModal from "./ShareModal";

export default function PromotionCelebration({ open, onClose, userName, oldRole, newRole, executiveScore, leadershipLevel, referralCode }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const celebrationRef = useRef(null);

  const achievement = ACHIEVEMENT_TYPES.promotion_achieved;
  const linkedinDraft = buildLinkedInPost({ achievementType: "promotion_achieved", userName, executiveScore, leadershipLevel, customMessage: `I'm excited to share that I've been promoted to ${newRole || "a new role"}!\n\nThank you to everyone who supported my leadership journey. EXECLEAD.AI has been instrumental in preparing me for this next chapter.\n\n#Leadership #Promotion #ExecutiveDevelopment #CareerGrowth #EXECLEAD` });

  useEffect(() => {
    if (!open) return;
    import("canvas-confetti").then(({ default: confetti }) => {
      const burst = () => {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#6366f1", "#a855f7", "#f59e0b", "#10b981"] });
        setTimeout(() => confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 }, angle: 60 }), 200);
        setTimeout(() => confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 }, angle: 120 }), 400);
      };
      burst();
    }).catch(() => {});

    const sendCongratsEmail = async () => {
      try {
        const me = await base44.auth.me();
        if (me?.email) {
          await base44.integrations.Core.SendEmail({
            to: me.email,
            subject: `Congratulations on your promotion to ${newRole || "your new role"}!`,
            body: `Dear ${userName || me.full_name || "Executive"},\n\nCongratulations on your promotion to ${newRole || "your new role"}!\n\nThis is a testament to your dedication to executive leadership development. Your EXECLEAD.AI journey has prepared you well for this next chapter.\n\nExecutive Score: ${executiveScore || "N/A"}/100\nLeadership Level: ${leadershipLevel || "Growing"}\n\nKeep leading with excellence.\n\nBest regards,\nThe EXECLEAD.AI Team`,
            from_name: "EXECLEAD.AI",
          });
          setEmailSent(true);
        }
      } catch (e) {}
    };
    sendCongratsEmail();
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Rocket size={20} className="text-red-400" />
              <h2 className="text-lg font-bold text-white">Congratulations!</h2>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1"><X size={20} /></button>
          </div>

          <div className="p-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="text-center mb-6">
              <div className="text-5xl mb-3">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-1">Promotion Achieved!</h3>
              <p className="text-white/40 text-sm">{userName || "You"} advanced to <span className="text-white/70 font-medium">{newRole}</span></p>
              {emailSent && <p className="text-emerald-400/60 text-xs mt-2 flex items-center justify-center gap-1"><Mail size={12} /> Congratulations email sent</p>}
            </motion.div>

            <div className="flex justify-center mb-6">
              <div style={{ transform: "scale(0.75)", transformOrigin: "top center" }}>
                <ShareCard achievement={achievement} title="Promotion Achieved" userName={userName} executiveScore={executiveScore} leadershipLevel={leadershipLevel} referralCode={referralCode} />
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-4">
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">LinkedIn Draft</label>
              <textarea readOnly value={linkedinDraft} rows={6} className="w-full bg-transparent text-sm text-white/60 resize-none focus:outline-none" />
            </div>

            <button onClick={() => setShareOpen(true)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
              <Share2 size={16} /> Share Your Promotion
            </button>
          </div>
        </motion.div>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} achievement="promotion_achieved" achievementTitle="Promotion Achieved" userName={userName} executiveScore={executiveScore} leadershipLevel={leadershipLevel} referralCode={referralCode} />
    </>
  );
}