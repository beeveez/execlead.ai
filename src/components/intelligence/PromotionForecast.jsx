import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Clock, ArrowRight, AlertCircle } from "lucide-react";

/**
 * PromotionForecast — AI-generated promotion readiness estimate.
 * Clearly states it's an AI-generated estimate, not a guarantee.
 */
export default function PromotionForecast({ forecast, profile }) {
  if (!forecast) return null;
  const { probability, timelineLow, timelineHigh, confidence, factorBreakdown } = forecast;

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/15 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">AI Promotion Forecast™</h3>
        </div>
        {confidence === 'High' && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">High Confidence</span>
        )}
      </div>

      {/* Probability display */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Promotion Probability</div>
          <div className="text-3xl font-bold text-white">{probability}%</div>
          <div className="text-white/40 text-xs mt-1">
            {profile?.current_role || "Current"} → {profile?.target_role || "Target"}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end mb-1">
            <Clock size={12} className="text-cyan-400" />
            <span className="text-white/60 text-xs uppercase tracking-wider">Estimated Timeline</span>
          </div>
          <div className="text-white font-bold text-lg">
            {timelineLow > 0 ? `${timelineLow}–${timelineHigh} months` : "Ready now"}
          </div>
          <div className="text-white/40 text-xs mt-0.5">Confidence: {confidence}</div>
        </div>
      </div>

      {/* Probability bar */}
      <div className="mb-5">
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${probability}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
          />
        </div>
      </div>

      {/* Factor breakdown */}
      {factorBreakdown && (
        <div className="mb-5">
          <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">Forecast Factors</h4>
          <div className="space-y-1.5">
            {factorBreakdown.map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <span className="text-sm w-5">{f.icon}</span>
                <span className="text-white/50 text-xs flex-1">{f.label}</span>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${(f.points / f.max) * 100}%` }} />
                </div>
                <span className="text-white/60 text-xs font-medium w-12 text-right">{f.points}/{f.max}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI recommendations */}
      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
        <p className="text-white/40 text-xs mb-2">To improve your promotion readiness:</p>
        <div className="space-y-1.5">
          {[
            { label: 'Increase Executive Reputation by 50 points', path: '/reputation' },
            { label: 'Complete Financial Leadership', path: '/academy' },
            { label: 'Publish a Leadership Letter', path: '/legacy-library/new' },
            { label: 'Complete Executive Strategy Simulation', path: '/simulator' },
          ].map((rec, i) => (
            <Link key={i} to={rec.path} className="flex items-center justify-between text-xs text-white/60 hover:text-white/90 group">
              <span>• {rec.label}</span>
              <ArrowRight size={10} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
        <AlertCircle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-400/70 text-[10px] leading-relaxed">
          Promotion Forecast is an AI-generated development estimate based on platform signals. It does NOT guarantee employment or promotion.
        </p>
      </div>
    </div>
  );
}