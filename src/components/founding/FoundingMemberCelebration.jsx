import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { Check, X } from "lucide-react";

const ACTIVATED_BENEFITS = [
  "Lifetime Founding Member Badge",
  "25% Lifetime Discount",
  "Early Access",
  "Private Community Access",
  "Founder Feedback Invitations",
];

export default function FoundingMemberCelebration({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#f59e0b", "#fbbf24", "#fde68a", "#ffffff"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-gradient-to-br from-[#13131a] to-[#0a0a0f] border border-amber-500/30 rounded-3xl p-8 gold-glow"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60">
              <X size={18} />
            </button>
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold gold-shimmer mb-2">Welcome, Founding Member!</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Congratulations! You are officially one of the first members of the EXECLEAD.AI
                community. Your exclusive Founding Member benefits have been activated.
              </p>
              <div className="bg-amber-500/[0.05] border border-amber-500/15 rounded-2xl p-4 mb-6 text-left">
                <p className="text-amber-400/70 text-xs uppercase tracking-wider mb-3">
                  Your account now includes
                </p>
                <ul className="space-y-2">
                  {ACTIVATED_BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <Check size={14} className="text-amber-400 flex-shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/billing"
                  className="w-full bg-white/5 hover:bg-white/10 text-white/60 font-medium py-3 rounded-xl transition-colors text-sm"
                >
                  View My Benefits
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}