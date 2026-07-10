import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import MarketingNav from "./MarketingNav";
import MarketingFooter from "./MarketingFooter";
import EarlyAccessBanner from "./EarlyAccessBanner";
import ExecConcierge from "@/components/concierge/ExecConcierge";

/**
 * MarketingLayout — persistent shell for all public marketing pages.
 *
 * Used as a layout route (<Route element={<MarketingLayout />}>) so the
 * nav + footer never unmount during navigation — only the page content
 * inside <Outlet /> changes, with a smooth 250ms fade transition.
 *
 * Also supports the legacy children pattern for pages that still wrap
 * themselves (e.g. Legal).
 */
export default function MarketingLayout({ children }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#08080d] text-white overflow-x-hidden">
      <EarlyAccessBanner />
      <MarketingNav />
      <main>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children || <Outlet />}
        </motion.div>
      </main>
      <MarketingFooter />
      <ExecConcierge />
    </div>
  );
}