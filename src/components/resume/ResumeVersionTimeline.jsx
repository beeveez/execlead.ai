import React, { useState } from "react";
import { GitBranch, RotateCcw, GitCompare, Clock, User, Bot, Upload, FileEdit, Sparkles, Save, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const REASON_META = {
  upload: { label: "Upload", icon: Upload, color: "text-sky-400", bg: "bg-sky-500/10" },
  manual_edit: { label: "Manual Edit", icon: FileEdit, color: "text-amber-400", bg: "bg-amber-500/10" },
  ai_rewrite: { label: "AI Rewrite", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10" },
  save_as_new: { label: "Save as New", icon: Save, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  onboarding: { label: "Onboarding", icon: GitBranch, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  import: { label: "Import", icon: Upload, color: "text-cyan-400", bg: "bg-cyan-500/10" },
};

const CREATOR_META = {
  user: { label: "User", icon: User, color: "text-sky-400" },
  ai: { label: "AI", icon: Bot, color: "text-purple-400" },
  system: { label: "System", icon: GitBranch, color: "text-white/40" },
};

function formatRelative(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ResumeVersionTimeline({ versions, current, onSelect, onRestore }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? versions : versions.slice(0, 5);

  return (
    <div className="pt-4 border-t border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GitBranch size={14} className="text-indigo-400" />
          <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">Resume Version History™</h3>
          <span className="text-xs text-white/30">({versions.length} {versions.length === 1 ? "revision" : "revisions"})</span>
        </div>
        {versions.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {showAll ? "Show less" : `Show all ${versions.length}`}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {visible.map((v, i) => {
            const isCurrent = current?.id === v.id;
            const reason = REASON_META[v.creation_reason] || REASON_META.upload;
            const creator = CREATOR_META[v.created_by] || CREATOR_META.user;
            const ReasonIcon = reason.icon;
            const CreatorIcon = creator.icon;
            const versionLabel = `v${v.version_number || versions.length - i}`;

            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-indigo-500/10 border-indigo-500/30"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                }`}
                onClick={() => onSelect(v)}
              >
                {/* Version number + current badge */}
                <div className="flex flex-col items-center gap-1 min-w-[2.5rem]">
                  <span className={`text-sm font-bold ${isCurrent ? "text-indigo-400" : "text-white/40"}`}>{versionLabel}</span>
                  {isCurrent && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-indigo-400">
                      <CheckCircle2 size={10} /> Current
                    </span>
                  )}
                </div>

                {/* Connector line */}
                {i < visible.length - 1 && (
                  <div className="absolute" style={{ display: "none" }} />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-white/80 truncate max-w-[200px]">{v.file_name || "Resume"}</span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${reason.bg} ${reason.color}`}>
                      <ReasonIcon size={9} /> {reason.label}
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] ${creator.color}`}>
                      <CreatorIcon size={9} /> {creator.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-white/30">
                    <Clock size={10} />
                    {formatRelative(v.created_date)}
                    {v.created_date && (
                      <span className="text-white/20">
                        · {new Date(v.created_date).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {!isCurrent && (
                    <button
                      onClick={() => onRestore?.(v)}
                      title="Restore this version"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      <RotateCcw size={12} /> Restore
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {versions.length === 0 && (
        <div className="text-center py-8 text-white/30 text-sm">
          <GitBranch size={24} className="mx-auto mb-2 text-white/15" />
          No resume versions yet. Upload a resume to start tracking your revisions.
        </div>
      )}
    </div>
  );
}