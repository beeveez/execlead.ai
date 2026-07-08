import React from "react";
import { useAIOperations } from "@/hooks/useAIOperations";
import { fmtCost, fmtNum } from "@/lib/aiOperations";
import { DollarSign, TrendingUp, Loader2 } from "lucide-react";

export default function CostPanel() {
  const { loading, analytics } = useAIOperations();
  const t = analytics?.totals || {};
  const byModel = analytics?.byModel || [];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-white/30" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Cost Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <DollarSign size={14} className="text-emerald-400 mb-2" />
          <div className="text-2xl font-bold text-white">{fmtCost(t.todayCost || 0)}</div>
          <div className="text-white/30 text-xs">Daily Spend</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <TrendingUp size={14} className="text-indigo-400 mb-2" />
          <div className="text-2xl font-bold text-white">{fmtCost(t.monthCost || 0)}</div>
          <div className="text-white/30 text-xs">Monthly Spend</div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <DollarSign size={14} className="text-amber-400 mb-2" />
          <div className="text-2xl font-bold text-white">{fmtNum(t.monthTokens || 0)}</div>
          <div className="text-white/30 text-xs">Monthly Tokens</div>
        </div>
      </div>
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
        <h3 className="text-white/60 text-sm font-medium mb-3">Cost per Model</h3>
        <div className="space-y-2">
          {byModel.length > 0 ? byModel.map((m, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-white/60 font-mono text-xs flex-1 truncate">{m.model || 'unknown'}</span>
              <span className="text-white/30 text-xs">{fmtNum(m.totalTokens || 0)} tokens</span>
              <span className="text-emerald-400 font-medium">{fmtCost(m.cost || 0)}</span>
            </div>
          )) : <p className="text-white/20 text-xs text-center py-4">No cost data available</p>}
        </div>
      </div>
    </div>
  );
}