import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { LEARNING_PATHS } from "@/lib/constants";
import moment from "moment";

const PRIORITIES = [
  { id: "low", label: "Low", color: "text-emerald-400" },
  { id: "medium", label: "Medium", color: "text-amber-400" },
  { id: "high", label: "High", color: "text-red-400" },
];

export default function AssignmentModal({ members, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    assignee_name: "",
    learning_path: LEARNING_PATHS[0],
    due_date: moment().add(30, "days").format("YYYY-MM-DD"),
    priority: "medium",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim() || !form.assignee_name.trim()) return;
    setSaving(true);
    await onSave({ ...form, status: "assigned", progress: 0, assigned_by_name: "HR Team" });
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-lg font-bold text-white">Assign Learning Path</h2>
            <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={20} /></button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Assignment Title</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Executive Leadership Program"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Assign To</label>
              <select value={form.assignee_name} onChange={(e) => setForm((f) => ({ ...f, assignee_name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                <option value="">Select team member...</option>
                {members.map((m) => <option key={m.id} value={m.full_name || "Unknown"}>{m.full_name || "Unknown"}</option>)}
              </select>
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Learning Path</label>
              <select value={form.learning_path} onChange={(e) => setForm((f) => ({ ...f, learning_path: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                {LEARNING_PATHS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Due Date</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Priority</label>
                <div className="flex gap-1">
                  {PRIORITIES.map((p) => (
                    <button key={p.id} onClick={() => setForm((f) => ({ ...f, priority: p.id }))}
                      className={`flex-1 px-2 py-2.5 rounded-lg text-xs transition-all ${form.priority === p.id ? "bg-white/10 ring-1 ring-white/20" : "bg-white/5 hover:bg-white/10"} ${p.color}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={!form.title.trim() || !form.assignee_name || saving}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              {saving ? <Loader2 size={18} className="animate-spin" /> : "Assign Learning Path"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}