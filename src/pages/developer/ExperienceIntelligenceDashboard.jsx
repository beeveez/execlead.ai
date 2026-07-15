import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getExperienceHealth } from '@/lib/experienceIntelligence/experienceEngine';
import { getInterventionStats } from '@/lib/experienceIntelligence/interventionEngine';
import { getRhythmStats } from '@/lib/experienceIntelligence/operatingRhythm';
import { getGraphHealth } from '@/lib/experienceIntelligence/intelligenceGraph';
import { getRegistryHealth } from '@/lib/experienceIntelligence/experienceRegistry';
import { getRecommendationStats } from '@/lib/experienceIntelligence/recommendationEngine';
import ExperienceHealthHero from '@/components/experience-intelligence/ExperienceHealthHero';
import ExperienceMetricsGrid from '@/components/experience-intelligence/ExperienceMetricsGrid';
import InterventionPanel from '@/components/experience-intelligence/InterventionPanel';
import GraphHealthPanel from '@/components/experience-intelligence/GraphHealthPanel';
import OperatingRhythmPanel from '@/components/experience-intelligence/OperatingRhythmPanel';
import { Brain, Activity, Zap, TrendingUp } from 'lucide-react';

export default function ExperienceIntelligenceDashboard() {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHealth = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await getExperienceHealth(user);
    setHealth(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadHealth(); }, [loadHealth]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await loadHealth();
    setRefreshing(false);
  };

  const interventionStats = getInterventionStats();
  const rhythmStats = getRhythmStats();
  const graphHealth = getGraphHealth();
  const registryHealth = getRegistryHealth();
  const recStats = getRecommendationStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Brain size={12} className="text-indigo-400" />
            Experience Intelligence™
          </div>
          <h1 className="text-2xl font-bold text-white -mt-3">Experience Intelligence Dashboard™</h1>
          <p className="text-white/40 text-sm -mt-2 max-w-2xl leading-relaxed">
            The orchestration layer that transforms independent modules into one coordinated
            Executive Operating System. Tracks experience health, synchronization, recommendations,
            memory, behavior, notifications, and interventions.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          <Activity size={11} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Experience Health Hero */}
      {health && (
        <ExperienceHealthHero health={health} />
      )}

      {/* Metrics Grid */}
      {health && (
        <ExperienceMetricsGrid health={health} />
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interventions */}
        {health && (
          <InterventionPanel interventions={health.interventions} stats={interventionStats} />
        )}

        {/* Intelligence Graph */}
        <GraphHealthPanel graphHealth={graphHealth} registryHealth={registryHealth} recStats={recStats} />
      </div>

      {/* Operating Rhythm */}
      <OperatingRhythmPanel rhythmStats={rhythmStats} />

      {/* Architecture Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest mb-3">
          <Zap size={12} className="text-amber-400" />
          Architecture
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="text-center p-3 bg-white/[0.02] rounded-lg">
            <TrendingUp size={16} className="text-sky-400 mx-auto mb-1" />
            <div className="text-white/40">Layer 1</div>
            <div className="text-white font-semibold">Executive Experiences</div>
          </div>
          <div className="text-center p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Brain size={16} className="text-indigo-400 mx-auto mb-1" />
            <div className="text-indigo-400">Layer 2</div>
            <div className="text-white font-semibold">Experience Intelligence™</div>
          </div>
          <div className="text-center p-3 bg-white/[0.02] rounded-lg">
            <Activity size={16} className="text-violet-400 mx-auto mb-1" />
            <div className="text-white/40">Layer 3</div>
            <div className="text-white font-semibold">Executive Intelligence™</div>
          </div>
          <div className="text-center p-3 bg-white/[0.02] rounded-lg">
            <Zap size={16} className="text-amber-400 mx-auto mb-1" />
            <div className="text-white/40">Layer 4</div>
            <div className="text-white font-semibold">AI Control Plane™</div>
          </div>
          <div className="text-center p-3 bg-white/[0.02] rounded-lg">
            <Brain size={16} className="text-emerald-400 mx-auto mb-1" />
            <div className="text-white/40">Layer 5</div>
            <div className="text-white font-semibold">Platform Foundation™</div>
          </div>
        </div>
        <div className="mt-3 text-center text-[10px] text-white/30">
          Experience Intelligence™ is NOT a workspace — it is an orchestration layer that coordinates every executive experience.
        </div>
      </div>
    </div>
  );
}