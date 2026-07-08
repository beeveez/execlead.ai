import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Search, UserPlus, Check, AlertCircle } from "lucide-react";
import { enrollUserInProgram, formatMembershipNumber } from "@/lib/membershipEngine";

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all";

export default function EnrollUserModal({ program, adminUser, onEnrolled, onClose }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const list = await base44.entities.User.list("-created_date", 200);
        setUsers(list);
      } catch (e) {
        setUsers([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [u.email, u.full_name].some((v) => String(v || "").toLowerCase().includes(q));
  });

  const handleEnroll = async () => {
    if (!selected) return;
    setEnrolling(true);
    setError("");
    try {
      await enrollUserInProgram({
        program,
        user: selected,
        assignedBy: { id: adminUser?.id, name: adminUser?.full_name || adminUser?.email },
      });
      onEnrolled();
    } catch (e) {
      setError(e.message || "Failed to enroll user");
    }
    setEnrolling(false);
  };

  const previewNumber = formatMembershipNumber(program.membership_number_prefix, program.next_sequence || 1);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d0d14] z-10">
          <div>
            <h3 className="text-lg font-bold text-white">Enroll Member</h3>
            <p className="text-white/40 text-xs mt-0.5">{program.name} · Next: <span className="font-mono text-indigo-400">{previewNumber}</span></p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className={`${inputClass} pl-9`} placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* User list */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-white/30 text-sm py-8">No users found</div>
            ) : (
              filtered.slice(0, 50).map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    selected?.id === u.id ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-sm font-bold text-indigo-400 shrink-0">
                    {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white/80 text-sm font-medium truncate">{u.full_name || "Unnamed"}</div>
                    <div className="text-white/30 text-xs truncate">{u.email}</div>
                  </div>
                  {selected?.id === u.id && <Check size={16} className="text-indigo-400 shrink-0" />}
                </button>
              ))
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/5 border border-red-500/10 rounded-lg p-3">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Selected summary */}
          {selected && (
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-white/40">Member</span><span className="text-white/70">{selected.full_name || selected.email}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Membership #</span><span className="text-indigo-400 font-mono">{previewNumber}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Discount</span><span className="text-emerald-400">{program.discount_percentage || 0}%</span></div>
              <div className="flex justify-between"><span className="text-white/40">Duration</span><span className="text-white/70">{program.benefit_duration_type === "lifetime" ? "Lifetime" : `${program.benefit_duration_days} days`}</span></div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5 sticky bottom-0 bg-[#0d0d14]">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-white/40 hover:text-white/70 text-sm transition-colors">Cancel</button>
          <button onClick={handleEnroll} disabled={!selected || enrolling} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
            {enrolling ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Enroll Member
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}