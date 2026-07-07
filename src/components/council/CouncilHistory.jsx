import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RotateCcw, GitCompare, X, Clock, ChevronRight } from "lucide-react";
import { CONSENSUS_STYLES } from "@/lib/councilData";
import moment from "moment";

function safeParse(json, fallback) {
  try { return JSON.parse(json) || fallback; } catch { return fallback; }
}

export default function CouncilHistory({ sessions, onReopen }) {
  const [search, setSearch] = useState("");
  const [compareSel, setCompareSel] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.toLowerCase();
    return sessions.filter((s) => s.question?.toLowerCase().includes(q));
  }, [sessions, search]);

  const toggleCompare = (id) => {
    setCompareSel((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compareSessions = compareSel.map((id) => sessions.find((s) => s.id === id)).filter(Boolean);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-indigo-400" />
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Session History</h3>
        </div>
        {compareSel.length === 2 && (
          <button onClick={() => setShowCompare(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors">
            <GitCompare size={12} /> Compare ({compareSel.length})
          </button>
        )}
      </div>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search previous decisions..."
          className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-white/30 text-sm py-6">No sessions found.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filtered.map((s) => {
            const brief = safeParse(s.decision_brief_json, null);
            const consensus = brief?.consensus_level || s.consensus_level;
            const conf = brief?.confidence_level ?? s.overall_confidence ?? 0;
            const cStyle = CONSENSUS_STYLES[consensus] || CONSENSUS_STYLES.moderate;
            const isCompare = compareSel.includes(s.id);
            return (
              <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isCompare ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
                <button
                  onClick={() => toggleCompare(s.id)}
                  className={`w-4 h-4 rounded border-2 shrink-0 transition-all ${isCompare ? "bg-indigo-500 border-indigo-500" : "border-white/20"}`}
                />
                <button onClick={() => onReopen?.(s)} className="flex items-center gap-2 flex-1 min-w-0 text-left group">
                  <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 transition-colors shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white/70 text-sm truncate">{s.question}</p>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <span>{moment(s.created_date).format("MMM D, YYYY")}</span>
                      <span className={`px-1.5 py-0.5 rounded ${cStyle.bg} ${cStyle.color}`}>{cStyle.label}</span>
                      <span>{conf}% conf</span>
                    </div>
                  </div>
                </button>
                <button onClick={() => onReopen?.(s)} title="Reopen" className="p-1.5 rounded-lg text-white/30 hover:text-indigo-400 hover:bg-white/5 transition-colors shrink-0">
                  <RotateCcw size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showCompare && compareSessions.length === 2 && (
          <CompareModal sessions={compareSessions} onClose={() => { setShowCompare(false); setCompareSel([]); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CompareModal({ sessions, onClose }) {
  const [left, right] = sessions;
  const leftBrief = safeParse(left.decision_brief_json, {});
  const rightBrief = safeParse(right.decision_brief_json, {});

  const rows = [
    { label: "Question", left: left.question, right: right.question },
    { label: "Recommendation", left: leftBrief.recommendation, right: rightBrief.recommendation },
    { label: "Confidence", left: `${leftBrief.confidence_level ?? left.overall_confidence ?? 0}%`, right: `${rightBrief.confidence_level ?? right.overall_confidence ?? 0}%` },
    { label: "Consensus", left: leftBrief.consensus_level || left.consensus_level, right: rightBrief.consensus_level || right.consensus_level },
    { label: "Timeline", left: leftBrief.timeline, right: leftBrief.timeline },
    { label: "Date", left: moment(left.created_date).format("MMM D, YYYY"), right: moment(right.created_date).format("MMM D, YYYY") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-bold">Compare Decisions</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 p-1"><X size={18} /></button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="text-[10px] uppercase tracking-wider text-indigo-400">Session A</div>
            <div className="text-[10px] uppercase tracking-wider text-emerald-400">Session B</div>
          </div>
          <div className="space-y-1">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 py-2 border-t border-white/5">
                <div className="text-xs text-white/60 px-1">{row.left || "—"}</div>
                <div className="text-xs text-white/60 px-1">{row.right || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}