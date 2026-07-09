import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ListChecks, Loader2, Check } from "lucide-react";
import { MODERATOR_CHECKLIST } from "@/lib/legacyLibrary";

const safeParse = (str) => {
  try { return JSON.parse(str) || {}; } catch { return {}; }
};

export default function ModeratorChecklist({ letterId, checklistJson }) {
  const [items, setItems] = useState(() => safeParse(checklistJson));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = async (key) => {
    const updated = { ...items, [key]: !items[key] };
    setItems(updated);
    setSaving(true);
    setSaved(false);
    try {
      await base44.functions.invoke("manageLegacyLibrary", { action: "save_checklist", letter_id: letterId, checklist: updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {}
    setSaving(false);
  };

  const checkedCount = MODERATOR_CHECKLIST.filter((item) => items[item]).length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListChecks size={14} className="text-indigo-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Moderator Checklist</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {saving && <Loader2 size={10} className="animate-spin text-white/30" />}
          {saved && <span className="flex items-center gap-0.5 text-emerald-400 text-[10px]"><Check size={10} /> Saved</span>}
          <span className="text-white/30 text-[10px]">{checkedCount}/{MODERATOR_CHECKLIST.length}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {MODERATOR_CHECKLIST.map((item) => (
          <button key={item} onClick={() => toggle(item)} className="w-full flex items-center gap-2.5 text-left group">
            <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${items[item] ? "bg-emerald-500/20 border-emerald-500/40" : "bg-white/5 border-white/10 group-hover:border-white/20"}`}>
              {items[item] && <Check size={10} className="text-emerald-400" />}
            </span>
            <span className={`text-xs ${items[item] ? "text-white/70" : "text-white/40"}`}>{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}