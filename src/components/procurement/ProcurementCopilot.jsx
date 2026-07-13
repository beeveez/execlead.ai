import React, { useMemo } from "react";
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, ChevronRight } from "lucide-react";
import { computeCopilotInsights, formatCurrency } from "@/lib/procurementEngine";

export default function ProcurementCopilot({ requests, onSelectRequest }) {
  const data = useMemo(() => computeCopilotInsights(requests), [requests]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Sparkles size={18} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">EXEC™ Procurement Copilot</h2>
            <p className="text-white/40 text-xs">AI-powered procurement intelligence & recommendations</p>
          </div>
        </div>
        <p className="text-white/50 text-xs leading-relaxed">
          Analyzing {data.metrics.total} procurement requests with {formatCurrency(data.metrics.totalSpend)} in approved spend.
          SLA compliance at {data.metrics.slaCompliance}%. {data.risks.length} risk(s) and {data.recommendations.length} recommendation(s) identified.
        </p>
      </div>

      {/* Risk Alerts */}
      {data.risks.length > 0 && (
        <div className="bg-red-500/[0.03] border border-red-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-400" />
            <h3 className="text-red-400 text-sm font-semibold uppercase tracking-wider">Risk Alerts</h3>
          </div>
          <div className="space-y-2">
            {data.risks.map((risk, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/5">
                <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
                <span className="text-sm text-white/60">{risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-amber-400" />
            <h3 className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Recommendations</h3>
          </div>
          <div className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5">
                <Lightbulb size={12} className="text-amber-400 mt-0.5 shrink-0" />
                <span className="text-sm text-white/60">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intelligence Insights */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-indigo-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Intelligence Insights</h3>
        </div>
        <div className="space-y-2">
          {data.insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02]">
              <ChevronRight size={12} className="text-indigo-400 mt-0.5 shrink-0" />
              <span className="text-sm text-white/60">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Vendors */}
      {data.vendorAnalysis.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-indigo-400" />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Top Vendors by Spend</h3>
          </div>
          <div className="space-y-2">
            {data.vendorAnalysis.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02]">
                <span className="text-xs text-white/30 w-4">{i + 1}</span>
                <span className="text-sm text-white/70 flex-1 truncate">{v.name}</span>
                <span className="text-xs text-white/40">{v.count} request(s)</span>
                <span className="text-sm text-white/60 font-medium">{formatCurrency(v.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}