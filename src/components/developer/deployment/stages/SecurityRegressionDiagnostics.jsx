import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, XCircle, CheckCircle2, Loader2, Clock, ShieldAlert, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { runSecurityRegressionSuite, buildSuiteShape } from "@/lib/securityRegressionSuite";

export default function SecurityRegressionDiagnostics({ query, initialFilter }) {
  const [results, setResults] = useState(null);

  useEffect(() => {
    let cancelled = false;
    runSecurityRegressionSuite().then((raw) => {
      if (!cancelled) setResults(buildSuiteShape(raw));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const filteredTests = useMemo(() => {
    if (!results?.tests) return [];
    return results.tests.filter((t) => {
      if (initialFilter === "error" && t.status !== "fail") return false;
      if (initialFilter === "warning" && t.riskLevel !== "warning") return false;
      if (query && !t.name.toLowerCase().includes(query.toLowerCase()) && !t.entity.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [results?.tests, query, initialFilter]);

  if (!results) {
    return <div className="flex items-center gap-2 text-white/40 text-sm"><Loader2 size={14} className="animate-spin" /> Running security tests...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Link to full Security Intelligence Center */}
      <Link to="/developer/security-intelligence" className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors mb-2">
        <ExternalLink size={11} /> Open Security Intelligence Center™ — full interactive diagnostics, test registry, failure registry, and EXEC™ copilot
      </Link>

      {/* Summary — Risk-Based Deploy Gate */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Total Tests</div>
          <div className="text-lg font-bold text-white">{results.total}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Critical Failures</div>
          <div className="text-lg font-bold text-red-400">{results.criticalFailures}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Warning Failures</div>
          <div className="text-lg font-bold text-amber-400">{results.warningFailures}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Deploy Gate</div>
          <div className="text-lg font-bold" style={{ color: results.blocked ? "#ef4444" : "#10b981" }}>
            {results.blocked ? "BLOCKED" : "PASS"}
          </div>
        </div>
      </div>

      {/* Risk-Based Coverage™ */}
      {results.riskCoverage && (
        <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-400 text-[10px] uppercase tracking-wider mb-3">
            <ShieldAlert size={12} /> Risk-Based Coverage™
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-wider text-white/40">Platform</div>
              <div className="text-sm font-bold" style={{ color: results.riskCoverage.platform.coverage === 100 ? "#10b981" : "#f59e0b" }}>
                {results.riskCoverage.platform.coverage}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-wider text-white/40">Organization</div>
              <div className="text-sm font-bold" style={{ color: results.riskCoverage.organization.coverage === 100 ? "#10b981" : "#f59e0b" }}>
                {results.riskCoverage.organization.coverage}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-wider text-white/40">User</div>
              <div className="text-sm font-bold" style={{ color: results.riskCoverage.user.coverage === 100 ? "#10b981" : "#f59e0b" }}>
                {results.riskCoverage.user.coverage}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-wider text-white/40">Critical™</div>
              <div className="text-sm font-bold" style={{ color: results.riskCoverage.criticalCoverage === 100 ? "#10b981" : "#f59e0b" }}>
                {results.riskCoverage.criticalCoverage}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Technical Debt™ */}
      {results.securityDebt && (
        <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-400 text-[10px] uppercase tracking-wider mb-3">
            <AlertTriangle size={12} /> Security Technical Debt™
          </div>
          <div className="flex items-center gap-4">
            <div className="grid grid-cols-4 gap-2 flex-1">
              <div className="text-center">
                <div className="text-[9px] uppercase tracking-wider text-white/40">Critical</div>
                <div className="text-sm font-bold text-red-400">{results.securityDebt.critical}</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] uppercase tracking-wider text-white/40">High</div>
                <div className="text-sm font-bold text-amber-400">{results.securityDebt.high}</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] uppercase tracking-wider text-white/40">Medium</div>
                <div className="text-sm font-bold text-yellow-400">{results.securityDebt.medium}</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] uppercase tracking-wider text-white/40">Low</div>
                <div className="text-sm font-bold text-indigo-400">{results.securityDebt.low}</div>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-white/40" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/40">Est. Effort</div>
                <div className="text-sm font-bold text-white">{results.securityDebt.effortHours}h</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-2">Test Categories ({results.categories?.length || 0})</div>
        {results.categories?.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
            {cat.failed === 0 ? (
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
            ) : cat.criticalFailures > 0 ? (
              <XCircle size={12} className="text-red-400 shrink-0" />
            ) : (
              <AlertTriangle size={12} className="text-amber-400 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-white/70">{cat.label}</div>
              <div className="text-[9px] text-white/30">{cat.description}</div>
            </div>
            {cat.type === "platform" && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">PLATFORM</span>
            )}
            {cat.criticalFailures > 0 && (
              <span className="text-[9px] font-mono text-red-400 shrink-0">{cat.criticalFailures} crit</span>
            )}
            {cat.warningFailures > 0 && (
              <span className="text-[9px] font-mono text-amber-400 shrink-0">{cat.warningFailures} warn</span>
            )}
            <div className="text-[10px] font-mono text-white/50 shrink-0">{cat.passed}/{cat.total}</div>
            <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden shrink-0">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${cat.passRate}%`, background: cat.passRate === 100 ? "#10b981" : cat.criticalFailures > 0 ? "#ef4444" : "#f59e0b" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Failed/warning tests */}
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
                ) : t.riskLevel === "critical" ? (
                  <XCircle size={11} className="text-red-400 shrink-0" />
                ) : (
                  <AlertTriangle size={11} className="text-amber-400 shrink-0" />
                )}
                <code className="text-white/30 font-mono shrink-0">{t.id}</code>
                <span className="text-white/60 truncate flex-1">{t.name}</span>
                {t.riskLevel === "warning" && (
                  <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">WARN</span>
                )}
                <span className="text-white/30 truncate hidden sm:block">{t.expected}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}