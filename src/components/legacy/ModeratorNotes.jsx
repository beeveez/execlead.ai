import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { StickyNote, Loader2, Check, Save } from "lucide-react";

export default function ModeratorNotes({ letterId, initialNotes }) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (notes === (initialNotes || "")) return;
    setSaving(true);
    setSaved(false);
    try {
      await base44.functions.invoke("manageLegacyLibrary", { action: "save_review_notes", letter_id: letterId, notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {}
    setSaving(false);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote size={14} className="text-amber-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Moderator Notes</h3>
        </div>
        {saved && <span className="flex items-center gap-0.5 text-emerald-400 text-[10px]"><Check size={10} /> Saved</span>}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={save}
        placeholder="Private notes for other moderators…"
        rows={4}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 resize-none"
      />
      <button onClick={save} disabled={saving} className="mt-2 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50">
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Notes
      </button>
    </div>
  );
}