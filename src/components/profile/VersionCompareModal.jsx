import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { summarizeForm, parseSnapshot } from "@/lib/identityVersioning";

const ROWS = [
  { key: "headline", label: "Headline" },
  { key: "company", label: "Current Employer" },
  { key: "experience", label: "Experience", count: true },
  { key: "education", label: "Education", count: true },
  { key: "certifications", label: "Certifications", count: true },
  { key: "skills", label: "Skills", count: true },
  { key: "languages", label: "Languages", count: true },
  { key: "projects", label: "Projects", count: true },
  { key: "awards", label: "Awards", count: true },
];

export default function VersionCompareModal({ version, currentForm, onClose }) {
  const snapshot = useMemo(() => parseSnapshot(version), [version]);
  const left = useMemo(() => summarizeForm(snapshot), [snapshot]);
  const right = useMemo(() => summarizeForm(currentForm), [currentForm]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-base">Compare Versions</h2>
              <p className="text-white/40 text-xs">{version.label || `V${version.version_number}`} vs Current</p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors p-1">
              <X size={18} />
            </button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-[10px] uppercase tracking-wider text-white/30 px-3">{version.label || `V${version.version_number}`}</div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-400 px-3">Current</div>
            </div>
            <div className="space-y-1">
              {ROWS.map((row) => {
                const lv = left[row.key];
                const rv = right[row.key];
                const diff = String(lv) !== String(rv);
                return (
                  <div key={row.key} className="grid grid-cols-2 gap-3 py-2 border-t border-white/5">
                    <div className={`text-xs px-3 truncate ${diff ? "text-amber-400" : "text-white/50"}`}>
                      {row.count ? `${lv} item(s)` : lv}
                    </div>
                    <div className={`text-xs px-3 truncate ${diff ? "text-emerald-400" : "text-white/50"}`}>
                      {row.count ? `${rv} item(s)` : rv}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t border-white/5 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}