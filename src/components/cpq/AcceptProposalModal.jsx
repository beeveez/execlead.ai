import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, FileSignature, Lock, FileText, Building2, Sparkles } from "lucide-react";

export default function AcceptProposalModal({ quote, breakdown, catalog, onAccept, onClose }) {
  const [processing, setProcessing] = useState(false);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      await onAccept();
    } finally {
      setProcessing(false);
    }
  };

  const steps = [
    { icon: Lock, label: "Lock Proposal Pricing", desc: "Configuration and pricing are frozen" },
    { icon: FileSignature, label: "Generate Contract", desc: "Master Service Agreement + Subscription Agreement" },
    { icon: FileText, label: "Generate Invoice", desc: `Invoice for ${quote.currency} ${(quote.grand_total || 0).toLocaleString()}` },
    { icon: Building2, label: "Enable Customer Portal", desc: "Self-service portal access activated" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Sparkles size={18} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Accept Proposal</h2>
                <p className="text-white/40 text-xs">{quote.proposal_number}</p>
              </div>
            </div>
            {!processing && (
              <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors p-1">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="p-5">
            <p className="text-white/50 text-sm mb-4">
              Accepting this proposal will initiate the order-to-cash workflow. The following actions will be performed automatically:
            </p>

            <div className="space-y-3 mb-5">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <step.icon size={14} className="text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white/70 font-medium">{step.label}</div>
                    <div className="text-xs text-white/30">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Contract Value</span>
                <span className="text-lg font-bold text-emerald-400">{quote.currency} {(quote.grand_total || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-white/40">Contract Length</span>
                <span className="text-sm text-white/60">{quote.contract_length_years || 1} year(s)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={processing}
                className="flex-1 py-2.5 rounded-lg text-white/40 hover:text-white/70 text-sm font-medium transition-colors disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
              >
                {processing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : <><Check size={14} /> Accept & Generate Contract</>}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}