import React from "react";
import { Link } from "react-router-dom";
import { Star, ShieldCheck, ArrowRight } from "lucide-react";
import { getTrustTier } from "@/lib/intelligenceEngine";

/**
 * ReputationTrustCard — two-column summary of Executive Reputation
 * and Executive Trust with key metrics and deep-link navigation.
 */
export default function ReputationTrustCard({ reputation, trust }) {
  const trustTier = getTrustTier(trust?.totalScore || 0);
  const repScore = reputation?.reputation_score || 0;
  const repGrade = repScore >= 800 ? "A+" : repScore >= 600 ? "A" : repScore >= 400 ? "B" : repScore >= 200 ? "C" : "D";
  const verifiedCount = (trust?.levels || []).filter((l) => l.unlocked).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Reputation */}
      <Link to="/reputation" className="block bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/15 rounded-2xl p-5 hover:border-amber-500/30 transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-amber-400" />
            <h3 className="text-white font-semibold text-sm">Executive Reputation™</h3>
          </div>
          <ArrowRight size={14} className="text-amber-400/50 group-hover:translate-x-1 transition-transform" />
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-amber-400">{repScore}</span>
          <span className="text-white/30 text-sm">/ 1000</span>
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400">Grade {repGrade}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Metric label="Community Trust" value={reputation?.community_trust_score || 0} />
          <Metric label="Credibility" value={reputation?.executive_credibility_score || 0} />
          <Metric label="Influence" value={reputation?.leadership_influence_pct || 0} suffix="%" />
          <Metric label="Conduct" value={reputation?.professional_conduct_score || 0} />
        </div>
        {reputation?.reputation_trend && (
          <div className="mt-2 text-xs text-white/40">
            Trend: <span className={reputation.reputation_trend === "up" ? "text-emerald-400" : "text-white/50"}>{reputation.reputation_trend}</span>
          </div>
        )}
      </Link>

      {/* Trust */}
      <Link to="/identity-verification" className="block bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/15 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h3 className="text-white font-semibold text-sm">Executive Trust™</h3>
          </div>
          <ArrowRight size={14} className="text-emerald-400/50 group-hover:translate-x-1 transition-transform" />
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className={`text-3xl font-bold ${trustTier.color}`}>{trust?.totalScore || 0}</span>
          <span className="text-white/30 text-sm">/ 100</span>
          <span className={`ml-auto text-xs font-medium ${trustTier.color}`}>{trust?.tier || trustTier.label}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(trust?.levels || []).slice(0, 5).map((l) => (
            <span
              key={l.id}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${
                l.unlocked ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/[0.02] text-white/20 border-white/5"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </span>
          ))}
        </div>
        <div className="mt-2 text-xs text-white/40">{verifiedCount} of {(trust?.levels || []).length} trust levels verified</div>
      </Link>
    </div>
  );
}

function Metric({ label, value, suffix }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1.5">
      <div className="text-white/70 font-medium">{value}{suffix}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </div>
  );
}