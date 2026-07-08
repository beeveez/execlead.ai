import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database, Sparkles, Flag, RefreshCw, ChevronDown, Info,
} from "lucide-react";
import { DATA_TRANSPARENCY_SECTIONS } from "@/lib/legalCompliance";

const ICON_MAP = { Database, Sparkles, Flag, RefreshCw };

/**
 * Transparency Panel — expandable sections with subtle info icons.
 * Lets users learn: where info comes from, how AI works,
 * how to request corrections, and how data is maintained.
 */
export default function TransparencyPanel({ className = "" }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className={`bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.01]">
        <Info size={14} className="text-blue-400" />
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Data Transparency
        </span>
      </div>
      <div className="divide-y divide-white/5">
        {DATA_TRANSPARENCY_SECTIONS.map((section) => {
          const Icon = ICON_MAP[section.icon] || Info;
          const isOpen = openId === section.id;
          return (
            <div key={section.id}>
              <button
                onClick={() => setOpenId(isOpen ? null : section.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
              >
                <Icon size={15} className="text-blue-400/70 shrink-0" />
                <span className="flex-1 text-sm text-white/70">{section.title}</span>
                <ChevronDown
                  size={14}
                  className={`text-white/30 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 pl-12 text-xs text-white/40 leading-relaxed">
                      {section.content}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}