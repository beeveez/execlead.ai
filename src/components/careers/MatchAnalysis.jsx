import React, { useState } from "react";
import { Sparkles, Loader2, Target, AlertCircle, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MatchScoreRing from "@/components/careers/MatchScoreRing";
import { getMatchColor } from "@/lib/careerMarketplace";

export default function MatchAnalysis({ jobId, heuristicScore, onMatchCalculated }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const calculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke("calculateJobMatch", { jobId });
      const data = response.data || response;
      if (data.success && data.match) {
        setResult(data.match);
        onMatchCalculated?.(data.match);
      } else {
        setError(data.error || "Failed to calculate match");
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to calculate match");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Loader2 size={20} className="animate-spin text-indigo-400" />
        <p className="text-xs text-white/40">Analyzing your executive match...</p>
      </div>
    );
  }

  if (!result && !error) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-white/40 mb-3">
          Get a personalized AI analysis of your match for this role — based on your resume, leadership DNA, skills, and career goals.
        </p>
        {heuristicScore !== null && (
          <p className="text-[10px] text-white/25 mb-3">
            Quick estimate: {heuristicScore}% match
          </p>
        )}
        <button
          onClick={calculate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
        >
          <Sparkles size={12} /> Calculate AI Match Score
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-red-400 mb-2">{error}</p>
        <button onClick={calculate} className="text-xs text-indigo-400 hover:text-indigo-300">
          Try again
        </button>
      </div>
    );
  }

  const score = result.match_score || 0;
  const color = getMatchColor(score);

  return (
    <div className="space-y-4">
      {/* Score Display */}
      <div className="flex items-center gap-4">
        <MatchScoreRing score={score} size={64} showLabel />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} style={{ color }} />
            <span className="text-xs text-white/40">Interview Probability</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{result.interview_probability || 0}%</span>
            <span className="text-xs text-white/30 capitalize">
              {result.salary_alignment && `Salary: ${result.salary_alignment}`}
            </span>
          </div>
          {result.summary && <p className="text-xs text-white/50 mt-1">{result.summary}</p>}
        </div>
      </div>

      {/* Why This Is a Good Match */}
      {result.match_reasons?.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 mb-1.5">
            <Target size={12} /> Why This Is a Good Match
          </div>
          <ul className="space-y-1">
            {result.match_reasons.map((reason, i) => (
              <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Qualifications */}
      {result.missing_qualifications?.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400 mb-1.5">
            <AlertCircle size={12} /> Missing Qualifications
          </div>
          <ul className="space-y-1">
            {result.missing_qualifications.map((gap, i) => (
              <li key={i} className="text-xs text-white/50 flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}