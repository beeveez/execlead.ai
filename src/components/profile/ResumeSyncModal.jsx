import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, Loader2, FileText, Sparkles, ChevronDown, AlertCircle, CheckCircle2, RefreshCw, Plus, Save } from "lucide-react";
import {
  SYNC_SECTIONS,
  applySync,
  calculateCompleteness,
  buildAutoDecisions,
  getConfidenceTier,
  sectionHasData,
} from "@/lib/resumeSync";

const TIER_STYLES = {
  high: { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400", label: "Auto" },
  medium: { badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20", dot: "bg-indigo-400", label: "Accepted" },
  low: { badge: "bg-amber-500/15 text-amber-400 border-amber-500/20", dot: "bg-amber-400", label: "Review" },
};

const MODES = [
  { id: "accept", label: "Accept" },
  { id: "merge", label: "Merge" },
  { id: "skip", label: "Skip" },
];

function ModeToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
            value === m.id
              ? m.id === "accept"
                ? "bg-emerald-500/20 text-emerald-400"
                : m.id === "merge"
                ? "bg-indigo-500/20 text-indigo-400"
                : "bg-white/10 text-white/50"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

function ConfidenceBadge({ score }) {
  const tier = getConfidenceTier(score);
  const style = TIER_STYLES[tier.id];
  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-medium ${style.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label} · {score}%
    </div>
  );
}

function FieldDiff({ label, current, newValue, mode, displayOnly }) {
  if (displayOnly) {
    return (
      <div className="flex items-start gap-2 py-1.5 text-xs">
        <span className="text-white/30 w-28 flex-shrink-0">{label}</span>
        <span className="flex-1 truncate text-white/40">{newValue || current || "—"}</span>
        {newValue && <span className="text-[9px] text-white/20">verified</span>}
      </div>
    );
  }
  const willChange = mode === "accept" && newValue != null && newValue !== "" && String(newValue) !== String(current ?? "");
  const willAdd = mode === "merge" && !current && newValue;
  const active = willChange || willAdd;
  return (
    <div className="flex items-start gap-2 py-1.5 text-xs">
      <span className="text-white/30 w-28 flex-shrink-0">{label}</span>
      <span className={`flex-1 truncate ${current ? "text-white/50" : "text-white/20 italic"}`}>
        {current || "empty"}
      </span>
      {active ? (
        <>
          <ArrowRight size={10} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <span className={`flex-1 truncate ${willAdd ? "text-emerald-400" : "text-indigo-400"}`}>
            {newValue}
          </span>
        </>
      ) : (
        <span className="flex-1" />
      )}
    </div>
  );
}

function ArrayDiff({ current, incoming, mode, itemLabel }) {
  const currentItems = current || [];
  const newItems = incoming || [];
  const totalAfter = mode === "skip" ? currentItems.length : mode === "merge" ? currentItems.length + newItems.length : newItems.length;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-white/50">{currentItems.length} current</span>
        {mode !== "skip" && (
          <>
            <ArrowRight size={10} className="text-indigo-400" />
            <span className={mode === "merge" ? "text-emerald-400" : "text-indigo-400"}>
              {totalAfter} after (+{newItems.length} from resume)
            </span>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-white/20">Current</div>
          {currentItems.length === 0 ? (
            <div className="text-white/20 italic text-xs">None</div>
          ) : (
            currentItems.slice(0, 5).map((item, i) => (
              <div key={i} className="text-xs text-white/50 truncate">• {itemLabel(item)}</div>
            ))
          )}
          {currentItems.length > 5 && <div className="text-[10px] text-white/20">+{currentItems.length - 5} more</div>}
        </div>
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-white/20">From Resume</div>
          {newItems.length === 0 ? (
            <div className="text-white/20 italic text-xs">None detected</div>
          ) : (
            newItems.slice(0, 5).map((item, i) => (
              <div key={i} className="text-xs text-indigo-400/80 truncate">• {itemLabel(item)}</div>
            ))
          )}
          {newItems.length > 5 && <div className="text-[10px] text-white/20">+{newItems.length - 5} more</div>}
        </div>
      </div>
    </div>
  );
}

export default function ResumeSyncModal({ extractedForm, currentForm, onApply, onClose, fileName, presetMode }) {
  const [decisions, setDecisions] = useState(() => {
    if (presetMode === "replace" || presetMode === "merge") {
      const d = {};
      for (const s of SYNC_SECTIONS) {
        const hasNew = sectionHasData(extractedForm, s);
        const score = extractedForm?._confidence?.[s.id] ?? 0;
        if (!hasNew || score < 80) d[s.id] = "skip";
        else d[s.id] = presetMode === "merge" ? "merge" : "accept";
      }
      return d;
    }
    return buildAutoDecisions(extractedForm, currentForm);
  });
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(() => {
    const set = new Set();
    for (const s of SYNC_SECTIONS) {
      const score = extractedForm?._confidence?.[s.id] ?? 0;
      if (sectionHasData(extractedForm, s) && score < 80) set.add(s.id);
    }
    return set;
  });
  const [applying, setApplying] = useState(false);

  const previewForm = useMemo(() => applySync(currentForm, extractedForm, decisions), [currentForm, extractedForm, decisions]);
  const beforeCompleteness = useMemo(() => calculateCompleteness(currentForm), [currentForm]);
  const afterCompleteness = useMemo(() => calculateCompleteness(previewForm), [previewForm]);

  const stats = useMemo(() => {
    let auto = 0, review = 0;
    for (const s of SYNC_SECTIONS) {
      const score = extractedForm?._confidence?.[s.id] ?? 0;
      if (!sectionHasData(extractedForm, s)) continue;
      if (score >= 80) auto++; else review++;
    }
    return { auto, review };
  }, [extractedForm]);

  const hasExisting = SYNC_SECTIONS.some((s) => sectionHasData(currentForm, s));

  const handleMergeAll = () => {
    const d = {};
    for (const s of SYNC_SECTIONS) {
      const hasNew = sectionHasData(extractedForm, s);
      const score = extractedForm?._confidence?.[s.id] ?? 0;
      if (!hasNew || score < 80) d[s.id] = "skip";
      else d[s.id] = "merge";
    }
    setDecisions(d);
  };

  const visibleSections = useMemo(() => {
    if (filter === "review") {
      return SYNC_SECTIONS.filter((s) => {
        const score = extractedForm?._confidence?.[s.id] ?? 0;
        return sectionHasData(extractedForm, s) && score < 80;
      });
    }
    return SYNC_SECTIONS.filter((s) => sectionHasData(extractedForm, s) || sectionHasData(currentForm, s));
  }, [filter, extractedForm, currentForm]);

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAcceptAll = () => {
    const d = {};
    for (const s of SYNC_SECTIONS) {
      const hasNew = sectionHasData(extractedForm, s);
      const hasCurrent = sectionHasData(currentForm, s);
      const score = extractedForm?._confidence?.[s.id] ?? 0;
      if (!hasNew || score < 80) d[s.id] = "skip";
      else d[s.id] = s.type === "array" && hasCurrent ? "merge" : "accept";
    }
    setDecisions(d);
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await onApply(previewForm);
    } finally {
      setApplying(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0d0d14] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Sparkles size={18} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Smart Mapping Engine</h2>
                <p className="text-white/40 text-xs flex items-center gap-1">
                  <FileText size={10} /> {fileName || "resume.pdf"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          {/* Re-import Mode Selection */}
          {hasExisting && (
            <div className="px-5 py-2.5 bg-indigo-500/[0.03] border-b border-white/5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-1.5">Import Mode</div>
              <div className="flex items-center gap-2">
                <button onClick={handleAcceptAll} className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5">
                  <RefreshCw size={11} /> Replace Existing
                </button>
                <button onClick={handleMergeAll} className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5">
                  <Plus size={11} /> Merge
                </button>
                <button onClick={handleAcceptAll} className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5">
                  <Save size={11} /> Create New Version
                </button>
              </div>
            </div>
          )}

          {/* Confidence Summary */}
          <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-xs text-white/60"><span className="text-emerald-400 font-bold">{stats.auto}</span> auto-accepted</span>
            </div>
            {stats.review > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-400" />
                <span className="text-xs text-white/60"><span className="text-amber-400 font-bold">{stats.review}</span> need review</span>
              </div>
            )}
          </div>

          {/* Completeness Bar */}
          <div className="px-5 py-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/40 font-medium">Identity Completion</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/30">{beforeCompleteness.overall}%</span>
                <ArrowRight size={12} className="text-indigo-400" />
                <span className="text-indigo-400 font-bold">{afterCompleteness.overall}%</span>
              </div>
            </div>
            <div className="flex gap-1">
              {Object.entries(afterCompleteness.sections).map(([key, s]) => (
                <div key={key} className="flex-1 group relative">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        s.score >= 80 ? "bg-emerald-500" : s.score >= 50 ? "bg-indigo-500" : s.score > 0 ? "bg-amber-500" : "bg-white/10"
                      }`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-5 py-2 border-b border-white/5 flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === "all" ? "bg-white/10 text-white/80" : "text-white/30 hover:text-white/50"}`}
            >
              All Sections
            </button>
            {stats.review > 0 && (
              <button
                onClick={() => setFilter("review")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${filter === "review" ? "bg-amber-500/15 text-amber-400" : "text-white/30 hover:text-white/50"}`}
              >
                <AlertCircle size={11} /> Needs Review ({stats.review})
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {visibleSections.length === 0 && (
              <div className="text-center py-12 text-white/30 text-sm">No data detected in resume.</div>
            )}
            {visibleSections.map((section) => {
              const score = extractedForm?._confidence?.[section.id] ?? 0;
              const tier = getConfidenceTier(score);
              const isExpanded = expanded.has(section.id);
              const decision = decisions[section.id] || "skip";
              const hasNew = sectionHasData(extractedForm, section);
              return (
                <div
                  key={section.id}
                  className={`bg-white/[0.02] border rounded-xl overflow-hidden ${
                    tier.id === "low" ? "border-amber-500/20" : tier.id === "medium" ? "border-indigo-500/15" : "border-white/10"
                  }`}
                >
                  <div className="px-4 py-3 flex items-center justify-between gap-3">
                    <button onClick={() => toggleExpand(section.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <ChevronDown size={14} className={`text-white/30 transition-transform flex-shrink-0 ${isExpanded ? "" : "-rotate-90"}`} />
                      <span className="text-sm font-medium text-white/70 truncate">{section.label}</span>
                      {hasNew && <ConfidenceBadge score={score} />}
                    </button>
                    <ModeToggle value={decision} onChange={(v) => setDecisions({ ...decisions, [section.id]: v })} />
                  </div>
                  {isExpanded && hasNew && (
                    <div className="px-4 pb-3 pt-1 border-t border-white/5">
                      {section.type === "scalar" ? (
                        section.fields.map((f) => (
                          <FieldDiff
                            key={f.key}
                            label={f.label}
                            current={currentForm[f.key]}
                            newValue={extractedForm[f.key]}
                            mode={decision}
                            displayOnly={f.displayOnly}
                          />
                        ))
                      ) : (
                        <ArrayDiff
                          current={currentForm[section.id]}
                          incoming={extractedForm[section.id]}
                          mode={decision}
                          itemLabel={section.itemLabel}
                        />
                      )}
                    </div>
                  )}
                  {isExpanded && !hasNew && (
                    <div className="px-4 pb-3 text-xs text-white/20 italic">No data detected in resume for this section</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAcceptAll}
                className="px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors"
              >
                Accept All
              </button>
              {stats.review > 0 && (
                <button
                  onClick={() => setFilter("review")}
                  className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium transition-colors"
                >
                  Review Low Confidence
                </button>
              )}
              <span className="text-xs text-white/30 ml-2">
                {Object.values(decisions).filter((d) => d !== "skip").length} section(s) will update
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-white/40 hover:text-white/70 text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
              >
                {applying ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Apply to Identity
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}