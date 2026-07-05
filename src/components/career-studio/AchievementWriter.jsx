import React, { useState } from "react";
import { callAI } from "@/lib/ai";
import { buildAchievementPrompt } from "@/lib/careerStudio";
import { X, Sparkles, Loader2, Plus } from "lucide-react";

export default function AchievementWriter({ onClose, onAdd }) {
  const [star, setStar] = useState({ situation: "", action: "", result: "", impact: "", metrics: "" });
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!star.situation.trim() && !star.action.trim()) return;
    setLoading(true);
    try {
      const res = await callAI("resume", { prompt: buildAchievementPrompt(star) });
      setGenerated(res);
    } catch (e) {}
    setLoading(false);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-lg font-bold text-white">Achievement Writer</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>
        <p className="text-white/40 text-xs mb-4">Use the STAR method to generate executive-quality achievement bullets. Never invents metrics — only enhances what you provide.</p>

        <div className="space-y-3">
          <div>
            <label className="text-amber-400 text-xs font-medium uppercase tracking-wider mb-1 block">Situation</label>
            <textarea value={star.situation} onChange={e => setStar(s => ({ ...s, situation: e.target.value }))} rows={2} placeholder="What was the context or challenge?" className={inputClass} />
          </div>
          <div>
            <label className="text-amber-400 text-xs font-medium uppercase tracking-wider mb-1 block">Action</label>
            <textarea value={star.action} onChange={e => setStar(s => ({ ...s, action: e.target.value }))} rows={2} placeholder="What did YOU do?" className={inputClass} />
          </div>
          <div>
            <label className="text-amber-400 text-xs font-medium uppercase tracking-wider mb-1 block">Result</label>
            <textarea value={star.result} onChange={e => setStar(s => ({ ...s, result: e.target.value }))} rows={2} placeholder="What was the outcome?" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-amber-400 text-xs font-medium uppercase tracking-wider mb-1 block">Business Impact</label>
              <textarea value={star.impact} onChange={e => setStar(s => ({ ...s, impact: e.target.value }))} rows={2} placeholder="Revenue, cost, efficiency..." className={inputClass} />
            </div>
            <div>
              <label className="text-amber-400 text-xs font-medium uppercase tracking-wider mb-1 block">Metrics</label>
              <textarea value={star.metrics} onChange={e => setStar(s => ({ ...s, metrics: e.target.value }))} rows={2} placeholder="Numbers, percentages..." className={inputClass} />
            </div>
          </div>

          <button onClick={generate} disabled={loading || (!star.situation.trim() && !star.action.trim())} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14} /> Generate Executive Bullet</>}
          </button>

          {generated && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
              <label className="text-emerald-400 text-xs font-medium uppercase tracking-wider mb-2 block">Generated Bullet</label>
              <textarea value={generated} onChange={e => setGenerated(e.target.value)} rows={3} className={inputClass} />
              <button onClick={() => onAdd(generated)} className="w-full mt-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors">
                <Plus size={14} /> Add to Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}