import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { buildDigitalTwin } from '@/lib/executiveDigitalTwinEngine';
import { runDecisionSimulation, getDecisionTypeMeta } from '@/lib/decisionIntelligenceEngine';
import { Loader2, Brain, GitCompare, Clock, Sparkles, TrendingUp } from 'lucide-react';
import DecisionSimulator from '@/components/decision/DecisionSimulator';
import ScenarioComparison from '@/components/decision/ScenarioComparison';
import ExecutiveFuture from '@/components/decision/ExecutiveFuture';
import AIExecutiveAdvisor from '@/components/decision/AIExecutiveAdvisor';
import DecisionTimeline from '@/components/decision/DecisionTimeline';

const TABS = [
  { key: 'simulator', label: 'Decision Simulator', icon: TrendingUp },
  { key: 'comparison', label: 'Scenario Comparison', icon: GitCompare },
  { key: 'future', label: 'Executive Future', icon: Clock },
  { key: 'advisor', label: 'AI Advisor', icon: Sparkles },
  { key: 'timeline', label: 'Decision Timeline', icon: Brain },
];

export default function ExecutiveDecisionIntelligence() {
  const { user } = useAuth();
  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('simulator');
  const [simulationResult, setSimulationResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTwin = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [verificationRecs, logs, evidence, credentials, leadershipDNA, portfolioVersions, journeyEvents, lessonProgress, simulations, achievements, competencies, profiles] = await Promise.all([
        base44.entities.IdentityVerification.filter({ user_id: user.id }, '-created_date', 1).catch(() => []),
        base44.entities.VerificationLog.filter({ user_id: user.id }, '-created_date', 50).catch(() => []),
        base44.entities.EvidenceItem.filter({ created_by_id: user.id }, '-created_date', 50).catch(() => []),
        base44.entities.ExecutiveCredential.list('-created_date', 50).catch(() => []),
        base44.entities.LeadershipDNA.filter({ user_id: user.id }, '-created_date', 1).catch(() => []),
        base44.entities.PortfolioVersion.list('-created_date', 10).catch(() => []),
        base44.entities.JourneyEvent.filter({ user_id: user.id }, '-created_date', 30).catch(() => []),
        base44.entities.LessonProgress.filter({ user_id: user.id }, '-created_date', 50).catch(() => []),
        base44.entities.SimulationSession.filter({ user_id: user.id }, '-created_date', 20).catch(() => []),
        base44.entities.Achievement.filter({ user_id: user.id }, '-created_date', 30).catch(() => []),
        base44.entities.ExecutiveCompetency.filter({ user_id: user.id }, '-created_date', 30).catch(() => []),
        base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1).catch(() => []),
      ]);
      const built = buildDigitalTwin({
        user,
        verification: verificationRecs[0] || null,
        logs,
        evidence,
        credentials,
        leadershipDNA: leadershipDNA?.[0] || null,
        portfolioVersions,
        journeyEvents,
        lessonProgress,
        simulations,
        achievements,
        competencies,
        profile: profiles?.[0] || {},
      });
      setTwin(built);
    } catch (e) { /* error */ }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { loadTwin(); }, [loadTwin]);

  const handleSimulate = useCallback((decisionType, params) => {
    setRunning(true);
    setSimulationResult(null);
    setTimeout(() => {
      const result = runDecisionSimulation(twin, decisionType, params);
      setSimulationResult(result);
      setRunning(false);
    }, 400);
  }, [twin]);

  const handleSaveDecision = async () => {
    if (!simulationResult) return;
    setSaving(true);
    try {
      const typeMeta = getDecisionTypeMeta(simulationResult.decisionType);
      await base44.entities.ExecutiveDecision.create({
        title: `${typeMeta.label} — ${new Date().toLocaleDateString()}`,
        decision_type: simulationResult.decisionType,
        description: simulationResult.typeMeta?.description || '',
        params_json: JSON.stringify(simulationResult.params),
        predicted_trust: simulationResult.projected.trust,
        predicted_readiness: simulationResult.projected.readiness,
        predicted_confidence: simulationResult.predictionConfidence,
        predicted_salary_impact: simulationResult.projected.salaryImpact,
        predicted_risk_level: simulationResult.riskLevel,
        explainability_json: JSON.stringify(simulationResult.explainability),
        status: 'evaluating',
      });
    } catch (e) { /* error */ }
    setSaving(false);
  };

  if (loading || !twin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <Brain size={48} className="text-indigo-400/30" />
            <Sparkles size={16} className="text-violet-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <Loader2 size={14} className="animate-spin" />
            Building your Executive Digital Twin™...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
          <Brain size={12} className="text-violet-400" />
          Executive Decision Intelligence™
        </div>
        <h1 className="text-2xl font-bold text-white -mt-3">Executive Decision Intelligence™</h1>
        <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
          Evaluate career decisions with explainable AI, scenario simulation, and evidence-based forecasting
          powered by your Executive Digital Twin™.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-white/5 pb-px">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium transition-colors ${
                active
                  ? 'text-white border-b-2 border-violet-500 -mb-px'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'simulator' && (
          <DecisionSimulator
            twin={twin}
            onSimulate={handleSimulate}
            result={simulationResult}
            running={running}
            onSave={handleSaveDecision}
          />
        )}
        {activeTab === 'comparison' && <ScenarioComparison twin={twin} />}
        {activeTab === 'future' && <ExecutiveFuture twin={twin} />}
        {activeTab === 'advisor' && <AIExecutiveAdvisor twin={twin} />}
        {activeTab === 'timeline' && <DecisionTimeline />}
      </div>
    </div>
  );
}