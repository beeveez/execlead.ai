import { useMemo, useCallback } from "react";
import { useRecommendationIntelligence } from "@/hooks/useRecommendationIntelligence";
import { useReadinessEvidence } from "@/hooks/useReadinessEvidence";
import {
  buildDecisionExplanation,
  computeAITrustScore,
  exportDecisionTrace,
} from "@/lib/decisionTransparencyEngine";

/**
 * useDecisionTransparency — builds the explanation for the current top
 * recommendation, the AI Trust Score™, and a decision-trace export helper.
 */
export function useDecisionTransparency() {
  const { intelligence: recIntel, outcomeIntel } = useRecommendationIntelligence();
  const { readiness, gaps } = useReadinessEvidence();

  const explanation = useMemo(() => {
    if (!recIntel) return null;
    const top = recIntel.topPerformers?.[0] || recIntel.byActivityType?.[0];
    if (!top) return null;
    return buildDecisionExplanation({
      activityType: top.activityType,
      competency: top.competency,
      recIntel,
      outcomeIntel,
      readiness,
      gapAnalysis: gaps,
    });
  }, [recIntel, outcomeIntel, readiness, gaps]);

  const trustScore = useMemo(
    () => computeAITrustScore({ recIntel, outcomeIntel, readiness }),
    [recIntel, outcomeIntel, readiness]
  );

  const exportTrace = useCallback(() => {
    const blob = new Blob([exportDecisionTrace(explanation)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execlead-decision-trace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [explanation]);

  const explain = useCallback(
    (activityType, competency) =>
      buildDecisionExplanation({
        activityType,
        competency,
        recIntel,
        outcomeIntel,
        readiness,
        gapAnalysis: gaps,
      }),
    [recIntel, outcomeIntel, readiness, gaps]
  );

  return { explanation, trustScore, exportTrace, explain };
}