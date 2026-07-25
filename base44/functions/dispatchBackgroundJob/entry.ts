import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  authenticateRequest,
  enforceAuth,
  logAuditRecord,
  logSecurityEvent,
  securityResponse,
  getClientIp,
} from '../../shared/auth.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    // Scheduled automations call with no payload — default to process_batch
    const { action } = { action: body.action ?? 'process_batch' };
    const clientIp = getClientIp(req);

    // ── Queue a background job (admin-only — all job types invoke privileged backend functions) ──
    if (action === 'queue') {
      const auth = await authenticateRequest(req, base44, {
        body,
        requireAdmin: true,
        allowSystemSecret: false,
      });
      const authError = await enforceAuth(base44, auth, 'queue_job', clientIp);
      if (authError) return authError;

      // Check for existing job with same idempotency key
      if (body.idempotency_key) {
        const existing = await base44.asServiceRole.entities.PerformanceJob.filter(
          { idempotency_key: body.idempotency_key, status: { $in: ['queued', 'running'] } },
          '-queued_at',
          1
        );
        if (existing.length > 0) {
          return Response.json({ job_id: existing[0].id, status: existing[0].status, deduplicated: true });
        }
      }

      const jobEntity = auth.isSystemCall
        ? base44.asServiceRole.entities.PerformanceJob
        : base44.entities.PerformanceJob;

      const job = await jobEntity.create({
        job_id: crypto.randomUUID(),
        job_type: body.job_type,
        target_user_id: body.target_user_id || (auth.user?.id || ''),
        target_user_name: body.target_user_name || auth.user?.full_name || '',
        target_entity: body.target_entity || '',
        target_entity_id: body.target_entity_id || '',
        status: 'queued',
        priority: body.priority || 'medium',
        payload_json: JSON.stringify(body.payload || {}),
        queued_at: new Date().toISOString(),
        triggered_by: auth.isSystemCall ? (body.triggered_by || 'automation') : (body.triggered_by || 'user'),
        triggered_by_name: auth.user?.full_name || 'System',
        idempotency_key: body.idempotency_key || crypto.randomUUID(),
      });

      await logAuditRecord(base44, {
        category: 'operations',
        action: 'queue_background_job',
        authMethod: auth.authMethod,
        performedById: auth.user?.id || 'system',
        performedByName: auth.user?.full_name || 'System',
        targetEntity: 'PerformanceJob',
        targetEntityId: job.id,
        status: 'completed',
        severity: 'success',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: { job_type: body.job_type, priority: body.priority || 'medium' },
      });

      return Response.json({ job_id: job.id, status: 'queued' });
    }

    // ── Get job status (authenticated user — any role) ──
    if (action === 'status') {
      const auth = await authenticateRequest(req, base44, {
        body,
        requireAdmin: false,
        allowSystemSecret: false,
      });
      const authError = await enforceAuth(base44, auth, 'get_job_status', clientIp);
      if (authError) return authError;

      const jobEntity = auth.isSystemCall
        ? base44.asServiceRole.entities.PerformanceJob
        : base44.entities.PerformanceJob;
      const job = await jobEntity.get(body.job_id);
      return Response.json(job);
    }

    // ── Queue stats (admin/dev only) ──
    if (action === 'stats') {
      const auth = await authenticateRequest(req, base44, {
        body,
        requireAdmin: true,
        allowSystemSecret: false,
      });
      const authError = await enforceAuth(base44, auth, 'get_queue_stats', clientIp);
      if (authError) return authError;

      const queued = await base44.asServiceRole.entities.PerformanceJob.filter({ status: 'queued' });
      const running = await base44.asServiceRole.entities.PerformanceJob.filter({ status: 'running' });
      const completed = await base44.asServiceRole.entities.PerformanceJob.filter({ status: 'completed' }, '-completed_at', 10);
      const failed = await base44.asServiceRole.entities.PerformanceJob.filter({ status: 'failed' });
      const deadLetter = await base44.asServiceRole.entities.PerformanceJob.filter({ status: 'dead_letter' });

      const recentDurations = completed.map((j) => j.duration_ms || 0).filter((d) => d > 0);
      const avgDuration = recentDurations.length > 0
        ? Math.round(recentDurations.reduce((s, d) => s + d, 0) / recentDurations.length)
        : 0;

      await logAuditRecord(base44, {
        category: 'operations',
        action: 'get_queue_stats',
        authMethod: auth.authMethod,
        performedById: auth.user?.id || 'system',
        performedByName: auth.user?.full_name || 'System',
        status: 'completed',
        severity: 'information',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: { queued: queued.length, running: running.length, failed: failed.length },
      });

      return Response.json({
        queued: queued.length,
        running: running.length,
        completed: completed.length,
        failed: failed.length,
        dead_letter: deadLetter.length,
        avg_duration_ms: avgDuration,
        recent_completed: completed.slice(0, 5).map((j) => ({
          job_id: j.id,
          job_type: j.job_type,
          status: j.status,
          duration_ms: j.duration_ms,
          completed_at: j.completed_at,
        })),
      });
    }

    // ── Process batch (system call or admin) ──
    if (action === 'process_batch') {
      const auth = await authenticateRequest(req, base44, {
        body,
        requireAdmin: true,
        allowSystemSecret: true,
      });
      const authError = await enforceAuth(base44, auth, 'process_batch', clientIp);
      if (authError) return authError;

      const batchSize = body.batch_size || 5;
      const queuedJobs = await base44.asServiceRole.entities.PerformanceJob.filter(
        { status: 'queued' },
        'queued_at',
        batchSize
      );

      const results = [];

      for (const job of queuedJobs) {
        const startTime = Date.now();
        try {
          await base44.asServiceRole.entities.PerformanceJob.update(job.id, {
            status: 'running',
            started_at: new Date().toISOString(),
          });

          const payload = JSON.parse(job.payload_json || '{}');
          let result = null;

          // Route to appropriate function based on job_type
          switch (job.job_type) {
            case 'intelligence_recompute':
              result = await base44.asServiceRole.functions.invoke('manageIntelligence', payload);
              break;
            case 'reputation_recalculation':
              result = await base44.asServiceRole.functions.invoke('manageReputation', payload);
              break;
            case 'manifest_validation':
              result = await base44.asServiceRole.functions.invoke('syncPlatformManifest', payload);
              break;
            case 'foundation_verification':
              result = await base44.asServiceRole.functions.invoke('validateReleaseIntegrity', payload);
              break;
            case 'knowledge_sync':
              result = await base44.asServiceRole.functions.invoke('syncExecKnowledge', payload);
              break;
            case 'job_sync':
              result = await base44.asServiceRole.functions.invoke('syncJobs', payload);
              break;
            case 'executive_briefing':
              result = await base44.asServiceRole.functions.invoke('recomputeIntelligence', payload);
              break;
            case 'business_intelligence':
              result = await base44.asServiceRole.functions.invoke('generateBusinessIntelligence', payload);
              break;
            default:
              throw new Error(`Unknown job type: ${job.job_type}`);
          }

          const duration = Date.now() - startTime;
          const resultData = result?.data ?? result ?? {};

          await base44.asServiceRole.entities.PerformanceJob.update(job.id, {
            status: 'completed',
            completed_at: new Date().toISOString(),
            duration_ms: duration,
            result_json: typeof resultData === 'string' ? resultData : JSON.stringify(resultData),
          });

          results.push({ job_id: job.id, job_type: job.job_type, status: 'completed', duration_ms: duration });
        } catch (error) {
          const retryCount = (job.retry_count || 0) + 1;
          const maxRetries = job.max_retries || 3;
          const newStatus = retryCount >= maxRetries ? 'dead_letter' : 'retrying';

          await base44.asServiceRole.entities.PerformanceJob.update(job.id, {
            status: newStatus,
            error_message: error.message,
            retry_count: retryCount,
            completed_at: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
          });

          results.push({ job_id: job.id, job_type: job.job_type, status: newStatus, error: error.message });
        }
      }

      await logAuditRecord(base44, {
        category: 'operations',
        action: 'process_batch',
        authMethod: auth.authMethod,
        performedById: auth.user?.id || 'system',
        performedByName: auth.user?.full_name || 'System',
        targetEntity: 'PerformanceJob',
        status: 'completed',
        severity: 'success',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: { batch_size: batchSize, processed: results.length, results_summary: results.map((r) => ({ status: r.status })) },
      });

      return Response.json({ processed: results.length, results });
    }

    // Unknown action — deny by default
    return securityResponse(400);
  } catch (error) {
    // Never expose internal error details, secrets, or stack traces
    console.error('dispatchBackgroundJob error:', error.message);
    return securityResponse(500);
  }
});