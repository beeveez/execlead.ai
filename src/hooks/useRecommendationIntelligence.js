import { useState, useEffect, useCallback } from "react";
import { useOutcomeIntelligence } from "@/hooks/useOutcomeIntelligence";
import {
  computeRecommendationIntelligence,
  attributionFromOutcomeIntelligence,
  getAllRecommendationRecords,
  generateRecommendation,
  presentRecommendation,
  acceptRecommendation,
  startRecommendation,
  completeRecommendation,
  measureRecommendationOutcome,
  registerModel,
  promoteChallenger,
  rollbackTo,
  getActiveModel,
  getChallengerModel,
} from "@/lib/recommendationIntelligenceEngine";

/**
 * useRecommendationIntelligence — loads recommendation records (localStorage)
 * plus real observed outcome gains (from Outcome Intelligence™), computes
 * Recommendation Intelligence™, and exposes the full lifecycle + model API.
 */
export function useRecommendationIntelligence() {
  const { intelligence: outcomeIntel } = useOutcomeIntelligence();
  const [records, setRecords] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [activeModel, setActiveModel] = useState(null);
  const [challenger, setChallenger] = useState(null);

  const refresh = useCallback(() => {
    setRecords(getAllRecommendationRecords());
    setActiveModel(getActiveModel());
    setChallenger(getChallengerModel());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const attribution = attributionFromOutcomeIntelligence(outcomeIntel);
    setIntelligence(computeRecommendationIntelligence(attribution));
  }, [records, outcomeIntel]);

  const registerAndRefresh = (version, description) => {
    const m = registerModel(version, description);
    refresh();
    return m;
  };
  const promoteAndRefresh = () => {
    const m = promoteChallenger();
    refresh();
    return m;
  };
  const rollbackAndRefresh = (version) => {
    const m = rollbackTo(version);
    refresh();
    return m;
  };

  return {
    loading: !intelligence,
    records,
    intelligence,
    activeModel,
    challenger,
    refresh,
    generateRecommendation,
    presentRecommendation,
    acceptRecommendation,
    startRecommendation,
    completeRecommendation,
    measureRecommendationOutcome,
    registerModel: registerAndRefresh,
    promoteChallenger: promoteAndRefresh,
    rollbackTo: rollbackAndRefresh,
  };
}