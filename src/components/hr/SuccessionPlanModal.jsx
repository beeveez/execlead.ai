import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Loader2 } from "lucide-react";

const DEPARTMENTS = ["Technology", "Operations", "Finance", "Sales", "HR", "Regional", "Strategy", "Customer Success"];
const RISK_LEVELS = [
  { id: "critical", label: "Critical", color: "text-red-400" },
  { id: "high", label: "High", color: "text-orange-400" },
  { id: "medium", label: "Medium", color: "text-amber-400" },
  { id: "low", label: "Low", color: "text-emerald-400" },
];

export default function SuccessionPlanModal({ plan, members, onSave, onClose }) {
  const [form, setForm] = useState({
    role_title: "",
    department: "Technology",
    incumbent_name: "",
    risk_level: "medium",
    status: "identified",
    notes: "",
  });
  const [successors, setSuccessors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setForm({
        role_title: plan.role_title || "",
        department: plan.department || "Technology",
        incumbent_name: plan.incumbent_name || "",
        risk_level: plan.risk_level || "medium",
        status: plan.status || "identified",
        notes: plan.notes || "",
      });
      try {
        setSuccessors(JSON.parse(plan.successors_json || "[]"));
      } catch (e) {
        setSuccessors([]);
      }
    }
  }, [plan]);

  const addSuccessor = () => {
    setSuccessors((prev) => [...prev, { name: "", readiness: 50, notes: "" }]);
  };

  const updateSuccessor = (i, field, value) => {
    setSuccessors((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const removeSuccessor = (i) => {
    setSuccessors((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (!form.role_title.trim()) return;
    setSaving(true);
    await onSave({
      ...form,
      successors_json: JSON.stringify(successors.filter((s) => s.name.trim())),
    });
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
          className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
            <h2 className="text-lg font-bold text-white">{plan ? "Edit Succession Plan" : "New Succession Plan"}</h2>
            <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={20} /></button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Role Title</label>
              <input value={form.role_title} onChange={(e) => setForm((f) => ({ ...f, role_title: e.target.value }))}
                placeholder="e.g., Chief Information Officer"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Department</label>
                <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Incumbent</label>
                <input value={form.incumbent_name} onChange={(e) => setForm((f) => ({ ...f, incumbent_name: e.target.value }))}
                  placeholder="Current role holder"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Risk Level</label>
                <div className="flex gap-1">
                  {RISK_LEVELS.map((r) => (
                    <button key={r.id} onClick={() => setForm((f) => ({ ...f, risk_level: r.id }))}
                      className={`flex-1 px-2 py-2 rounded-lg text-xs transition-all ${form.risk_level === r.id ? "bg-white/10 ring-1 ring-white/20" : "bg-white/5 hover:bg-white/10"} ${r.color}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                  <option value="identified">Identified</option>
                  <option value="developing">Developing</option>
                  <option value="ready">Ready</option>
                  <option value="vacant">Vacant</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/40 text-xs uppercase tracking-wider">Successor Candidates</label>
                <button onClick={addSuccessor} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {successors.length === 0 && <p className="text-white/20 text-xs py-2">No successors added yet.</p>}
                {successors.map((s, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input value={s.name} onChange={(e) => updateSuccessor(i, "name", e.target.value)}
                        placeholder="Successor name" list="member-list"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                      <div className="flex items-center gap-1.5">
                        <input type="range" min="0" max="100" value={s.readiness} onChange={(e) => updateSuccessor(i, "readiness", parseInt(e.target.value))}
                          className="w-20 accent-indigo-500" />
                        <span className="text-xs text-white/60 w-8">{s.readiness}%</span>
                      </div>
                      <button onClick={() => removeSuccessor(i)} className="text-white/20 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                    <input value={s.notes} onChange={(e) => updateSuccessor(i, "notes", e.target.value)}
                      placeholder="Development notes..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/50 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                  </div>
                ))}
              </div>
              <datalist id="member-list">
                {members.map((m) => <option key={m.id} value={m.full_name || ""} />)}
              </datalist>
            </div>

            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Additional context, development plans, timeline..."
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
            </div>

            <button onClick={handleSave} disabled={!form.role_title.trim() || saving}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              {saving ? <Loader2 size={18} className="animate-spin" /> : plan ? "Update Plan" : "Create Plan"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}