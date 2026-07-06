import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Pencil, Save, X, Loader2 } from "lucide-react";
import { SECTION_COLORS } from "@/lib/legacyData";

export default function LegacySection({ section, value, colorClass, onGenerate, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [generating, setGenerating] = useState(false);

  const hasContent = Boolean(value && value.trim());

  const handleSave = () => {
    onUpdate(section.id, draft);
    setEditing(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const content = await onGenerate(section.id);
      onUpdate(section.id, content);
    } catch (e) {}
    setGenerating(false);
  };

  return (
    <div className="relative pl-12">
      <div className={`absolute left-0 top-0 w-9 h-9 rounded-xl flex items-center justify-center border ${colorClass}`}>
        <section.icon size={16} />
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold text-sm">{section.label}</h3>
            <p className="text-white/30 text-xs">{section.desc}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {!editing && (
              <button onClick={handleGenerate} disabled={generating}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors disabled:opacity-50">
                {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {generating ? "Generating..." : "AI"}
              </button>
            )}
            {!editing && hasContent && (
              <button onClick={() => { setDraft(value); setEditing(true); }} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs transition-colors"><Pencil size={12} /> Edit</button>
            )}
            {editing && (
              <>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs transition-colors"><X size={12} /></button>
                <button onClick={handleSave} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"><Save size={12} /> Save</button>
              </>
            )}
          </div>
        </div>
        {editing ? (
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={8}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y"
            placeholder={`Write your ${section.label.toLowerCase()}... (Markdown supported)`} />
        ) : hasContent ? (
          <div className="prose prose-sm prose-invert max-w-none text-white/60 text-sm"><ReactMarkdown>{value}</ReactMarkdown></div>
        ) : (
          <button onClick={handleGenerate} disabled={generating}
            className="w-full text-left text-white/30 text-sm py-4 px-3 rounded-lg border border-dashed border-white/10 hover:border-indigo-500/20 hover:text-white/50 transition-colors">
            {generating ? "Generating with AI..." : `No content yet. Click "AI" to generate your ${section.label.toLowerCase()} or write your own.`}
          </button>
        )}
      </div>
    </div>
  );
}