import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Ban, RotateCcw, Trash2, Search } from "lucide-react";
import { getProgramMembers, updateMembershipStatus, revokeMembership, MEMBERSHIP_STATUSES } from "@/lib/membershipEngine";

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all";

export default function MembersPanel({ program, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await getProgramMembers(program.id);
      setMembers(list);
    } catch (e) {
      setMembers([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [program.id]);

  const handleStatusChange = async (membershipId, newStatus) => {
    setUpdating(membershipId);
    try {
      await updateMembershipStatus(membershipId, newStatus);
      setMembers((prev) => prev.map((m) => (m.id === membershipId ? { ...m, status: newStatus } : m)));
    } catch (e) {}
    setUpdating(null);
  };

  const handleRevoke = async (membershipId) => {
    if (!confirm("Permanently revoke this membership? This cannot be undone.")) return;
    setUpdating(membershipId);
    try {
      await revokeMembership(membershipId);
      setMembers((prev) => prev.filter((m) => m.id !== membershipId));
    } catch (e) {}
    setUpdating(null);
  };

  const filtered = members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [m.user_name, m.user_email, m.membership_number].some((v) => String(v || "").toLowerCase().includes(q));
  });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <div>
            <h3 className="text-lg font-bold text-white">{program.name} — Members</h3>
            <p className="text-white/40 text-xs mt-0.5">{members.length} enrolled · Next: <span className="font-mono text-indigo-400">{program.membership_number_prefix}-{String(program.next_sequence || 1).padStart(6, "0")}</span></p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className={`${inputClass} pl-9`} placeholder="Search by name, email, or membership number..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-white/30 text-sm py-12">No members found</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((m) => {
                const status = MEMBERSHIP_STATUSES[m.status] || MEMBERSHIP_STATUSES.active;
                return (
                  <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-sm font-bold text-indigo-400 shrink-0">
                      {(m.user_name || m.user_email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white/80 text-sm font-medium truncate">{m.user_name || "Unnamed"}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color} shrink-0`}>{status.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/30 text-xs mt-0.5">
                        <span className="font-mono text-indigo-400/70">{m.membership_number}</span>
                        <span className="truncate">{m.user_email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {m.status === "active" ? (
                        <button onClick={() => handleStatusChange(m.id, "suspended")} disabled={updating === m.id} className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/10 text-white/40 hover:text-amber-400 transition-colors" title="Suspend">
                          {updating === m.id ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                        </button>
                      ) : (
                        <button onClick={() => handleStatusChange(m.id, "active")} disabled={updating === m.id} className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/10 text-white/40 hover:text-emerald-400 transition-colors" title="Reactivate">
                          {updating === m.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                        </button>
                      )}
                      <button onClick={() => handleRevoke(m.id)} disabled={updating === m.id} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors" title="Revoke">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}