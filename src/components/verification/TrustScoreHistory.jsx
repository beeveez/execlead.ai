import React from "react";
import { TrendingUp, TrendingDown, Minus, History } from "lucide-react";
import { getTrustScoreHistory, getTrustTrend, getTrustScore } from "@/lib/trustScoreHistoryEngine";

export default function TrustScoreHistory({ verification }) {
  const history = getTrustScoreHistory(verification);
  const trend = getTrustTrend(verification);
  const currentScore = getTrustScore(verification);

  if (!verification) return null;

  const TrendIcon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
  const trendColor = trend.direction === "up" ? "text-emerald-400" : trend.direction === "down" ? "text-red-400" : "text-white/30";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <History size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Trust Score History™</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-lg font-bold text-white">{currentScore}</span>
          {history.length >= 2 && (
            <span className={`flex items-center gap-0.5 text-xs ${trendColor}`}>
              <TrendIcon size={12} />
              {trend.delta > 0 ? `+${trend.delta}` : trend.delta}
            </span>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-6 text-xs text-white/30">
          No historical snapshots yet. Trust scores are captured when verification state changes.
        </div>
      ) : (
        <>
          {/* Trend visualization */}
          <div className="flex items-end gap-1 h-16 mb-4">
            {history.slice(-20).map((snap, i) => {
              const height = `${Math.max(4, (snap.trust_score / 100) * 100)}%`;
              return (
                <div key={i} className="flex-1 rounded-t-sm bg-indigo-500/20 transition-all hover:bg-indigo-500/40"
                  style={{ height }} title={`${snap.trust_score} — ${new Date(snap.timestamp).toLocaleDateString()}`} />
              );
            })}
          </div>

          {/* History table */}
          <div className="space-y-1">
            {history.slice(-5).reverse().map((snap, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.01] border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-indigo-400">{snap.trust_score}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] text-white/30">
                    <span>Confidence: {snap.evidence_confidence}%</span>
                    <span>·</span>
                    <span>Readiness: {snap.verification_readiness}%</span>
                    <span>·</span>
                    <span>Risk: {snap.risk_score}</span>
                  </div>
                  <div className="text-[10px] text-white/20 mt-0.5">
                    {new Date(snap.timestamp).toLocaleString()} · Level {snap.verification_level} · Policy v{snap.policy_version}
                  </div>
                </div>
                {i === 0 && <span className="text-[9px] text-indigo-400 uppercase tracking-wider">Current</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}