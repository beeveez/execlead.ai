import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight, ChevronDown, AlertTriangle, AlertCircle, Info,
  Wrench, FileSearch, Link2, History, Lightbulb, Target, ShieldAlert,
} from "lucide-react";

const LEVEL_ICONS = {
  error: { icon: AlertCircle, color: "text-red-400" },
  warning: { icon: AlertTriangle, color: "text-amber-400" },
  info: { icon: Info, color: "text-blue-400" },
};

export default function GovernanceDrillDown({ title, findings, onClose }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          className="absolute inset-0 bg-black/50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="relative w-full max-w-[640px] bg-[#0a0a0f] border-l border-white/10 overflow-y-auto h-full"
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/10">
            <button
              onClick={onClose}
              className="w-full flex items-center gap-2 px-5 py-3 text-white/60 hover:text-white text-sm"
            >
              <ChevronRight size={14} className="rotate-180" />
              Close Drill-Down Report
            </button>
            <div className="px-5 pb-3">
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="text-white/40 text-xs mt-0.5">
                {findings.length} finding(s) — click any finding to expand the full diagnostic report
              </p>
            </div>
          </div>

          {/* Findings List */}
          <div className="p-4 space-y-2">
            {findings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                  <ShieldAlert size={20} className="text-emerald-400" />
                </div>
                <p className="text-white/60 text-sm font-medium">No findings in this dimension</p>
                <p className="text-white/30 text-xs mt-1">All checks passed — dimension is healthy</p>
              </div>
            ) : (
              findings.map((finding, idx) => {
                const cfg = LEVEL_ICONS[finding.level] || LEVEL_ICONS.info;
                const Icon = cfg.icon;
                const isExpanded = expandedId === finding.id;
                return (
                  <div key={finding.id || idx} className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                      className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/[0.03] transition-colors"
                    >
                      <Icon size={14} className={`mt-0.5 flex-shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">{finding.code}</span>
                          {finding.autoRepairable && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                              <Wrench size={8} /> Auto-Repairable
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/80 mt-1">{finding.message}</p>
                      </div>
                      <ChevronDown size={14} className={`text-white/30 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3 border-t border-white/5 pt-3">
                        <DrillDownSection icon={FileSearch} label="Root Cause" value={finding.rootCause} />
                        <DrillDownSection icon={Target} label="Affected Modules" value={
                          finding.affectedModules?.length > 0
                            ? finding.affectedModules.join(", ")
                            : "No specific modules affected"
                        } />
                        <DrillDownSection icon={ShieldAlert} label="Impact" value={finding.impact} />
                        <DrillDownSection icon={Lightbulb} label="Recommended Action" value={finding.recommendedAction} />
                        <DrillDownSection icon={Wrench} label="Auto-Repair Availability" value={
                          finding.autoRepairable
                            ? "Available — this finding can be automatically repaired by the Self-Healing Engine™"
                            : "Not available — requires manual developer review"
                        } />
                        <DrillDownSection icon={Link2} label="Related Registry Entries" value={
                          finding.relatedRegistryEntries?.length > 0
                            ? finding.relatedRegistryEntries.join(" · ")
                            : "No related entries"
                        } />
                        {finding.evidence?.length > 0 && (
                          <DrillDownSection icon={History} label="Evidence" value={
                            <ul className="space-y-1">
                              {finding.evidence.map((e, i) => <li key={i} className="text-xs text-white/50">• {e}</li>)}
                            </ul>
                          } />
                        )}
                        {finding.auditHistory?.length > 0 && (
                          <DrillDownSection icon={History} label="Audit History" value={
                            <ul className="space-y-1">
                              {finding.auditHistory.map((h, i) => (
                                <li key={i} className="text-xs text-white/50">
                                  • {h.action || h.issue || "Repair"} — {new Date(h.timestamp).toLocaleString()}
                                </li>
                              ))}
                            </ul>
                          } />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DrillDownSection({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-white/30" />
        <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className="text-xs text-white/60 pl-4">{value}</div>
    </div>
  );
}