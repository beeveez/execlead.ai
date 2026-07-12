import React from "react";
import ScalabilityOverview from "./ScalabilityOverview";
import CapacityReport from "./CapacityReport";
import BottleneckAnalysis from "./BottleneckAnalysis";
import ScalingPlan from "./ScalingPlan";
import LoadTestSimulation from "./LoadTestSimulation";
import ReadinessScores from "./ReadinessScores";
import ExecutiveSummary from "./ExecutiveSummary";

/**
 * Scalability Assessment Center™
 * The comprehensive platform scalability & capacity report.
 */
export default function ScalabilityAssessmentCenter() {
  return (
    <div className="space-y-5">
      <ScalabilityOverview />
      <CapacityReport />
      <BottleneckAnalysis />
      <LoadTestSimulation />
      <ScalingPlan />
      <ReadinessScores />
      <ExecutiveSummary />
    </div>
  );
}