import React, { useState, useMemo, useRef, useEffect } from "react";
import { Wrench, Eye, RotateCcw, Filter, EyeOff, CheckCheck, Download, ChevronDown, ChevronRight, History, Zap } from "lucide-react";
import FindingCard from "./FindingCard";
import { classifyFinding } from "@/lib/repairEngine";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "auto", label: "🟢 Auto" },
  { id: "guided", label: "🟡 Guided" },
  { id: "manual", label: "🔴 Manual" },
];

export default function FindingsPanel({ report, selectedIds, onToggleSelect, onRunAction, onPreviewAction, onGeneratePatch, onFixSelected, onFixAll, onRollbackRepair, runningActionId, doneActionIds, applying, repairHistory }) {
  const [filter, setFilter] = useState("all");
  const [ignored, setIgnored] = useState(new Set());
  const [reviewed, setReviewed] = useState(new Set());
  const [showHistory, setShowHistory] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return report.findings;
    return report.findings.filter((f) => classifyFinding(f) === filter);
  }, [report.findings, filter]);

  const levelCounts = useMemo(() => {
    const c = { auto: 0, guided: 0, manual: 0 };
    report.findings.forEach((f) => { c[classifyFinding(f)]++; });
    return c;
  }, [report.findings]);

  const allSelectable = filtered;
  const allSelected = allSelectable.length > 0 && allSelectable.every((f) => selectedIds.includes(f.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

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

  const ignoreSelected = () => {
    setIgnored((prev) => new Set([...prev, ...selectedIds]));
    clearSelection();
  };

  const markReviewed = () => {
    setReviewed((prev) => new Set([...prev, ...selectedIds]));
    clearSelection();
  };

  const markFindingReviewed = (finding) => {
    setReviewed((prev) => new Set([...prev, finding.id]));
  };

  const exportSelected = () => {
    const selectedFindings = report.findings.filter((f) => selectedIds.includes(f.id));
    const data = selectedFindings.map((f) => ({
      id: f.id, title: f.title, severity: f.severity, category: f.category,
      repairLevel: classifyFinding(f),
      description: f.description, actions: f.actions.map((a) => a.label),
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

  const selectionSummary = useMemo(() => {
    if (selectedIds.length === 0) return null;
    const targets = report.findings.filter((f) => selectedIds.includes(f.id));
    const levels = { auto: 0, guided: 0, manual: 0 };
    targets.forEach((f) => { levels[classifyFinding(f)]++; });
    return levels;
  }, [selectedIds, report.findings]);

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
              <input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all findings" className="w-4 h-4 accent-indigo-500 cursor-pointer" />
              {allSelected ? "Deselect All" : "Select All"}
            </label>
          )}
          <button type="button" onClick={onFixSelected} disabled={applying || !hasSelection} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-xs font-medium transition-colors">
            {applying ? <Zap size={12} className="animate-pulse" /> : <Wrench size={12} />} Fix Selected {hasSelection && `(${selectedIds.length})`}
          </button>
          <button type="button" onClick={ignoreSelected} disabled={applying || !hasSelection} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/60 text-xs font-medium transition-colors">
            <EyeOff size={12} /> Ignore
          </button>
          <button type="button" onClick={markReviewed} disabled={applying || !hasSelection} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/60 text-xs font-medium transition-colors">
            <CheckCheck size={12} /> Reviewed
          </button>
          <button type="button" onClick={exportSelected} disabled={applying || !hasSelection} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/60 text-xs font-medium transition-colors">
            <Download size={12} /> Export
          </button>
          <button type="button" onClick={onFixAll} disabled={applying} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-30 text-emerald-300 text-xs font-medium transition-colors">
            <Wrench size={12} /> Fix All Auto
          </button>
        </div>
      </div>

      {!selectionSummary && (levelCounts.auto + levelCounts.guided + levelCounts.manual) > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-3 text-center">
            <div className="text-emerald-400 text-xl font-bold">{levelCounts.auto}</div>
            <div className="text-white/40 text-[10px] uppercase tracking-wider">Auto Fixable</div>
          </div>
          <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-3 text-center">
            <div className="text-amber-400 text-xl font-bold">{levelCounts.guided}</div>
            <div className="text-white/40 text-[10px] uppercase tracking-wider">Guided Fixes</div>
          </div>
          <div className="rounded-lg bg-red-500/5 border border-red-500/15 p-3 text-center">
            <div className="text-red-400 text-xl font-bold">{levelCounts.manual}</div>
            <div className="text-white/40 text-[10px] uppercase tracking-wider">Manual Fixes</div>
          </div>
        </div>
      )}

      {selectionSummary && (
        <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/15 p-3 space-y-1">
          {selectionSummary.auto > 0 && <p className="text-xs text-white/60">🟢 <span className="text-emerald-400 font-medium">{selectionSummary.auto}</span> issue(s) will be auto-repaired</p>}
          {selectionSummary.guided > 0 && <p className="text-xs text-white/60">🟡 <span className="text-amber-400 font-medium">{selectionSummary.guided}</span> guided fix(es) — patches ready for review</p>}
          {selectionSummary.manual > 0 && <p className="text-xs text-white/60">🔴 <span className="text-red-400 font-medium">{selectionSummary.manual}</span> manual fix(es) require developer attention</p>}
          {selectionSummary.auto === 0 && <p className="text-xs text-white/40 italic">No auto-fixable issues in this selection. Use the guided patches or review manual fixes below.</p>}
        </div>
      )}

      {repairHistory && repairHistory.length > 0 && (
        <div className="rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden">
          <button type="button" onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between p-3 text-xs text-white/60 hover:text-white/80 transition-colors">
            <span className="flex items-center gap-2"><History size={12} /> Repair History ({repairHistory.length})</span>
            {showHistory ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {showHistory && (
            <div className="px-3 pb-3 space-y-2">
              {repairHistory.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-xs text-white/50">
                    <span className="text-white/70">{r.stats.fixed}</span> fixed · <span className="text-white/70">{r.stats.remaining}</span> remaining · <span className="capitalize">{r.riskLevel}</span> risk
                    <span className="text-white/30 ml-2">{new Date(r.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <button type="button" onClick={() => onRollbackRepair(r.id)} disabled={applying} className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-30 text-amber-400 text-[10px] font-medium transition-colors">
                    <RotateCcw size={10} /> Rollback
                  </button>
                </div>
              ))}
            </div>
          )}
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
              onGeneratePatch={onGeneratePatch}
              onMarkReviewed={markFindingReviewed}
              runningActionId={runningActionId}
              doneActionIds={doneActionIds}
            />
          ))
        )}
      </div>
    </div>
  );
}