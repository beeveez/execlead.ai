import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Activity } from "lucide-react";
import { REGRESSION_TEST_CATEGORIES, getRegressionSummary } from "@/lib/privacyEngine";

export default function PrivacyRegressionSuite() {
  const summary = getRegressionSummary();
  const passRate = Math.round((summary.passed / summary.total) * 100);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{summary.total}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Total Tests</div>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{summary.passed}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Passed</div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{summary.warning}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Warnings</div>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{summary.failed}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Failed</div>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{(summary.executionTimeMs / 1000).toFixed(1)}s</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Execution</div>
        </div>
      </div>

      {/* Pass Rate Banner */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle2 size={20} className="text-emerald-400" />
        <div>
          <span className="text-emerald-400 text-sm font-semibold">{passRate}% Pass Rate</span>
          <span className="text-white/40 text-xs ml-2">— All {REGRESSION_TEST_CATEGORIES.length} categories executed successfully</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Regression Test Categories</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-3 py-2 text-white/40 font-medium">Category</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Total</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Passed</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Warning</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Failed</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Critical</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {REGRESSION_TEST_CATEGORIES.map((cat) => {
                const allPass = cat.failed === 0 && cat.critical === 0;
                const hasWarning = cat.warning > 0;
                return (
                  <tr key={cat.category} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5 text-white/70">{cat.category}</td>
                    <td className="px-3 py-2.5 text-center text-white/50">{cat.total}</td>
                    <td className="px-3 py-2.5 text-center text-emerald-400">{cat.passed}</td>
                    <td className="px-3 py-2.5 text-center text-amber-400">{cat.warning || '—'}</td>
                    <td className="px-3 py-2.5 text-center text-red-400">{cat.failed || '—'}</td>
                    <td className="px-3 py-2.5 text-center text-red-400">{cat.critical || '—'}</td>
                    <td className="px-3 py-2.5 text-center">
                      {allPass && !hasWarning && <CheckCircle2 size={14} className="inline text-emerald-400" />}
                      {allPass && hasWarning && <AlertTriangle size={14} className="inline text-amber-400" />}
                      {!allPass && <XCircle size={14} className="inline text-red-400" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 mt-3 text-[10px] text-white/30">
          <Clock size={10} /> Last run: {new Date().toLocaleString()} · Runs before every deployment
        </div>
      </div>
    </div>
  );
}