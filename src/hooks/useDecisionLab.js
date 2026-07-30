import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import {
  evaluateDecision as engineEvaluate,
  computeDNA, computePatterns, getAnalytics, getAchievements, uid,
} from "@/lib/decisionLabEngine";

/**
 * useDecisionLab — loads the Scenario Library, the user's decision attempts,
 * and their Decision DNA™ profile. Exposes AI evaluation, attempt saving,
 * and profile computation/persistence.
 */
export function useDecisionLab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [profile, setProfile] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [sc, at, pf] = await Promise.allSettled([
      base44.entities.DecisionScenario.list("category", 100),
      base44.entities.DecisionAttempt.filter({}, "-created_date", 100),
      base44.entities.DecisionProfile.filter({}, "-created_date", 1),
    ]);
    setScenarios(sc.status === "fulfilled" ? sc.value : []);
    setAttempts(at.status === "fulfilled" ? at.value : []);
    setProfile(pf.status === "fulfilled" && pf.value?.[0] ? pf.value[0] : null);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const evaluate = useCallback(async (scenario, chosenStrategy, explanation) => {
    setEvaluating(true);
    try { return await engineEvaluate(scenario, chosenStrategy, explanation); }
    finally { setEvaluating(false); }
  }, []);

  const saveAttempt = useCallback(async (scenario, chosenStrategy, explanation, result, reflection) => {
    const record = await base44.entities.DecisionAttempt.create({
      attempt_id: uid("DA"),
      user_id: user.id,
      user_name: user?.full_name || user?.email,
      scenario_id: scenario.scenario_id,
      scenario_title: scenario.title,
      category: scenario.category,
      difficulty: scenario.difficulty,
      chosen_strategy_id: chosenStrategy?.id,
      chosen_strategy_name: chosenStrategy?.name,
      explanation,
      scores_json: JSON.stringify(result.scores || {}),
      overall_score: result.overall || 0,
      strengths: result.strengths || [],
      blind_spots: result.blind_spots || [],
      missed_opportunities: result.missed_opportunities || [],
      alternative_strategies: result.alternative_strategies || [],
      business_impact: result.business_impact || "",
      confidence_level: result.confidence_level || 0,
      evidence_quality: result.evidence_quality || 0,
      challenge_questions_json: JSON.stringify(result.challenge_questions || []),
      perspectives_json: JSON.stringify(result.perspectives || []),
      comparison_json: JSON.stringify(result.comparison || {}),
      reflection_json: reflection ? JSON.stringify(reflection) : "",
      feedback: result.feedback || "",
      completed_at: new Date().toISOString(),
    });
    setAttempts((prev) => [record, ...prev]);
    return record;
  }, [user]);

  const persistProfile = useCallback(async (allAttempts) => {
    const dna = computeDNA(allAttempts);
    const patterns = computePatterns(allAttempts);
    const avgQuality = allAttempts.length ? Math.round(allAttempts.reduce((a, x) => a + (x.overall_score || 0), 0) / allAttempts.length) : 0;
    const payload = {
      archetypes_json: JSON.stringify(dna.archetypes),
      dominant_archetype: dna.dominant_archetype,
      dimension_averages_json: JSON.stringify(dna.dimensionAverages),
      total_scenarios: allAttempts.length,
      avg_decision_quality: avgQuality,
      decision_patterns_json: JSON.stringify(patterns),
      recurring_strengths: patterns.recurring_strengths,
      recurring_weaknesses: patterns.recurring_weaknesses,
      favorite_strategies: patterns.favorite_strategies,
      learning_progress: Math.min(100, allAttempts.length * 2),
      decision_diversity: patterns.decision_diversity,
      updated_at: new Date().toISOString(),
    };
    let record;
    if (profile?.id) {
      record = await base44.entities.DecisionProfile.update(profile.id, payload);
    } else {
      record = await base44.entities.DecisionProfile.create({ profile_id: uid("DP"), user_id: user.id, ...payload });
    }
    setProfile(record);
    return record;
  }, [profile, user]);

  const createScenario = useCallback(async (data) => {
    const record = await base44.entities.DecisionScenario.create({ scenario_id: uid("DS"), ...data });
    setScenarios((prev) => [record, ...prev]);
    return record;
  }, []);

  const dna = useMemo(() => computeDNA(attempts), [attempts]);
  const analytics = useMemo(() => getAnalytics(attempts), [attempts]);
  const achievements = useMemo(() => getAchievements({ attempts }), [attempts]);

  return {
    loading, evaluating,
    scenarios, attempts, profile,
    dna, analytics, achievements,
    evaluate, saveAttempt, persistProfile, createScenario, refresh: load,
  };
}