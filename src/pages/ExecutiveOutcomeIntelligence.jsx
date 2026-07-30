import React from "react";
import { useOutcomeIntelligence } from "@/hooks/useOutcomeIntelligence";
import OutcomeIntelligenceDashboard from "@/components/outcome-intelligence/OutcomeIntelligenceDashboard";
import OutcomeAttributionPanel from "@/components/outcome-intelligence/OutcomeAttributionPanel";
import RecommendationEffectivenessPanel from "@/components/outcome-intelligence/RecommendationEffectivenessPanel";
import CoachEffectivenessPanel from "@/components/outcome-intelligence/CoachEffectivenessPanel";
import OutcomePredictionPanel from "@/components/outcome-intelligence/OutcomePredictionPanel";
import { Loader2 } from "lucide-react";

export default function ExecutiveOutcomeIntelligence() {
  const { loading, outcomes, intelligence } = useOutcomeIntelligence();

  if (loading || !intelligence) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        <span className="text-white/40 text-sm">Loading Executive Outcome Intelligence™…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OutcomeIntelligenceDashboard intelligence={intelligence} outcomes={outcomes} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OutcomePredictionPanel predictions={intelligence.predictions} />
        <RecommendationEffectivenessPanel effectiveness={intelligence.effectiveness} />
      </div>

      <CoachEffectivenessPanel coachEffectiveness={intelligence.coachEffectiveness} />

      <OutcomeAttributionPanel outcomes={intelligence.enriched} />
    </div>
  );
}