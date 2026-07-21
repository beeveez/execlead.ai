import React, { useRef } from "react";
import { useOutlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * KeepAliveOutlet — keeps core tab pages mounted in the DOM (display:none
 * toggle) instead of unmounting on route switch. Non-keep-alive pages
 * render normally with the animated page transition.
 *
 * On a keep-alive path: caches the outlet element and renders all cached
 * tabs, toggling visibility via display:block / display:none.
 * On any other path: renders the outlet inside an AnimatePresence for the
 * standard slide transition. Cached tabs stay mounted (hidden) so their
 * state (scroll position, form data, loaded results) is preserved.
 */
const KEEP_ALIVE_PATHS = ["/dashboard", "/coach", "/academy", "/profile"];

export default function KeepAliveOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const cachedRef = useRef({});

  const isKeepAlivePath = KEEP_ALIVE_PATHS.includes(location.pathname);

  // Cache the outlet element whenever we're on a keep-alive tab
  if (isKeepAlivePath && outlet) {
    cachedRef.current[location.pathname] = outlet;
  }

  return (
    <>
      {/* Cached keep-alive tabs — always in DOM, visibility toggled */}
      {Object.entries(cachedRef.current).map(([path, el]) => (
        <div
          key={path}
          style={{ display: path === location.pathname ? "block" : "none" }}
        >
          {el}
        </div>
      ))}

      {/* Non-keep-alive pages — animated slide transition */}
      {!isKeepAlivePath && (
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}