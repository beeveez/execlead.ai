import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileSearch, CheckCircle2, AlertCircle } from "lucide-react";
import { EVIDENCE_MAP, DEFAULT_EVIDENCE } from "@/lib/trustCenterExtendedData";

const VERIFICATION_STYLES = {
  self_attested: { label: "Self-Attested", color: "#06b6d4", icon: AlertCircle },
  verified: { label: "Verified", color: "#10b981", icon: CheckCircle2 },
};

export default function EvidencePanel({ itemName, open, onClose }) {
  const evidence = EVIDENCE_MAP[itemName] || DEFAULT_EVIDENCE;
  const verification = VERIFICATION_STYLES[evidence.verificationStatus] || VERIFICATION_STYLES.self_attested;
  const VerifIcon = verification.icon;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <FileSearch size={18} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-indigo-400 uppercase tracking-wider font-medium">Evidence Panel™</div>
                  <h3 className="text-sm font-bold text-white truncate">{itemName}</h3>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Implementation Summary</div>
                  <p className="text-xs text-white/60 leading-relaxed">{evidence.implementationSummary}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Platform Service</div>
                    <p className="text-xs text-white/70">{evidence.platformService}</p>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Responsible Owner</div>
                    <p className="text-xs text-white/70">{evidence.responsibleOwner}</p>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Related Modules</div>
                  <div className="flex flex-wrap gap-1.5">
                    {evidence.relatedModules.map((m) => (
                      <span key={m} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Evidence Source</div>
                  <p className="text-xs text-white/50 leading-relaxed">{evidence.evidenceSource}</p>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${verification.color}15` }}>
                    <VerifIcon size={12} style={{ color: verification.color }} />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">Verification Status</div>
                    <span className="text-xs font-medium" style={{ color: verification.color }}>{verification.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}