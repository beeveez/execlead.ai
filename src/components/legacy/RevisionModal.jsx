import React, { useState } from "react";
import { X, MessageSquare, Loader2 } from "lucide-react";

export default function RevisionModal({ letter, onClose, onRequestRevision, loading }) {
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!notes.trim()) return;
    onRequestRevision(notes.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <MessageSquare size={16} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold">Request Revisions</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
          <p className="text-white/90 text-sm font-medium truncate">{letter.title}</p>
          <p className="text-white/40 text-xs mt-0.5">by {letter.author_name}</p>
          {letter.ai_moderation_score > 0 && (
            <p className="text-white/30 text-xs mt-1">AI Score: {letter.ai_moderation_score}/100 · Recommendation: {letter.ai_recommendation}</p>
          )}
        </div>

        <div>
          <label className="block text-white/40 text-xs mb-1.5">Revision Instructions for Author</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tell the author exactly what needs to be revised before this letter can be approved..."
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 resize-none"
          />
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg text-sm bg-white/5 border border-white/10 text-white/60 hover:text-white/90">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !notes.trim()} className="flex-1 h-10 rounded-lg text-sm bg-blue-500/15 border border-blue-500/20 text-blue-400 hover:bg-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />} Send to Author
          </button>
        </div>
      </div>
    </div>
  );
}