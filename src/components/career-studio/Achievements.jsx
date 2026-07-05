import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { callAI } from "@/lib/ai";
import { Trophy, Plus, Trash2, Search, Star, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Achievements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [improving, setImproving] = useState(null);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try { const list = await base44.entities.CareerDocument.filter({ type: "achievement" }); setItems(list); } catch (e) {}
    setLoading(false);
  };

  const save = async () => {
    if (!form.content.trim()) return;
    try {
      await base44.entities.CareerDocument.create({ type: "achievement", title: form.title || "Achievement", content: form.content });
      setForm({ title: "", content: "" });
      setShowForm(false);
      loadItems();
    } catch (e) {}
  };

  const improve = async (id, text) => {
    setImproving(id);
    try {
      const res = await callAI("resume", { prompt: `Rewrite this achievement in powerful executive language. Never invent metrics. Return only the rewritten text:\n\n${text}` });
      await base44.entities.CareerDocument.update(id, { content: res });
      loadItems();
    } catch (e) {}
    setImproving(null);
  };

  const filtered = items.filter(i => (i.title + i.content).toLowerCase().includes(search.toLowerCase()));
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search achievements..." className={`${inputClass} pl-9`} />
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium transition-colors">
          <Plus size={14} /> Add Achievement
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Achievement title" className={inputClass} />
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Describe your achievement..." rows={3} className={`${inputClass} resize-none`} />
          <button onClick={save} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">Save Achievement</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Trophy size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">{search ? "No achievements match your search." : "No achievements yet. Add your first measurable accomplishment."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <Star size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium text-sm">{item.title}</h4>
                    <p className="text-white/50 text-xs mt-1">{item.content}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => improve(item.id, item.content)} disabled={improving === item.id} className="text-indigo-400 hover:text-indigo-300 p-1">
                    {improving === item.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  </button>
                  <button onClick={async () => { await base44.entities.CareerDocument.delete(item.id); loadItems(); }} className="text-white/30 hover:text-red-400 p-1"><Trash2 size={12} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}