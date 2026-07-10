import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Scale, X } from "lucide-react";

export default function AppealModal({ comment, onClose, onSuccess }) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("manageLegacyLibrary", {
        action: "submit_appeal",
        comment_id: comment.id,
        appeal_reason: reason,
      });
      const d = res.data || res;
      if (d.success) {
        toast({ title: "Appeal submitted", description: "An administrator will review your appeal." });
        onSuccess?.();
        onClose();
      } else {
        toast({ title: d.error || "Failed to submit appeal", variant: "destructive" });
      }
    } catch (e) {
      const msg = e.response?.data?.error || "Failed to submit appeal";
      toast({ title: msg, variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-indigo-400" />
            <h3 className="text-white/90 text-sm font-semibold">Appeal Moderation Decision</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={16} /></button>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-3">
          <div className="text-white/30 text-[10px] mb-1">Your comment:</div>
          <p className="text-white/50 text-xs">{comment.content}</p>
          <div className="text-white/30 text-[10px] mt-1">Action: {comment.moderator_action?.replace(/_/g, " ")}</div>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why you believe this decision should be reversed..."
          rows={4}
          maxLength={3000}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 resize-none mb-3"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="text-xs text-white/40 hover:text-white/60 px-3 py-2">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || !reason.trim()} className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Scale size={14} />} Submit Appeal
          </button>
        </div>
      </div>
    </div>
  );
}