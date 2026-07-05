import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FolderKanban, Plus, Trash2, X, Loader2, Award, BookOpen, Mic, FileText, Star } from "lucide-react";
import { motion } from "framer-motion";

const ITEM_TYPES = [
  { id: "project", label: "Project", icon: FolderKanban },
  { id: "award", label: "Award", icon: Award },
  { id: "certification", label: "Certification", icon: BookOpen },
  { id: "speaking", label: "Speaking Engagement", icon: Mic },
  { id: "article", label: "Article / Case Study", icon: FileText },
  { id: "achievement", label: "Achievement", icon: Star },
];

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subtype: "project", title: "", content: "" });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try { const list = await base44.entities.CareerDocument.filter({ type: "portfolio" }); setItems(list); } catch (e) {}
    setLoading(false);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    try {
      await base44.entities.CareerDocument.create({ type: "portfolio", title: form.title, content: form.content, subtype: form.subtype });
      setForm({ subtype: "project", title: "", content: "" });
      setShowForm(false);
      loadItems();
    } catch (e) {}
  };

  const remove = async (id) => {
    await base44.entities.CareerDocument.delete(id);
    loadItems();
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";

  const grouped = ITEM_TYPES.map(t => ({ ...t, items: items.filter(i => i.subtype === t.id) }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">Showcase your projects, awards, certifications, leadership journey, and more</p>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium transition-colors">
          <Plus size={14} /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/60">New Portfolio Item</h3>
            <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/60"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {ITEM_TYPES.map(t => (
              <button key={t.id} onClick={() => setForm(f => ({ ...f, subtype: t.id }))} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all ${form.subtype === t.id ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
                <t.icon size={12} /> {t.label}
              </button>
            ))}
          </div>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" className={inputClass} />
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Description..." rows={3} className={`${inputClass} resize-none`} />
          <button onClick={save} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">Save Item</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <FolderKanban size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No portfolio items yet. Add your first project, award, or achievement.</p>
        </div>
      ) : (
        grouped.map(group => group.items.length > 0 && (
          <div key={group.id}>
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2"><group.icon size={14} /> {group.label}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.items.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 group">
                  <div className="flex items-start justify-between">
                    <h4 className="text-white font-medium text-sm">{item.title}</h4>
                    <button onClick={() => remove(item.id)} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                  </div>
                  {item.content && <p className="text-white/40 text-xs mt-2 line-clamp-3">{item.content}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}