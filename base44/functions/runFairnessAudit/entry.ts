import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  authenticateRequest,
  enforceAuth,
  getClientIp,
  logAuditRecord,
} from '../../shared/auth.ts';
import {
  FAIRNESS_AUDIT_DIMENSIONS,
  computeFairnessAudit,
  buildModelChangeRegressionChecklist,
  normalizeAuditGroup,
} from '../../shared/fairnessAuditEngine.js';

// ============================================================
// EXECLEAD.AI — Fairness Audit Engine™ (P0)
// Governed, deterministic fairness audit execution boundary.
//
// SECURITY BOUNDARY — fail closed. NO ReadinessAssessment/UserProfile read,
// FairnessAudit read/write, or audit result computation may execute until the
// request passes one of the two VERIFIED gates from shared/auth.ts:
//   1. DISPATCH_BATCH_TOKEN system secret (constant-time, server-side env only)
//   2. Authenticated governance role via base44.auth.me()
// Fairness audit data is governance-only: ordinary users are denied (403).
// This function NEVER invokes AI — the audit is fully deterministic and
// computes only from stored assessment evidence. AI output is decision
// support for human review, never an autonomous employment decision.
// ============================================================

const AUDIT_ADMIN_ROLES = ['super_admin', 'platform_admin', 'admin', 'developer', 'founder_root_admin'];
const MAX_ASSESSMENT_SAMPLE = 2000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const clientIp = getClientIp(req);

    const auth = await authenticateRequest(req, base44, {
      body,
      requireAdmin: true,
      allowSystemSecret: true,
      adminRoles: AUDIT_ADMIN_ROLES,
    });
    const authError = await enforceAuth(base44, auth, 'run_fairness_audit', clientIp);
    if (authError) return authError;

    const actor = auth.isSystemCall
      ? { id: 'system_fairness_audit_scheduler', name: 'Fairness Audit Scheduler' }
      : { id: auth.user.id, name: auth.user.full_name || auth.user.email };

    const action = typeof body.action === 'string' ? body.action : '';
    if (!action) return Response.json({ error: 'action required' }, { status: 400 });

    // ── run_audit: execute a controlled fairness audit and persist the result ──
    if (action === 'run_audit') {
      const dimensionDef = FAIRNESS_AUDIT_DIMENSIONS.find((d) => d.id === body.dimension);
      if (!dimensionDef) {
        return Response.json({ error: 'Unknown audit dimension' }, { status: 400 });
      }

      const sampleLimit = Math.min(Math.max(Number(body.sample_limit) || 500, 1), MAX_ASSESSMENT_SAMPLE);
      const assessments = await base44.asServiceRole.entities.ReadinessAssessment.list('-created_date', sampleLimit);

      let cohorts = [];
      if (dimensionDef.source === 'profile') {
        // Data minimization: only the dimension's own profile field is extracted.
        const profiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', MAX_ASSESSMENT_SAMPLE);
        const profileByUser = new Map(profiles.map((p) => [p.user_id, p]));
        cohorts = assessments.map((a) => {
          const profile = profileByUser.get(a.user_id);
          const raw = profile ? profile[dimensionDef.profileField] : null;
          const group = normalizeAuditGroup(raw, dimensionDef.profileField);
          return { auditGroup: group || 'unspecified', assessment: a };
        });
      } else {
        // controlled_cohort_only — protected/proxy attributes are NEVER
        // auto-collected. The governance operator must explicitly supply the
        // approved cohort labels for this audit.
        const supplied = Array.isArray(body.cohorts) ? body.cohorts : [];
        if (!supplied.length) {
          return Response.json({
            error: `Dimension "${dimensionDef.id}" is controlled-cohort-only. Provide explicitly approved cohort labels [{ user_id, audit_group }] for this audit. Protected attributes are never collected from production profiles.`,
          }, { status: 400 });
        }
        const cohortByUser = new Map(supplied.map((c) => [c.user_id, c]));
        cohorts = assessments
          .filter((a) => cohortByUser.has(a.user_id))
          .map((a) => ({ auditGroup: String(cohortByUser.get(a.user_id).audit_group || 'unspecified'), assessment: a }));
      }

      const result = computeFairnessAudit({
        auditId: `FA-${Date.now()}`,
        assessmentType: body.assessment_type || 'executive_readiness',
        modelVersion: body.model_version || 'unrecorded',
        assessmentVersion: body.assessment_version || 'unrecorded',
        dimension: dimensionDef.id,
        populationDefinition: body.population_definition || `Stored ${body.assessment_type || 'executive_readiness'} assessments (most recent ${assessments.length})`,
        cohorts,
      });

      const record = {
        audit_id: result.auditId,
        assessment_type: result.assessmentType,
        model_version: result.modelVersion,
        assessment_version: result.assessmentVersion,
        test_date: result.testDate,
        population_definition: result.populationDefinition,
        audit_dimensions: [result.dimension],
        test_methodology: result.testMethodology,
        sample_size: result.sampleSize,
        substantive_sample_size: result.substantiveSampleSize,
        outcome_distribution_json: JSON.stringify(result.outcomeDistribution),
        groups_json: JSON.stringify(result.groups),
        disparity_indicator: result.disparityIndicator,
        disparity_ratio: result.disparityRatio,
        evidence_coverage: result.evidenceCoverage,
        insufficient_evidence_rate: result.insufficientEvidenceRate,
        explainability_coverage: result.explainabilityCoverage,
        detected_issues_json: JSON.stringify(result.detectedIssues),
        principle_tests_json: JSON.stringify(result.principleTests),
        highest_severity: result.highestSeverity,
        status: result.status,
        remediation_recommendation: result.remediationRecommendation,
        human_review_required: result.humanReviewRequired,
        revision_number: 1,
        challenge_status: 'none',
        created_by_name: actor.name,
      };
      await base44.asServiceRole.entities.FairnessAudit.create(record);

      await logAuditRecord(base44, {
        category: 'governance',
        action: 'fairness_audit_run',
        performedById: actor.id,
        performedByName: actor.name,
        targetEntity: 'FairnessAudit',
        targetEntityId: record.audit_id,
        status: 'success',
        severity: 'info',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: { dimension: result.dimension, audit_status: result.status, sample_size: result.sampleSize },
      });

      return Response.json({ ok: true, audit: record, groups: result.groups, principle_tests: result.principleTests, human_review_boundary: result.humanReviewBoundary });
    }

    // ── list_audits ──
    if (action === 'list_audits') {
      const audits = await base44.asServiceRole.entities.FairnessAudit.list('-created_date', Math.min(Number(body.limit) || 20, 100));
      return Response.json({ audits });
    }

    // ── get_audit ──
    if (action === 'get_audit') {
      if (!body.audit_id) return Response.json({ error: 'audit_id required' }, { status: 400 });
      const audits = await base44.asServiceRole.entities.FairnessAudit.filter({ audit_id: body.audit_id }, '-created_date', 10);
      if (!audits.length) return Response.json({ error: 'Audit not found' }, { status: 404 });
      return Response.json({ audit: audits[0] });
    }

    // ── review_audit: record the human reviewer's decision (decision support,
    //    never an autonomous employment decision) ──
    if (action === 'review_audit') {
      if (!body.audit_id) return Response.json({ error: 'audit_id required' }, { status: 400 });
      const audits = await base44.asServiceRole.entities.FairnessAudit.filter({ audit_id: body.audit_id }, '-created_date', 10);
      if (!audits.length) return Response.json({ error: 'Audit not found' }, { status: 404 });
      const updated = await base44.asServiceRole.entities.FairnessAudit.update(audits[0].id, {
        reviewer: actor.name,
        review_date: new Date().toISOString().slice(0, 10),
        ...(typeof body.challenge_status === 'string' ? { challenge_status: body.challenge_status } : {}),
      });
      await logAuditRecord(base44, {
        category: 'governance',
        action: 'fairness_audit_reviewed',
        performedById: actor.id,
        performedByName: actor.name,
        targetEntity: 'FairnessAudit',
        targetEntityId: body.audit_id,
        status: 'success',
        severity: 'info',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: {},
      });
      return Response.json({ ok: true, audit: updated });
    }

    // ── revise_audit: appeal/correction linkage — append-only, never overwrite.
    //    The original result fields are NEVER modified; only the linkage field
    //    superseded_by_audit_id is set on the original, and the revision record
    //    receives parent linkage + changed-fields identification. ──
    if (action === 'revise_audit') {
      const { original_audit_id, revision_audit_id, changed_fields, reason, challenge_status } = body;
      if (!original_audit_id || !revision_audit_id) {
        return Response.json({ error: 'original_audit_id and revision_audit_id are required' }, { status: 400 });
      }
      const originals = await base44.asServiceRole.entities.FairnessAudit.filter({ audit_id: original_audit_id }, '-created_date', 10);
      const original = originals[0];
      if (!original) return Response.json({ error: 'Original audit not found' }, { status: 404 });
      const revisions = await base44.asServiceRole.entities.FairnessAudit.filter({ audit_id: revision_audit_id }, '-created_date', 10);
      const revision = revisions[0];
      if (!revision) return Response.json({ error: 'Revision audit not found (re-run the audit first — revisions are separate records)' }, { status: 404 });
      if (original.id === revision.id) {
        return Response.json({ error: 'A revision must be a separate audit record' }, { status: 400 });
      }

      await base44.asServiceRole.entities.FairnessAudit.update(revision.id, {
        parent_audit_id: original.audit_id,
        revision_number: (Number(original.revision_number) || 1) + 1,
        changed_fields_json: JSON.stringify(Array.isArray(changed_fields) ? changed_fields : []),
        revision_reason: String(reason || '').slice(0, 1000),
        challenge_status: typeof challenge_status === 'string' ? challenge_status : 'reassessment_requested',
      });
      // Linkage only — the original's result fields remain intact and traceable.
      await base44.asServiceRole.entities.FairnessAudit.update(original.id, {
        superseded_by_audit_id: revision.audit_id,
      });

      await logAuditRecord(base44, {
        category: 'governance',
        action: 'fairness_audit_revision_linked',
        performedById: actor.id,
        performedByName: actor.name,
        targetEntity: 'FairnessAudit',
        targetEntityId: revision.audit_id,
        status: 'success',
        severity: 'info',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: { original_audit_id: original.audit_id },
      });
      return Response.json({ ok: true, original_preserved: true, revision_audit_id: revision.audit_id });
    }

    // ── metrics_summary: Ethics Audit Metrics™ (§8) — computed from stored
    //    audits only; unmeasured metrics are reported as not_measured so no
    //    unearned "100%" claim can ever be displayed ──
    if (action === 'metrics_summary') {
      const audits = await base44.asServiceRole.entities.FairnessAudit.list('-created_date', 100);
      const nonPass = audits.filter((a) => a.status === 'REVIEW' || a.status === 'FAIL');
      const revisions = audits.filter((a) => a.parent_audit_id || (Number(a.revision_number) || 1) > 1);
      const challenges = audits.filter((a) => a.challenge_status && a.challenge_status !== 'none');
      const avg = (key) => audits.length
        ? Math.round(audits.reduce((s, a) => s + (Number(a[key]) || 0), 0) / audits.length)
        : 0;
      const modelVersions = [...new Set(audits.map((a) => a.model_version).filter(Boolean))];
      const metrics = {
        total_audits: audits.length,
        latest_audit: audits[0] ? { audit_id: audits[0].audit_id, status: audits[0].status, test_date: audits[0].test_date } : null,
        avg_evidence_coverage: avg('evidence_coverage'),
        avg_insufficient_evidence_rate: avg('insufficient_evidence_rate'),
        avg_explainability_coverage: avg('explainability_coverage'),
        open_issues: nonPass.length,
        human_review_pending: audits.filter((a) => a.human_review_required && !a.reviewer).length,
        revisions: revisions.length,
        challenges: challenges.length,
        remediation_status: nonPass.length === 0 ? 'no_open_remediation' : `${nonPass.length} audit(s) require remediation review`,
        model_change_regression: modelVersions.length > 1
          ? buildModelChangeRegressionChecklist(modelVersions[0], modelVersions[modelVersions.length - 1])
          : null,
        // Honest unmeasured metrics — the UI must never display these as 100%.
        not_measured_by_this_engine: ['hallucination_rate', 'human_override_rate', 'assessment_disagreement_rate', 'incident_count'],
      };
      return Response.json({ metrics });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});