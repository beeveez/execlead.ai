import React, { useState } from "react";
import { MessageSquare, Bug, Lightbulb, X, Loader2, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const FEEDBACK_TYPES = {
  feedback: { id: "feedback", label: "Send Feedback", icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  bug: { id: "bug", label: "Report Bug", icon: Bug, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  feature: { id: "feature", label: "Suggest Feature", icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(null);
  const [description, setDescription] = useState("");
  const [page, setPage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (!user) return null;

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      const typeMap = { feedback: "general", bug: "bug", feature: "feature" };
      await base44.entities.Feedback.create({
        type: typeMap[type] || "general",
        title: `${FEEDBACK_TYPES[type].label} — ${new Date().toLocaleDateString()}`,
        description: description.trim() + (page.trim() ? `\n\nPage: ${page.trim()}` : `\n\nPage: ${window.location.pathname}`),
        status: "new",
        severity: type === "bug" ? "high" : "medium",
      });
      toast({ title: "Thank you!", description: `${FEEDBACK_TYPES[type].label} submitted successfully.` });
      setOpen(false);
      setType(null);
      setDescription("");
      setPage("");
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div className="fixed right-6 z-40 flex flex-col gap-2" style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}>
        <button
          onClick={() => setOpen(true)}
          title="Send feedback, report bugs, or suggest features"
          aria-label="Open feedback center"
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-colors"
        >
          <MessageSquare size={14} /> Feedback
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-6 z-40 w-80" style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-sm font-bold text-white">
            {type ? FEEDBACK_TYPES[type].label : "Feedback Center™"}
          </span>
          <button
            onClick={() => { setOpen(false); setType(null); }}
            className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Type Selection */}
        {!type && (
          <div className="p-3 space-y-2">
            {Object.values(FEEDBACK_TYPES).map((ft) => (
              <button
                key={ft.id}
                onClick={() => setType(ft.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg border ${ft.bg} ${ft.border} hover:opacity-80 transition-opacity text-left`}
              >
                <ft.icon size={16} className={ft.color} />
                <span className="text-xs font-medium text-white">{ft.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        {type && (
          <div className="p-3 space-y-3">
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                autoFocus
                className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 transition-colors resize-none"
                placeholder={type === "bug" ? "Describe the bug — what happened, what you expected..." : type === "feature" ? "What feature would you like to see?" : "Share your thoughts..."}
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1">Page / Context (optional)</label>
              <input
                value={page}
                onChange={(e) => setPage(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 transition-colors"
                placeholder={window.location.pathname}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!description.trim() || submitting}
              className="w-full flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium transition-colors"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}