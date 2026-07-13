import React, { useMemo, useState } from "react";
import { AlertTriangle, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { runSecurityRegressionSuite } from "@/lib/securityRegressionSuite";

export default function SecurityRegressionDiagnostics({ query, initialFilter }) {
  const [results] = useState(() => runSecurityRegressionSuite());

  const filteredTests = useMemo(() => {
    if (!results.tests) return [];
    return results.tests.filter((t) => {
      if (initialFilter === "error" && t.status !== "fail") return false;
      if (initialFilter === "warning" && t.severity !== "high") return false;
      if (query && !t.name.toLowerCase().includes(query.toLowerCase()) && !t.entity.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [results.tests, query, initialFilter]);

  if (!results) {
    return <div className="flex items-center gap-2 text-white/40 text-sm"><Loader2 size={14} className="animate-spin" /> Running security tests...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Total Tests</div>
          <div className="text-lg font-bold text-white">{results.total}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Passed</div>
          <div className="text-lg font-bold text-emerald-400">{results.passed}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Failed</div>
          <div className="text-lg font-bold text-red-400">{results.failed}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Deploy Gate</div>
          <div className="text-lg font-bold" style={{ color: results.blocked ? "#ef4444" : "#10b981" }}>
            {results.blocked ? "BLOCKED" : "PASS"}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        {results.categories?.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2.5">
            {cat.failed === 0 ? (
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/80">{cat.label}</div>
              <div className="text-[10px] text-white/40">{cat.description}</div>
            </div>
            <div className="text-xs font-mono text-white/60">{cat.passed}/{cat.total}</div>
            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${cat.passRate}%`, background: cat.passRate === 100 ? "#10b981" : "#f59e0b" }}
              />
            </div>
            <span className="text-[10px] font-mono w-8 text-right" style={{ color: cat.passRate === 100 ? "#10b981" : "#f59e0b" }}>
              {cat.passRate}%
            </span>
          </div>
        ))}
      </div>

      {/* Failed tests */}
      {filteredTests.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={14} className="text-red-400" />
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
              {initialFilter === "error" ? "Failed Tests" : "Test Results"} ({filteredTests.length})
            </span>
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {filteredTests.slice(0, 50).map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-[11px] py-1">
                {t.status === "pass" ? (
                  <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={11} className="text-red-400 shrink-0" />
                )}
                <code className="text-white/30 font-mono shrink-0">{t.id}</code>
                <span className="text-white/60 truncate flex-1">{t.name}</span>
                <span className="text-white/30 truncate hidden sm:block">{t.expected}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}