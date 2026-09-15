import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  getStatus,
  executeReadinessRead,
  executeProspectIntelligence,
  executeProspectCreate,
  executeReadOwnProspects,
  executeQualifyOwnProspect,
  executeUpdateProspectStatus,
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
    if (action === 'execute_prospect_intelligence') return await executeProspectIntelligence(svc, user, body);
    if (action === 'execute_prospect_create') return await executeProspectCreate(svc, user, body);
    if (action === 'execute_read_own_prospects') return await executeReadOwnProspects(svc, user, body);
    if (action === 'execute_qualify_own_prospect') return await executeQualifyOwnProspect(svc, user, body);
    if (action === 'execute_update_prospect_status') return await executeUpdateProspectStatus(svc, user, body);
    if (action === 'get_execution') return await getExecution(svc, user, body);
    if (action === 'decide_approval') return await decideApproval(svc, user, body);
    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}