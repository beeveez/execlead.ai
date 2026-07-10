import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReadinessScoreCard from "@/components/intelligence/ReadinessScoreCard";
import ReadinessDimensions from "@/components/intelligence/ReadinessDimensions";
import PromotionForecast from "@/components/intelligence/PromotionForecast";

export default function ExecutiveReadiness() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.functions.invoke("manageIntelligence", { action: "compute" });
        setData(res.data);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (!data) {
    return <div className="text-center py-20 text-white/30 text-sm">Unable to load your Executive Readiness. Please try again later.</div>;
  }

  const { readiness, profile, forecast } = data;
  const estimatedGain = readiness?.estimatedGain || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <TrendingUp size={12} className="text-indigo-400" />
          Executive Readiness Engine™
        </div>
        <h1 className="text-2xl font-bold text-white">Executive Readiness</h1>
        <p className="text-white/40 text-sm mt-1">Journey Points measure activity. Executive Readiness measures capability.</p>
      </div>

      {/* Readiness Score */}
      <ReadinessScoreCard readiness={readiness} profile={profile} />

      {/* AI Readiness Coach */}
      {readiness && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/15 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-indigo-400" />
            <h3 className="text-white font-semibold text-sm">AI Readiness Coach</h3>
          </div>
          <p className="text-white/60 text-sm mb-4">
            You're currently <span className="text-white font-bold">{readiness.overallScore}%</span> ready for a{" "}
            <span className="text-indigo-400 font-medium">{profile?.target_role || "Director"}</span> role.
            {readiness.estimatedMonths > 0 && <> Estimated readiness in <span className="text-cyan-400 font-medium">{readiness.estimatedMonths} months</span>.</>}
          </p>
          <p className="text-white/40 text-xs mb-3">The fastest way to improve is:</p>
          <div className="space-y-2">
            {readiness.recommendations.map((rec, i) => (
              <Link key={i} to={rec.path} className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg px-3 py-2 transition-all group">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg flex-shrink-0">{rec.icon}</span>
                  <span className="text-white/70 text-sm">{rec.label}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">+{rec.gain}%</span>
                  <ArrowRight size={14} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
          {estimatedGain > 0 && (
            <p className="text-white/40 text-xs mt-3 text-center">Estimated Readiness Gain: <span className="text-emerald-400 font-medium">+{estimatedGain}%</span></p>
          )}
        </div>
      )}

      {/* Promotion Forecast */}
      <PromotionForecast forecast={forecast} profile={profile} />

      {/* Readiness Dimensions */}
      <ReadinessDimensions dimensions={readiness?.dimensions || []} />

      {/* Career Alignment */}
      {profile && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Career Alignment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/[0.03] rounded-lg p-3 text-center">
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Current Readiness</div>
              <div className="text-white font-bold text-lg">{readiness?.overallScore || 0}%</div>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center">
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Target Position</div>
              <div className="text-white font-bold text-sm">{profile.target_role || "—"}</div>
              <div className="text-white/40 text-xs">{profile.target_company}</div>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center">
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Confidence Level</div>
              <div className="text-white font-bold text-lg">{readiness?.confidence || "Low"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}