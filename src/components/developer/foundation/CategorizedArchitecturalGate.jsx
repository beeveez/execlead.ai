import React, { useState } from "react";
import {
  ChevronDown, ChevronRight, AlertTriangle, ExternalLink,
  FileText, Search, Boxes, GitBranch,
} from "lucide-react";

const CATEGORY_ICONS = {
  metadata: FileText,
  discoverability: Search,
  manifest: Boxes,
  dependencies: GitBranch,
};

const CATEGORY_COLORS = {
  amber: "text-amber-400 bg-amber-500/5 border-amber-500/10",
  cyan: "text-cyan-400 bg-cyan-500/5 border-cyan-500/10",
  indigo: "text-indigo-400 bg-indigo-500/5 border-indigo-500/10",
  purple: "text-purple-400 bg-purple-500/5 border-purple-500/10",
};

const SEVERITY_COLORS = {
  Critical: "bg-red-500/10 text-red-400 border-red-500/20",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

/**
 * Categorized Architectural Gate™ (Phase 4)
 * Replaces the generic "15 Critical Issues" counter with
 * categorized blockers, each with root cause, affected components,
 * severity, estimated repair time, auto-repair availability,
 * manual review flag, and a deep link.
 */
export default function CategorizedArchitecturalGate({ cert }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const [expandedIssue, setExpandedIssue] = useState(null);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white">Architectural Gate™ — Categorized Blockers</h3>
        <span className="ml-auto text-xs text-white/40">{cert.totalBlockers} total</span>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {cert.categorizedBlockers.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.category] || AlertTriangle;
          const colorClass =
            cat.count > 0
              ? CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.amber
              : "text-white/30 bg-white/[0.02] border-white/5";
          return (
            <button
              key={cat.category}
              onClick={() => setExpandedCat(expandedCat === cat.category ? null : cat.category)}
              className={`rounded-lg p-3 border text-left transition-all ${colorClass} ${
                expandedCat === cat.category ? "ring-1 ring-white/20" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon size={14} />
                <span className="text-lg font-bold">{cat.count}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider opacity-70">{cat.label}</div>
              {cat.count > 0 && (
                <div className="text-[9px] mt-1 opacity-50">
                  {cat.critical > 0 && `${cat.critical}C `}
                  {cat.high > 0 && `${cat.high}H `}
                  {cat.medium > 0 && `${cat.medium}M `}
                  {cat.low > 0 && `${cat.low}L`}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded Issue List */}
      {expandedCat && (
        <div className="space-y-2">
          {cert.categorizedBlockers
            .find((c) => c.category === expandedCat)
            ?.issues.map((issue, i) => {
              const isExpanded = expandedIssue === i;
              return (
                <div
                  key={i}
                  className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedIssue(isExpanded ? null : i)}
                    className="w-full flex items-center gap-2 p-3 text-left hover:bg-white/[0.02]"
                  >
                    {isExpanded ? (
                      <ChevronDown size={12} className="text-white/40" />
                    ) : (
                      <ChevronRight size={12} className="text-white/40" />
                    )}
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border ${
                        SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.Medium
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-xs text-white/80 flex-1 truncate">{issue.component}</span>
                    <span className="text-[10px] text-white/30">{issue.estimatedRepairTime}</span>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2">
                      <DetailRow label="Root Cause" value={issue.rootCause} />
                      <DetailRow
                        label="Affected Components"
                        value={issue.affectedComponents.join(", ")}
                      />
                      <DetailRow label="Severity" value={issue.severity} />
                      <DetailRow label="Estimated Repair Time" value={issue.estimatedRepairTime} />
                      <DetailRow
                        label="Auto Repair"
                        value={issue.autoRepairAvailable ? "Available" : "Not Available"}
                      />
                      <DetailRow
                        label="Manual Review"
                        value={issue.manualReviewRequired ? "Required" : "Not Required"}
                      />
                      <a
                        href={issue.deepLink}
                        className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300"
                      >
                        <ExternalLink size={10} /> Deep Link to Diagnostics
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {cert.totalBlockers === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-emerald-400">
            No architectural blockers detected. All registries are synchronized.
          </p>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-white/40 w-1/3 flex-shrink-0">{label}:</span>
      <span className="text-white/70 flex-1">{value}</span>
    </div>
  );
}