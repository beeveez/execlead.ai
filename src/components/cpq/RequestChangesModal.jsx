import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Loader2, Send } from "lucide-react";

export default function RequestChangesModal({ proposalNumber, onSubmit, onClose }) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(notes.trim());
    } finally {
      setSubmitting(false);
    }
  };

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
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <MessageSquare size={18} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Request Changes</h2>
                <p className="text-white/40 text-xs">{proposalNumber}</p>
              </div>
            </div>
            {!submitting && (
              <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors p-1">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="p-5">
            <p className="text-white/50 text-sm mb-3">
              Describe the changes you'd like to this proposal. Our sales team will revise and respond within 24 hours.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 resize-none"
              placeholder="e.g., We'd like to adjust the seat count to 250, add the AI coaching module, and explore a 2-year contract..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-white/40 hover:text-white/70 text-sm font-medium transition-colors disabled:opacity-30"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!notes.trim() || submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Submit Request
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}