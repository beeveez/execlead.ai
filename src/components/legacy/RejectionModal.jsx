import React, { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { REJECTION_REASONS } from "@/lib/legacyLibrary";

export default function RejectionModal({ letter, onClose, onReject, loading }) {
  const [reason, setReason] = useState("low_quality");
  const [comments, setComments] = useState("");

  const handleSubmit = () => {
    if (!comments.trim()) {
      onReject(reason, "No additional comments provided.");
    } else {
      onReject(reason, comments.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <h2 className="text-lg font-semibold">Reject Letter</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
          <p className="text-white/90 text-sm font-medium truncate">{letter.title}</p>
          <p className="text-white/40 text-xs mt-0.5">by {letter.author_name}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white/40 text-xs mb-1.5">Rejection Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-red-500/50"
            >
              {REJECTION_REASONS.map((r) => (
                <option key={r.value} value={r.value} className="bg-[#0d0d14]">{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/40 text-xs mb-1.5">Comments for Author (optional)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Explain why this letter is being rejected and what would need to change..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-red-500/50 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg text-sm bg-white/5 border border-white/10 text-white/60 hover:text-white/90">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 h-10 rounded-lg text-sm bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Reject Letter
          </button>
        </div>
      </div>
    </div>
  );
}