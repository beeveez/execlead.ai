import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    // Scheduled automations call with no payload — default to process_batch
    const { action } = { action: body.action ?? 'process_batch' };

    // ── Queue a background job (user-scoped) ──
    if (action === 'queue') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

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

      const job = await base44.entities.PerformanceJob.create({
        job_id: crypto.randomUUID(),
        job_type: body.job_type,
        target_user_id: body.target_user_id || user.id,
        target_user_name: user.full_name || '',
        target_entity: body.target_entity || '',
        target_entity_id: body.target_entity_id || '',
        status: 'queued',
        priority: body.priority || 'medium',
        payload_json: JSON.stringify(body.payload || {}),
        queued_at: new Date().toISOString(),
        triggered_by: body.triggered_by || 'user',
        triggered_by_name: user.full_name || '',
        idempotency_key: body.idempotency_key || crypto.randomUUID(),
      });

      return Response.json({ job_id: job.id, status: 'queued' });
    }

    // ── Get job status (owner or admin) ──
    if (action === 'status') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const job = await base44.entities.PerformanceJob.get(body.job_id);
      return Response.json(job);
    }

    // ── Queue stats (admin/dev only) ──
    if (action === 'stats') {
      const user = await base44.auth.me();
      if (!user || !['super_admin', 'platform_admin', 'admin', 'developer'].includes(user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      const queued = await base44.asServiceRole.entities.PerformanceJob.filter({ status: 'queued' });
      const running = await base44.asServiceRole.entities.PerformanceJob.filter({ status: 'running' });
      const completed = await base44.asServiceRole.entities.PerformanceJob.filter({ status: 'completed' }, '-completed_at', 10);
      const failed = await base44.asServiceRole.entities.PerformanceJob.filter({ status: 'failed' });
      const deadLetter = await base44.asServiceRole.entities.PerformanceJob.filter({ status: 'dead_letter' });

      const recentDurations = completed
        .map((j) => j.duration_ms || 0)
        .filter((d) => d > 0);
      const avgDuration = recentDurations.length > 0
        ? Math.round(recentDurations.reduce((s, d) => s + d, 0) / recentDurations.length)
        : 0;

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

    // ── Process batch (automation or admin) ──
    if (action === 'process_batch') {
      // Auth check — allow automation (no user) or admin
      let user = null;
      try { user = await base44.auth.me(); } catch (_) { /* automation context */ }
      if (user && !['super_admin', 'platform_admin', 'admin', 'developer'].includes(user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

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

      return Response.json({ processed: results.length, results });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});