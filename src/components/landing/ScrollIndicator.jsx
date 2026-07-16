import React, { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

/**
 * ScrollIndicator™ — Interactive animated scroll cue for landing pages.
 *
 * Props:
 *   targetSection   — CSS selector or element id to smooth-scroll to on click (default: "#features")
 *   showArrow       — show a fading arrow below the mouse (default: true)
 *   enableGlow      — show brand-accent glow on hover (default: true)
 *   hideOnScroll    — fade out after user scrolls >80px, reappear at top (default: true)
 *   animationSpeed  — multiplier for float/wheel durations, 1 = default (default: 1)
 */
export default function ScrollIndicator({
  targetSection = "#features",
  showArrow = true,
  enableGlow = true,
  hideOnScroll = true,
  animationSpeed = 1,
}) {
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!hideOnScroll) return;
    const onScroll = () => setVisible(window.scrollY < 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOnScroll]);

  const handleClick = useCallback(() => {
    const el = document.querySelector(targetSection);
    if (el) el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  }, [targetSection, prefersReduced]);

  const floatDuration = 2 / animationSpeed;
  const wheelDuration = 1.5 / animationSpeed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-2 mt-12 select-none"
        >
          <motion.button
            type="button"
            aria-label="Scroll to explore"
            onClick={handleClick}
            whileHover={prefersReduced ? undefined : { scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative cursor-pointer group outline-none"
          >
            {/* Hover glow */}
            {enableGlow && (
              <span className="absolute inset-0 -m-4 rounded-full bg-indigo-500/0 group-hover:bg-indigo-500/10 blur-xl transition-all duration-500" />
            )}

            {/* Mouse outline — gentle float */}
            <motion.div
              animate={prefersReduced ? undefined : { y: [0, 7, 0] }}
              transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-7 h-11 rounded-full border-2 border-white/25 group-hover:border-indigo-400/50 transition-colors duration-300 flex items-start justify-center pt-2"
            >
              {/* Scroll wheel — moves down then returns */}
              <motion.span
                animate={prefersReduced ? undefined : { y: [0, 10, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: wheelDuration, repeat: Infinity, ease: "easeInOut" }}
                className="block w-1 h-1.5 rounded-full bg-white/40 group-hover:bg-indigo-400/70 transition-colors duration-300"
              />
            </motion.div>
          </motion.button>

          {/* Optional arrow — fades in/out below mouse */}
          {showArrow && (
            <motion.svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              animate={prefersReduced ? undefined : { opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
              className="text-white/30"
            >
              <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}

          {/* Tooltip on hover */}
          <span className="text-[10px] uppercase tracking-widest text-white/0 group-hover:text-white/30 transition-colors duration-500">
            Scroll to explore
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}