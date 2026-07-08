import React, { useState, useMemo, useRef, useEffect } from "react";
import { Wrench, Eye, RotateCcw, CheckCircle2, Filter, EyeOff, CheckCheck, Download, AlertCircle } from "lucide-react";
import FindingCard from "./FindingCard";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "warning", label: "Warnings" },
  { id: "information", label: "Info" },
];

export default function FindingsPanel({ report, selectedIds, onToggleSelect, onRunAction, onPreviewAction, onFixSelected, onFixAll, onRollback, runningActionId, doneActionIds, applying, canRollback }) {
  const [filter, setFilter] = useState("all");
  const [ignored, setIgnored] = useState(new Set());
  const [reviewed, setReviewed] = useState(new Set());
  const [uiWarning, setUiWarning] = useState(null);

  const filtered = useMemo(() => {
    if (filter === "all") return report.findings;
    return report.findings.filter((f) => f.severity === filter);
  }, [report.findings, filter]);

  const allSelectable = filtered;
  const allSelected = allSelectable.length > 0 && allSelectable.every((f) => selectedIds.includes(f.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  /* --- Select All checkbox with indeterminate state --- */
  const selectAllRef = useRef(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected, filtered.length]);

  const toggleAll = () => {
    if (allSelected) {
      allSelectable.forEach((f) => { if (selectedIds.includes(f.id)) onToggleSelect(f.id); });
    } else {
      allSelectable.forEach((f) => { if (!selectedIds.includes(f.id)) onToggleSelect(f.id); });
    }
  };

  const clearSelection = () => {
    [...selectedIds].forEach((id) => onToggleSelect(id));
  };

  /* --- Bulk: Ignore / Reviewed / Export --- */
  const ignoreSelected = () => {
    setIgnored((prev) => new Set([...prev, ...selectedIds]));
    clearSelection();
  };

  const markReviewed = () => {
    setReviewed((prev) => new Set([...prev, ...selectedIds]));
    clearSelection();
  };

  const exportSelected = () => {
    const selectedFindings = report.findings.filter((f) => selectedIds.includes(f.id));
    const data = selectedFindings.map((f) => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      category: f.category,
      description: f.description,
      actions: f.actions.map((a) => a.label),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `findings-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* --- Runtime UI validation (#8): verify checkboxes are interactive --- */
  useEffect(() => {
    if (filtered.length === 0) { setUiWarning(null); return; }
    const timer = setTimeout(() => {
      const checkboxes = document.querySelectorAll("[data-finding-checkbox]");
      if (checkboxes.length === 0) { setUiWarning("No interactive checkboxes detected in findings panel."); return; }
      const blocked = [];
      checkboxes.forEach((cb) => {
        const el = cb;
        let node = el;
        while (node && node !== document.body) {
          const style = window.getComputedStyle(node);
          if (style.pointerEvents === "none") { blocked.push(el.getAttribute("aria-label") || "checkbox"); break; }
          node = node.parentElement;
        }
      });
      setUiWarning(blocked.length > 0 ? `${blocked.length} checkbox(es) blocked by pointer-events:none — UI interactivity issue.` : null);
    }, 200);
    return () => clearTimeout(timer);
  }, [filtered.length, filter]);

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/40" />
          {FILTERS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.id ? "bg-indigo-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {allSelectable.length > 0 && (
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs cursor-pointer transition-colors">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all findings"
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
              {allSelected ? "Deselect All" : "Select All"}
            </label>
          )}
          <button type="button" onClick={onFixSelected} disabled={applying || !hasSelection} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-xs font-medium transition-colors">
            <Wrench size={12} /> Fix Selected {hasSelection && `(${selectedIds.length})`}
          </button>
          <button type="button" onClick={ignoreSelected} disabled={applying || !hasSelection} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/60 text-xs font-medium transition-colors">
            <EyeOff size={12} /> Ignore Selected {hasSelection && `(${selectedIds.length})`}
          </button>
          <button type="button" onClick={markReviewed} disabled={applying || !hasSelection} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/60 text-xs font-medium transition-colors">
            <CheckCheck size={12} /> Mark as Reviewed {hasSelection && `(${selectedIds.length})`}
          </button>
          <button type="button" onClick={exportSelected} disabled={applying || !hasSelection} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/60 text-xs font-medium transition-colors">
            <Download size={12} /> Export Selected {hasSelection && `(${selectedIds.length})`}
          </button>
          <button type="button" onClick={onFixAll} disabled={applying || allSelectable.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-30 text-emerald-300 text-xs font-medium transition-colors">
            <Wrench size={12} /> Fix All
          </button>
          {canRollback && (
            <button type="button" onClick={onRollback} disabled={applying} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-30 text-amber-300 text-xs font-medium transition-colors">
              <RotateCcw size={12} /> Rollback
            </button>
          )}
        </div>
      </div>

      {uiWarning && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertCircle size={14} className="shrink-0" /> {uiWarning}
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
            <Eye className="mx-auto text-white/20 mb-3" size={32} />
            <p className="text-white/50 font-medium">No {filter === "all" ? "" : filter + " "}findings</p>
            <p className="text-white/30 text-sm mt-1">Configuration is consistent.</p>
          </div>
        ) : (
          filtered.map((f) => (
            <FindingCard
              key={f.id}
              finding={f}
              selected={selectedIds.includes(f.id)}
              ignored={ignored.has(f.id)}
              reviewed={reviewed.has(f.id)}
              onToggleSelect={onToggleSelect}
              onRunAction={onRunAction}
              onPreviewAction={onPreviewAction}
              runningActionId={runningActionId}
              doneActionIds={doneActionIds}
            />
          ))
        )}
      </div>
    </div>
  );
}