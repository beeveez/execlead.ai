import React from "react";
import { Users, TrendingDown, Clock, Lightbulb } from "lucide-react";

export default function CommercialFunnel({ funnel }) {
  if (!funnel || funnel.length === 0) return null;
  const maxUsers = Math.max(...funnel.map(f => f.users), 1);

  return (
    <div className="space-y-3">
      {funnel.map((stage, i) => (
        <div key={stage.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
              <span className="text-sm font-semibold text-white">{stage.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-white/60"><Users className="w-3 h-3" /> {stage.users}</span>
              {i > 0 && <span className="text-emerald-400">{stage.conversionPct}% conv</span>}
              {i > 0 && <span className="text-rose-400">{stage.dropoffPct}% drop</span>}
              <span className="flex items-center gap-1 text-white/40"><Clock className="w-3 h-3" /> {stage.avgTimeDays}d avg</span>
            </div>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${(stage.users / maxUsers) * 100}%` }} />
          </div>
          <div className="flex items-start gap-1.5 text-xs text-white/40">
            <Lightbulb className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" />
            <span>{stage.recommendations}</span>
          </div>
        </div>
      ))}
    </div>
  );
}