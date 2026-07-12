import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * Scheduled Reports™ — Backend Generator
 * ======================================
 * Called by a daily scheduled automation. Finds all active ScheduledReport
 * records whose next_run_at has passed, generates an EnterpriseReport snapshot
 * from the latest GovernanceCertificate, and advances the schedule.
 *
 * Also supports manual "Run Now" via { scheduled_report_id } in the payload.
 */

function calculateNextRun(scheduled, now) {
  const next = new Date(now);
  const [hh, mm] = (scheduled.time || "02:00").split(":").map((n) => parseInt(n) || 0);

  if (scheduled.frequency === "daily") {
    next.setDate(next.getDate() + 1);
    next.setHours(hh, mm, 0, 0);
  } else if (scheduled.frequency === "weekly") {
    const targetDay = scheduled.day_of_week ?? 1;
    next.setDate(next.getDate() + 7);
    const diff = (targetDay - next.getDay() + 7) % 7;
    next.setDate(next.getDate() + diff);
    next.setHours(hh, mm, 0, 0);
  } else if (scheduled.frequency === "monthly") {
    next.setMonth(next.getMonth() + 1);
    next.setDate(scheduled.day_of_month || 1);
    next.setHours(hh, mm, 0, 0);
  }
  return next;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let body = {};
    try { body = await req.json(); } catch (_) {}

    // Manual trigger requires admin
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    if (body.scheduled_report_id) {
      if (!user || user.role !== "admin") {
        return Response.json({ error: "Admin access required to trigger reports manually" }, { status: 403 });
      }
    }

    const now = new Date();

    // Find due reports
    let dueReports;
    if (body.scheduled_report_id) {
      dueReports = await base44.asServiceRole.entities.ScheduledReport.filter({ id: body.scheduled_report_id });
    } else {
      const allActive = await base44.asServiceRole.entities.ScheduledReport.filter({ status: "active" }, "-created_date", 100);
      dueReports = allActive.filter((r) => !r.next_run_at || new Date(r.next_run_at) <= now);
    }

    if (dueReports.length === 0) {
      return Response.json({ success: true, generated: 0, message: "No scheduled reports due." });
    }

    // Get latest governance certificate for metrics
    const certs = await base44.asServiceRole.entities.GovernanceCertificate.list("-created_date", 1);
    const latestCert = certs[0];

    const results = [];

    for (const scheduled of dueReports) {
      // Determine next version
      const existing = await base44.asServiceRole.entities.EnterpriseReport.filter(
        { report_name: scheduled.report_name },
        "-version",
        1
      );
      const nextVersion = (existing[0]?.version || 0) + 1;

      const reportId = `RPT-${Math.floor(10000 + Math.random() * 90000)}`;
      const hash = `EXEC-SIG-${Math.random().toString(16).slice(2, 18).padEnd(16, "0")}`;

      // Create EnterpriseReport record
      const report = await base44.asServiceRole.entities.EnterpriseReport.create({
        report_name: scheduled.report_name,
        report_type: scheduled.report_type,
        version: nextVersion,
        report_id: reportId,
        integrity_hash: hash,
        generated_date: now.toISOString(),
        generated_by_name: "Scheduled Reports™",
        generated_by_source: "scheduled",
        downloads: 0,
        recipients: scheduled.recipients || "Internal",
        status: "active",
        platform_score: latestCert?.overall_governance_score || 0,
        warnings: latestCert?.warnings || 0,
        failures: latestCert?.failures || 0,
        security_score: latestCert?.manifest_health || 0,
        readiness_score: latestCert?.deployment_readiness || 0,
        scheduled_report_id: scheduled.id,
      });

      // Calculate next run
      const nextRun = calculateNextRun(scheduled, now);

      // Update scheduled report
      await base44.asServiceRole.entities.ScheduledReport.update(scheduled.id, {
        last_run_at: now.toISOString(),
        next_run_at: body.scheduled_report_id ? scheduled.next_run_at : nextRun.toISOString(),
        last_report_id: report.id,
        total_generated: (scheduled.total_generated || 0) + 1,
      });

      results.push({
        report_name: scheduled.report_name,
        report_id: report.report_id,
        version: nextVersion,
        platform_score: report.platform_score,
      });
    }

    return Response.json({ success: true, generated: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});