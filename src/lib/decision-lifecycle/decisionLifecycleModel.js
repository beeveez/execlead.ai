import { DECISION_LIFECYCLE_NEXT, DECISION_LIFECYCLE_PATHS, DECISION_LIFECYCLE_STAGES } from './decisionLifecycleConfig';

const ABBREVIATION_SOURCES = new Set([
  DECISION_LIFECYCLE_STAGES.EXPLORE,
  DECISION_LIFECYCLE_STAGES.MODEL,
  DECISION_LIFECYCLE_STAGES.CHALLENGE,
]);

export function createDecisionLifecycle({ decisionId = null, now = new Date().toISOString() } = {}) {
  return {
    decisionId,
    stage: DECISION_LIFECYCLE_STAGES.DRAFT,
    path: DECISION_LIFECYCLE_PATHS.FULL,
    stageHistory: [{ stage: DECISION_LIFECYCLE_STAGES.DRAFT, enteredAt: now }],
  };
}

export function canTransitionDecisionLifecycle(currentStage, targetStage, options = {}) {
  if (DECISION_LIFECYCLE_NEXT[currentStage] === targetStage) return true;
  const explicitAbbreviation = options.abbreviatedPath === true
    && options.userConfirmed === true
    && typeof options.abbreviationReason === 'string'
    && options.abbreviationReason.trim().length > 0;
  return explicitAbbreviation
    && ABBREVIATION_SOURCES.has(currentStage)
    && targetStage === DECISION_LIFECYCLE_STAGES.READY_TO_DECIDE;
}

export function transitionDecisionLifecycle(lifecycle, targetStage, options = {}) {
  if (!canTransitionDecisionLifecycle(lifecycle?.stage, targetStage, options)) {
    throw new Error(`Invalid decision lifecycle transition: ${lifecycle?.stage || 'UNKNOWN'} → ${targetStage}`);
  }
  const abbreviated = DECISION_LIFECYCLE_NEXT[lifecycle.stage] !== targetStage;
  const enteredAt = options.now || new Date().toISOString();
  return {
    ...lifecycle,
    stage: targetStage,
    path: abbreviated ? DECISION_LIFECYCLE_PATHS.ABBREVIATED : lifecycle.path,
    stageHistory: [...(lifecycle.stageHistory || []), {
      stage: targetStage,
      enteredAt,
      ...(abbreviated ? { abbreviationReason: options.abbreviationReason.trim() } : {}),
    }],
  };
}