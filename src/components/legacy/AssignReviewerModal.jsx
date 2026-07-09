import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, X, UserCheck } from "lucide-react";

export default function AssignReviewerModal({ letter, onClose, onAssign, loading }) {
  const [reviewers, setReviewers] = useState([]);
  const [selected, setSelected] = useState(letter.assigned_reviewer_id || "");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    base44.functions.invoke("manageLegacyLibrary", { action: "list_reviewers" })
      .then((res) => {
        const d = res.data || res;
        setReviewers(d.reviewers || []);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = () => {
    const reviewer = reviewers.find((r) => r.id === selected);
    onAssign(reviewer?.id || "", reviewer?.full_name || "");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><UserCheck size={18} className="text-indigo-400" /> Assign Reviewer</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>
        <p className="text-white/40 text-sm mb-4">Assign a reviewer to "{letter.title}"</p>
        {fetching ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
        ) : (
          <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
            <button onClick={() => setSelected("")} className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${selected === "" ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/5 border-white/5 hover:bg-white/10"}`}>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 text-xs">—</div>
              <span className="text-white/60 text-sm">Unassigned</span>
            </button>
            {reviewers.map((r) => (
              <button key={r.id} onClick={() => setSelected(r.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${selected === r.id ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/5 border-white/5 hover:bg-white/10"}`}>
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-medium">{r.full_name?.charAt(0) || "?"}</div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-white/80 text-sm font-medium truncate">{r.full_name}</div>
                  <div className="text-white/30 text-xs truncate">{r.email}</div>
                </div>
                {r.role === "admin" && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded">Admin</span>}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm bg-white/5 text-white/60 hover:bg-white/10 border border-white/10">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || fetching} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />} Assign
          </button>
        </div>
      </div>
    </div>
  );
}