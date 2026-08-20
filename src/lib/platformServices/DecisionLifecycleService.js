import { getConfig } from '@/lib/configurationRegistry';
import {
  canTransitionDecisionLifecycle,
  createDecisionLifecycle,
  transitionDecisionLifecycle,
} from '@/lib/decision-lifecycle/decisionLifecycleModel';
import { DECISION_LIFECYCLE_NEXT, DECISION_LIFECYCLE_ORDER } from '@/lib/decision-lifecycle/decisionLifecycleConfig';

export const DecisionLifecycleService = {
  name: 'DecisionLifecycleService',
  version: () => getConfig('decision.lifecycle_version', '1.0'),
  stages: () => [...DECISION_LIFECYCLE_ORDER],
  create: createDecisionLifecycle,
  canAdvance: canTransitionDecisionLifecycle,
  advance: transitionDecisionLifecycle,
  nextStage(currentStage) {
    return DECISION_LIFECYCLE_NEXT[currentStage] || null;
  },
};

export default DecisionLifecycleService;