import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const PERMANENT_CATEGORIES = ['security', 'governance', 'audit'];
const RETENTION_DAYS = 365;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Admin-only — retention cleanup is a platform operation
    if (user.role !== 'super_admin' && user.role !== 'platform_admin' && user.role !== 'admin' && user.role !== 'developer') {
      return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
    }

    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    // Delete non-permanent activities older than 365 days
    const result = await base44.asServiceRole.entities.PlatformActivity.deleteMany({
      created_date: { $lt: cutoff.toISOString() },
      category: { $nin: PERMANENT_CATEGORIES },
    });

    const deleted = result?.deleted_count || 0;

    // Log the cleanup itself as a permanent audit activity
    await base44.asServiceRole.entities.PlatformActivity.create({
      activity_id: 'act-retention-cleanup-' + Date.now(),
      category: 'audit',
      subcategory: 'retention',
      severity: 'success',
      status: 'completed',
      workspace: 'platform',
      module: 'platform_activity_center',
      feature: 'RetentionEngine',
      action: 'Retention Cleanup Executed',
      performed_by_name: user.full_name || user.email || 'System',
      description: `Deleted ${deleted} platform activities older than ${RETENTION_DAYS} days. Permanent categories (security, governance, audit) preserved.`,
      tags: ['retention', 'cleanup', 'automated'],
    });

    return Response.json({
      status: 'success',
      deleted,
      retention_days: RETENTION_DAYS,
      permanent_categories: PERMANENT_CATEGORIES,
      cutoff: cutoff.toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});