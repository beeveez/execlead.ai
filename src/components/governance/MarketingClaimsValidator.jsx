import React, { useMemo } from "react";
import {
  CheckCircle2, AlertTriangle, FileText, ShieldCheck,
} from "lucide-react";
import {
  validateMarketingCopy, MARKETING_SECTIONS, CLASSIFICATIONS,
} from "@/lib/marketingClaimsValidator";

const CLASSIFICATION_LABELS = {
  verified: { label: "Verified", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  vision: { label: "Vision", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  product_capability: { label: "Product Capability", color: "text-blue-400", bg: "bg-blue-500/10" },
  roadmap: { label: "Roadmap", color: "text-amber-400", bg: "bg-amber-500/10" },
};

export default function MarketingClaimsValidator() {
  const results = useMemo(
    () => MARKETING_SECTIONS.map((s) => validateMarketingCopy(s.copy, s.name)),
    []
  );

  const totalViolations = results.reduce((s, r) => s + r.violations.length, 0);
  const totalStatements = results.reduce((s, r) => s + r.totalStatements, 0);
  const overallScore =
    totalStatements > 0
      ? Math.round(((totalStatements - totalViolations) / totalStatements) * 100)
      : 100;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-400" />
          <h2 className="text-white font-semibold text-sm">Marketing Claims Validator™</h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              overallScore >= 95
                ? "bg-emerald-500/10 text-emerald-400"
                : overallScore >= 80
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-red-500/10 text-red-400"
            }`}
          >
            {overallScore}% Compliant
          </span>
          {totalViolations === 0 ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
              No Violations
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
              {totalViolations} Violation{totalViolations !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <p className="text-white/40 text-xs mb-4 leading-relaxed">
        Scans public marketing copy for unsupported claims. Every statement is classified as Verified, Vision, Product Capability, or Roadmap. Unsupported outcome claims generate a publishing warning.
      </p>

      {/* Results per section */}
      <div className="space-y-3">
        {results.map((result, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText size={12} className="text-white/40" />
                <span className="text-white/70 text-sm font-medium">{result.sectionName}</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  result.violations.length === 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {result.violations.length === 0
                  ? "PASS"
                  : `${result.violations.length} FLAG${result.violations.length !== 1 ? "S" : ""}`}
              </span>
            </div>

            {result.violations.length > 0 && (
              <div className="space-y-2 mt-2">
                {result.violations.map((v, j) => (
                  <div
                    key={j}
                    className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-lg p-2"
                  >
                    <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/60 text-xs italic">"{v.text}"</p>
                      <p className="text-red-400/60 text-[10px] mt-1">
                        "{v.violation.term}" — {v.violation.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.violations.length === 0 && result.findings.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {result.findings.map((f, j) => {
                  const cls =
                    CLASSIFICATION_LABELS[f.classification] ||
                    CLASSIFICATION_LABELS.product_capability;
                  return (
                    <span
                      key={j}
                      className={`text-[9px] px-1.5 py-0.5 rounded ${cls.bg} ${cls.color}`}
                    >
                      {cls.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/5">
        <span className="text-white/30 text-[10px] uppercase tracking-wider">
          Classifications:
        </span>
        {Object.entries(CLASSIFICATION_LABELS).map(([key, val]) => (
          <span
            key={key}
            className={`text-[9px] px-1.5 py-0.5 rounded ${val.bg} ${val.color}`}
          >
            {val.label}
          </span>
        ))}
        <span className="text-white/30 text-[10px] ml-auto flex items-center gap-1">
          <AlertTriangle size={10} className="text-red-400" /> Auto-flags: improves, increases,
          saves, reduces, proven, trusted by, used by
        </span>
      </div>
    </div>
  );
}