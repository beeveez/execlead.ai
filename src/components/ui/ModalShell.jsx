import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * EXECLEAD.AI Modal Standard
 * - Sticky header (title + Close X), always visible while scrolling
 * - Sticky footer (passed via `footer` prop)
 * - ESC key closes
 * - Outside click closes (when closeOnOutsideClick)
 * - Body scroll lock while open; only modal body scrolls
 * - Max height ~90vh with internal smooth scrolling
 * - Subtle enter/exit animations
 *
 * onClose should be wrapped by the consumer if it needs to confirm
 * unsaved changes (see ShareModal for the discard-changes pattern).
 */
export default function ModalShell({ open, onClose, title, subtitle, children, footer, maxWidth = "max-w-3xl", closeOnOutsideClick = true }) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", handleEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeOnOutsideClick ? onClose : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-[#0d0d14] border border-white/10 rounded-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden shadow-2xl`}
          >
            {/* Sticky header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/5 shrink-0 bg-[#0d0d14] z-10">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{title}</h2>
                {subtitle && <p className="text-white/30 text-xs truncate mt-0.5">{subtitle}</p>}
              </div>
              <button onClick={onClose} aria-label="Close" className="text-white/30 hover:text-white/60 p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth px-5 py-5">
              {children}
            </div>

            {/* Sticky footer */}
            {footer && (
              <div className="px-5 py-3.5 border-t border-white/5 shrink-0 bg-[#0d0d14]">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}