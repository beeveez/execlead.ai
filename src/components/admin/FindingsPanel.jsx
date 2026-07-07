import React, { useState, useMemo } from "react";
import { Wrench, Eye, RotateCcw, CheckCircle2, Filter } from "lucide-react";
import FindingCard from "./FindingCard";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "warning", label: "Warnings" },
  { id: "information", label: "Info" },
];

export default function FindingsPanel({ report, selectedIds, onToggleSelect, onRunAction, onPreviewAction, onFixSelected, onFixAll, onRollback, runningActionId, doneActionIds, applying, canRollback }) {
  const [filter, setFilter] = useState("all");
  const [selectAllMode, setSelectAllMode] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return report.findings;
    return report.findings.filter((f) => f.severity === filter);
  }, [report.findings, filter]);

  const allFixable = filtered.filter((f) => f.severity !== "information");
  const allSelected = allFixable.length > 0 && allFixable.every((f) => selectedIds.includes(f.id));

  const toggleAll = () => {
    if (allSelected) {
      allFixable.forEach((f) => { if (selectedIds.includes(f.id)) onToggleSelect(f.id); });
    } else {
      allFixable.forEach((f) => { if (!selectedIds.includes(f.id)) onToggleSelect(f.id); });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/40" />
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.id ? "bg-indigo-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {allFixable.length > 0 && (
            <button onClick={toggleAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
              <CheckCircle2 size={12} /> {allSelected ? "Deselect All" : "Select All"}
            </button>
          )}
          <button onClick={onFixSelected} disabled={applying || selectedIds.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-xs font-medium transition-colors">
            <Wrench size={12} /> Fix Selected {selectedIds.length > 0 && `(${selectedIds.length})`}
          </button>
          <button onClick={onFixAll} disabled={applying || allFixable.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-30 text-emerald-300 text-xs font-medium transition-colors">
            <Wrench size={12} /> Fix All
          </button>
          {canRollback && (
            <button onClick={onRollback} disabled={applying} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-colors">
              <RotateCcw size={12} /> Rollback
            </button>
          )}
        </div>
      </div>

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