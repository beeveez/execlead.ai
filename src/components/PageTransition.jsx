import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Outlet } from "react-router-dom";

/**
 * PageTransition — wraps the routed Outlet with a sliding transition
 * on every route change. Uses AnimatePresence mode="wait" so the old
 * page slides out before the new one slides in. Duration is kept short
 * (180ms) to feel snappy on both mobile WebView and desktop.
 */
export default function PageTransition() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}