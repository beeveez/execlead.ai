import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  generatePromotionForecast, getLatestForecast, generateGrowthNarrative,
  FORECAST_VERSION,
} from '@/lib/promotionForecastEngine';
import { base44 } from '@/api/base44Client';
import ForecastHero from '@/components/promotion/ForecastHero';
import LeadershipDimensions from '@/components/promotion/LeadershipDimensions';
import ImprovementPriorities from '@/components/promotion/ImprovementPriorities';
import ExecutiveStatusBar from '@/components/shared/ExecutiveStatusBar';
import ExecutiveTrustLayer from '@/components/trust/ExecutiveTrustLayer';
import { buildPromotionForecastTrust } from '@/lib/executiveTrustEngine';
import { RefreshCw, Brain, TrendingUp } from 'lucide-react';

export default function PromotionForecast() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingNarrative, setGeneratingNarrative] = useState(false);

  const loadLatest = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const latest = await getLatestForecast(user.id);
    if (latest) {
      setForecast(latest);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadLatest(); }, [loadLatest]);

  const handleRefresh = async () => {
    if (!user || generating) return;
    setGenerating(true);
    const fresh = await generatePromotionForecast(user);
    setForecast(fresh);
    setGenerating(false);
    base44.analytics.track({ eventName: "promotion_forecast_generated", properties: { readiness: fresh.readiness_score } });
  };

  const handleGenerateNarrative = async () => {
    if (!forecast || generatingNarrative) return;
    setGeneratingNarrative(true);
    const narrative = await generateGrowthNarrative(user, forecast);
    if (narrative) {
      setForecast({ ...forecast, growth_narrative: narrative });
      try {
        await base44.entities.PromotionForecast.update(forecast.id, {
          growth_narrative_json: JSON.stringify(narrative),
        });
      } catch {}
    }
    setGeneratingNarrative(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <TrendingUp size={12} className="text-indigo-400" />
            Core Intelligence Service #1
          </div>
          <h1 className="text-2xl font-bold text-white -mt-3">Promotion Forecast™</h1>
          <p className="text-white/40 text-sm -mt-2 max-w-2xl leading-relaxed">
            Your living prediction of executive growth — answering where you are today, what's preventing
            your next promotion, what to improve first, and when you'll be promotion-ready.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={generating}
          className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={11} className={generating ? "animate-spin" : ""} />
          {generating ? "Forecasting..." : "Refresh Forecast"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
        </div>
      ) : !forecast ? (
        <div className="text-center py-20">
          <Brain size={32} className="text-indigo-400/30 mx-auto mb-3" />
          <p className="text-white/40 text-sm mb-3">No forecast data yet. Generate your first Promotion Forecast™.</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 text-[11px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-2"
          >
            <RefreshCw size={11} /> Generate Forecast
          </button>
        </div>
      ) : (
        <>
          <ExecutiveStatusBar />
          <ForecastHero forecast={forecast} />

          {/* Executive Trust Layer™ — forecast explainability */}
          <ExecutiveTrustLayer trust={buildPromotionForecastTrust(forecast)} />

          {/* Leadership Dimensions */}
          <LeadershipDimensions
            dimensions={forecast.dimensions}
            strengths={forecast.strengths}
            skillGaps={forecast.skill_gaps}
          />

          {/* Improvement Priorities + AI Narrative */}
          <ImprovementPriorities
            priorities={forecast.improvement_priorities}
            narrative={forecast.growth_narrative}
            onGenerateNarrative={handleGenerateNarrative}
            generatingNarrative={generatingNarrative}
          />
        </>
      )}
    </div>
  );
}