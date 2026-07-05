import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Plus, Trash2, Loader2, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

const MOODS = [
  { id: "inspired", label: "Inspired", color: "text-amber-400", emoji: "✨" },
  { id: "confident", label: "Confident", color: "text-emerald-400", emoji: "💪" },
  { id: "neutral", label: "Neutral", color: "text-white/40", emoji: "😐" },
  { id: "challenged", label: "Challenged", color: "text-orange-400", emoji: "🔥" },
  { id: "frustrated", label: "Frustrated", color: "text-red-400", emoji: "😤" },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    reflection: "",
    lessons_learned: "",
    leadership_wins: "",
    mistakes: "",
    mood: "neutral",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await base44.entities.JournalEntry.list("-entry_date", 100);
      setEntries(data);
    } catch (e) {}
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.reflection.trim()) return;
    setSaving(true);
    try {
      await base44.entities.JournalEntry.create({
        ...form,
        entry_date: moment().format("YYYY-MM-DD"),
      });
      setForm({ title: "", reflection: "", lessons_learned: "", leadership_wins: "", mistakes: "", mood: "neutral" });
      setShowForm(false);
      await loadEntries();
    } catch (e) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.JournalEntry.delete(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const filtered = entries.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.reflection?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <BookOpen size={12} className="text-amber-400" />
            Executive Journal
          </div>
          <h1 className="text-2xl font-bold text-white">Daily Reflection</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> New Entry
        </button>
      </div>

      {/* Search */}
      {entries.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your journal..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
      )}

      {/* Entries */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-amber-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={32} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/30 text-sm">{entries.length === 0 ? "No journal entries yet. Start reflecting on your leadership journey." : "No entries match your search."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry, i) => {
            const mood = MOODS.find(m => m.id === entry.mood) || MOODS[2];
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{mood.emoji}</span>
                      <h3 className="font-semibold text-white">{entry.title}</h3>
                    </div>
                    <p className="text-white/30 text-xs">{moment(entry.entry_date).format("MMMM D, YYYY")}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-3">{entry.reflection}</p>
                {(entry.lessons_learned || entry.leadership_wins || entry.mistakes) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
                    {entry.lessons_learned && (
                      <div>
                        <div className="text-xs text-indigo-400/70 font-medium mb-1">Lessons</div>
                        <p className="text-white/40 text-xs">{entry.lessons_learned}</p>
                      </div>
                    )}
                    {entry.leadership_wins && (
                      <div>
                        <div className="text-xs text-emerald-400/70 font-medium mb-1">Wins</div>
                        <p className="text-white/40 text-xs">{entry.leadership_wins}</p>
                      </div>
                    )}
                    {entry.mistakes && (
                      <div>
                        <div className="text-xs text-red-400/70 font-medium mb-1">Mistakes</div>
                        <p className="text-white/40 text-xs">{entry.mistakes}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">New Journal Entry</h2>
                <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/60">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Title</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Today's reflection title..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Mood</label>
                  <div className="flex gap-2">
                    {MOODS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setForm(f => ({ ...f, mood: m.id }))}
                        className={`flex-1 px-2 py-2.5 rounded-lg text-xs transition-all ${
                          form.mood === m.id ? "bg-amber-500/15 ring-1 ring-amber-500/30" : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-lg mb-0.5">{m.emoji}</div>
                        <div className={m.color}>{m.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Reflection</label>
                  <textarea
                    value={form.reflection}
                    onChange={e => setForm(f => ({ ...f, reflection: e.target.value }))}
                    placeholder="What happened today? What did you observe about your leadership?"
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Lessons</label>
                    <textarea
                      value={form.lessons_learned}
                      onChange={e => setForm(f => ({ ...f, lessons_learned: e.target.value }))}
                      placeholder="What did you learn?"
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Wins</label>
                    <textarea
                      value={form.leadership_wins}
                      onChange={e => setForm(f => ({ ...f, leadership_wins: e.target.value }))}
                      placeholder="Leadership wins?"
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Mistakes</label>
                    <textarea
                      value={form.mistakes}
                      onChange={e => setForm(f => ({ ...f, mistakes: e.target.value }))}
                      placeholder="What went wrong?"
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!form.title.trim() || !form.reflection.trim() || saving}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : "Save Entry"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}