import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  getStatus,
  executeReadinessRead,
  getExecution,
  decideApproval,
} from '../../shared/agentOrchestrationCore.ts';

/**
 * Agent Orchestration Service™ — Phase 5.1
 * ============================================================
 * Thin router over the shared Agent Orchestration Core™
 * (base44/shared/agentOrchestrationCore.ts) — the SINGLE authoritative
 * Workforce execution boundary. The governance implementation lives in the
 * shared core so the legacy aiWorkforce compatibility adapter converges on
 * exactly the same enforcement path (no second governance implementation).
 */

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const svc = base44.asServiceRole;

    if (action === 'get_status') return await getStatus(svc);
    if (action === 'execute_readiness_read') return await executeReadinessRead(svc, user, body);
    if (action === 'get_execution') return await getExecution(svc, user, body);
    if (action === 'decide_approval') return await decideApproval(svc, user, body);
    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}