/**
 * EXECLEAD.AI — Release Stage Engine™
 * ============================================================
 * Derives the current release stage from the deployment pipeline
 * result. Replaces hardcoded sprint references with a dynamic
 * computation that always reflects the actual platform lifecycle.
 *
 * Pipeline stages:
 *   1. Security Hardening™
 *   2. Security Verification™
 *   3. Release Candidate™ (RC1)
 *   4. Executive Release Review™
 *   5. Production Certification™
 *   6. Execution Stream 4™ — Enterprise Procurement™
 */

const PIPELINE_STORAGE_KEY = "deployment_pipeline_result";

const STAGE_LABELS = [
  { id: "security_hardening", label: "Security Hardening™" },
  { id: "security_verification", label: "Security Verification™" },
  { id: "rc1", label: "Release Candidate™ (RC1)" },
  { id: "executive_release_review", label: "Executive Release Review™" },
  { id: "production_certification", label: "Production Certification™" },
  { id: "sprint_4", label: "Execution Stream 4™ — Enterprise Procurement™" },
];

export function getPipelineResult() {
  try {
    const stored = localStorage.getItem(PIPELINE_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export function persistPipelineResult(result) {
  try {
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(result));
  } catch {}
}

/**
 * Compute the current release stage from the pipeline result.
 *
 * Rules:
 * - No pipeline result → Security Verification™ (default starting stage)
 * - RC1 not built → Security Verification™
 * - RC1 exists but Executive Release Review not passed → Release Candidate™ (RC1)
 * - Executive Release Review passes but Production Certification pending → Executive Release Review™
 * - Production Certification passes → Production Certification™
 * - Sprint 4 only active after Production Certification = PASS
 */
export function computeReleaseStage() {
  const result = getPipelineResult();
  if (!result || !result.stages) {
    return {
      currentStage: "Security Verification™",
      currentStageId: "security_verification",
      currentMilestone: "Security Verification™",
      nextMilestone: "Release Candidate™ (RC1)",
      pipelineProgress: "0/6 completed",
      completedCount: 0,
      releaseStatus: "—",
      sprint4Active: false,
      sprints: [
        { id: 1, label: "Security Hardening™", status: "Complete" },
        { id: 2, label: "Security Verification™", status: "Complete" },
        { id: 3, label: "RC1™", status: "Complete" },
        { id: 4, label: "Execution Stream 4™", status: "Locked" },
      ],
    };
  }

  const stages = result.stages;
  const rc1Built = stages.rc1?.status === "completed";
  const reviewPassed = stages.executive_release_review?.status === "completed";
  const reviewWarning = stages.executive_release_review?.status === "warning";
  const certPassed = stages.production_certification?.status === "completed";
  const sprint4Active = stages.sprint_4?.status === "completed";

  let currentStageId;
  if (!rc1Built) {
    currentStageId = "security_verification";
  } else if (!reviewPassed && !reviewWarning) {
    currentStageId = "rc1";
  } else if ((reviewPassed || reviewWarning) && !certPassed) {
    currentStageId = reviewPassed ? "executive_release_review" : "rc1";
  } else if (certPassed) {
    currentStageId = sprint4Active ? "sprint_4" : "production_certification";
  } else {
    currentStageId = "security_verification";
  }

  const stageIdx = STAGE_LABELS.findIndex((s) => s.id === currentStageId);
  const currentStage = STAGE_LABELS[stageIdx];
  const nextStage = STAGE_LABELS[stageIdx + 1];

  const completedCount = STAGE_LABELS.filter((s) => {
    const stage = stages[s.id];
    return stage && (stage.status === "completed" || (s.id === "executive_release_review" && stage.status === "warning"));
  }).length;

  const releaseStatusMap = { GO: "GO", CONDITIONAL_GO: "CONDITIONAL GO", BLOCKED: "BLOCKED" };
  const releaseStatus = result.finalDecision ? releaseStatusMap[result.finalDecision] || "BLOCKED" : "—";

  return {
    currentStage: currentStage.label,
    currentStageId: currentStage.id,
    currentMilestone: currentStage.label,
    nextMilestone: nextStage?.label || "Complete",
    pipelineProgress: `${completedCount}/${STAGE_LABELS.length} completed`,
    completedCount,
    releaseStatus,
    sprint4Active,
    sprints: [
      { id: 1, label: "Security Hardening™", status: "Complete" },
      { id: 2, label: "Security Verification™", status: "Complete" },
      { id: 3, label: "RC1™", status: "Complete" },
      { id: 4, label: "Execution Stream 4™", status: sprint4Active ? "Active" : "Locked" },
    ],
  };
}