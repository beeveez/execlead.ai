import React from "react";
import { SENTIMENT_STYLES, CONSENSUS_STYLES } from "@/lib/councilData";
import { Check, AlertTriangle, X } from "lucide-react";

export default function VotingSummary({ perspectives, consensusLevel, confidenceLevel }) {
  const counts = { support: 0, caution: 0, oppose: 0 };
  perspectives.forEach((p) => {
    const s = p?.sentiment || "caution";
    counts[s] = (counts[s] || 0) + 1;
  });
  const total = perspectives.length || 1;
  const consensusStyle = CONSENSUS_STYLES[consensusLevel] || CONSENSUS_STYLES.moderate;

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Board Voting Summary</h3>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${consensusStyle.bg} ${consensusStyle.color}`}>
            {consensusStyle.label}
          </span>
        </div>
      </div>

      {/* Sentiment bars */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(SENTIMENT_STYLES).map(([key, style]) => {
          const count = counts[key] || 0;
          const pct = Math.round((count / total) * 100);
          const Icon = key === "support" ? Check : key === "caution" ? AlertTriangle : X;
          return (
            <div key={key} className={`rounded-lg border p-3 ${style.cell}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon size={12} className={style.text} />
                <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-[10px] text-white/30">{pct}% of board</div>
              <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${style.dot}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Confidence gauge */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/40">Overall Board Confidence</span>
          <span className="text-sm font-bold text-white">{confidenceLevel || 0}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              (confidenceLevel || 0) >= 70 ? "bg-emerald-500" : (confidenceLevel || 0) >= 50 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${confidenceLevel || 0}%` }}
          />
        </div>
      </div>

      {/* Heat map */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Executive Sentiment Heat Map</div>
        <div className="flex flex-wrap gap-1.5">
          {perspectives.map((p, i) => {
            const style = SENTIMENT_STYLES[p?.sentiment || "caution"];
            const conf = p?.confidence || 0;
            return (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] ${style.cell}`}
                title={`${p.persona?.name}: ${style.label} (${conf}%)`}
              >
                <span className="text-sm">{p.persona?.icon}</span>
                <span className="text-white/60 font-medium">{p.persona?.name}</span>
                <span className={style.text}>{conf}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}