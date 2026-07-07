import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

const ROLES = [
  { id: "Enterprise User", label: "Enterprise User" },
  { id: "Enterprise Manager", label: "Enterprise Manager" },
  { id: "Enterprise Admin", label: "Enterprise Admin" },
  { id: "Organization Owner", label: "Organization Owner" },
];

export default function EditUserModal({ member, departments, managers, onSave, onClose }) {
  const [form, setForm] = useState({
    custom_role: member?.custom_role || "Enterprise User",
    department: member?.department || "",
    manager_name: member?.manager_name || "",
    status: member?.status || "active",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const manager = managers.find((m) => m.full_name === form.manager_name);
    await onSave({
      ...form,
      manager_id: manager?.id || "",
      department_id: departments.find((d) => d.name === form.department)?.id || "",
    });
    setSaving(false);
  };

  const field = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 [&>option]:bg-[#0d0d14] [&>option]:text-white";

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h2 className="text-lg font-bold text-white">Edit Member</h2>
              <p className="text-white/30 text-xs">{member?.full_name || "Unknown"}</p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={20} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Role</label>
              <select value={form.custom_role} onChange={(e) => setForm((f) => ({ ...f, custom_role: e.target.value }))} className={field}>
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Department</label>
              <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className={field}>
                <option value="">Unassigned</option>
                {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Manager</label>
              <select value={form.manager_name} onChange={(e) => setForm((f) => ({ ...f, manager_name: e.target.value }))} className={field}>
                <option value="">No Manager</option>
                {managers.map((m) => <option key={m.id} value={m.full_name}>{m.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={field}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              {saving ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}