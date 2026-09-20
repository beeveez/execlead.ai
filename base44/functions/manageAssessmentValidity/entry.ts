import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  authenticateRequest,
  enforceAuth,
  getClientIp,
  logAuditRecord,
} from '../../shared/auth.ts';
import {
  evaluateValidity,
  deriveEvidenceFromAssessment,
  buildRevision,
  buildHumanOverride,
  evaluateEmploymentDecisionRequest,
} from '../../shared/assessmentValidityEngine.js';

// ============================================================
// EXECLEAD.AI — Assessment Validity & Human Agency Gate™ (P0.2)
// Governed execution boundary for the Assessment Validity Engine™.
//
// SECURITY BOUNDARY — the backend is the authoritative authorization boundary:
//   • Governance operations (evaluate, reassess, review, override) require a
//     VERIFIED governance role via base44.auth.me() or the
//     DISPATCH_BATCH_TOKEN system secret (constant-time, server-side env).
//   • Ordinary users may only view THEIR OWN validity records/challenges,
//     submit challenges, and supply additional evidence — subject scoping is
//     derived server-side from the authenticated caller and enforced here,
//     never trusted from the client.
//   • EMPLOYMENT DECISION BOUNDARY: no action executes an autonomous
//     hiring/promotion/succession/termination decision. Such requests are
//     always refused (403) and routed to human decision.
//   • Append-only: reassessments create NEW linked revision records; the
//     original assessment/conclusion is never overwritten.
//   • NO AI invocation — validity evaluation is fully deterministic.
// ============================================================

const GOV_ROLES = ['super_admin', 'platform_admin', 'admin', 'developer', 'founder_root_admin'];

function safeParse(value, fallback) {
  try { const p = JSON.parse(value); return p === null || p === undefined ? fallback : p; } catch { return fallback; }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const clientIp = getClientIp(req);

    const auth = await authenticateRequest(req, base44, {
      body,
      requireAdmin: false, // per-action role enforcement below
      allowSystemSecret: true,
      adminRoles: GOV_ROLES,
    });
    const authError = await enforceAuth(base44, auth, 'manage_assessment_validity', clientIp);
    if (authError) return authError;

    const isGov = auth.isSystemCall || (auth.user && GOV_ROLES.includes(auth.user.role));
    const actorName = auth.isSystemCall
      ? 'Assessment Validity Scheduler'
      : (auth.user && (auth.user.full_name || auth.user.email)) || 'authenticated user';
    const action = typeof body.action === 'string' ? body.action : '';
    if (!action) return Response.json({ error: 'action required' }, { status: 400 });

    // ── §9 Employment decision boundary — always refused ──
    if (action === 'employment_decision') {
      const refusal = evaluateEmploymentDecisionRequest(body.operation);
      await logAuditRecord(base44, {
        category: 'governance',
        action: 'employment_decision_refused',
        performedById: auth.user?.id || 'system',
        performedByName: actorName,
        targetEntity: 'AssessmentValidityRecord',
        status: 'failed',
        severity: 'warning',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: { requested_operation: body.operation, outcome: refusal.outcome },
      });
      return Response.json({ error: 'Employment decision boundary enforced', refusal }, { status: 403 });
    }

    const govDenied = () => Response.json({ error: 'Governance access required' }, { status: 403 });

    // ── load an assessment record (entity id or assessment_id property) ──
    async function loadAssessment(assessmentId) {
      if (!assessmentId) return null;
      let assessment = null;
      try { assessment = await base44.asServiceRole.entities.ReadinessAssessment.get(assessmentId); } catch { /* not entity id */ }
      if (!assessment) {
        const found = await base44.asServiceRole.entities.ReadinessAssessment.filter({ assessment_id: assessmentId }, '-created_date', 5);
        assessment = found[0] || null;
      }
      return assessment;
    }

    // ── evaluate: deterministic validity evaluation (governance) ──
    if (action === 'evaluate') {
      if (!isGov) return govDenied();
      const { assessment_id, dimension } = body;
      if (!assessment_id || !dimension) return Response.json({ error: 'assessment_id and dimension are required' }, { status: 400 });

      const assessment = await loadAssessment(assessment_id);
      if (!assessment) return Response.json({ error: 'Assessment not found' }, { status: 404 });

      const derived = deriveEvidenceFromAssessment(assessment, dimension);
      const supplied = Array.isArray(body.evidence) ? body.evidence : [];
      const evidence = [
        ...derived.evidence,
        ...supplied.map((e, i) => ({
          id: `se-${i + 1}`,
          source: e.source || 'governance_supplied',
          signal_type: e.signal_type || 'reasoning',
          quality: e.quality || 'medium',
          supports: e.supports === 'contradicts' ? 'contradicts' : 'supports',
          description: e.description || '',
        })),
      ];

      const result = evaluateValidity({
        assessmentId: assessment.assessment_id || assessment_id,
        assessmentType: body.assessment_type || 'executive_readiness',
        dimension,
        conclusion: body.conclusion !== undefined ? body.conclusion : derived.conclusion,
        conclusionLevel: body.conclusion_level !== undefined ? body.conclusion_level : derived.conclusionLevel,
        conclusionSource: body.conclusion_source || 'evidence_derived',
        confidence: body.confidence !== undefined ? body.confidence : derived.confidence,
        evidence,
        modelVersion: body.model_version,
        assessmentVersion: body.assessment_version,
      });

      const subjectUserId = body.subject_user_id || assessment.user_id || auth.user?.id || '';
      const now = new Date().toISOString();

      // Append-only: re-evaluating the same assessment+dimension becomes a linked revision
      const existing = await base44.asServiceRole.entities.AssessmentValidityRecord
        .filter({ assessment_id: result.assessmentId, dimension }, '-created_date', 50);
      const latest = existing[0] || null;

      let revisionMeta = { parent_validity_id: '', revision_number: 1, changed_fields_json: '[]', revision_reason: '' };
      if (latest) {
        const changed = [];
        if (latest.validity_status !== result.validityStatus) changed.push('validity_status');
        if (latest.conclusion !== result.conclusion) changed.push('conclusion');
        if (Number(latest.confidence_adjusted) !== Number(result.confidenceAdjusted)) changed.push('confidence_adjusted');
        const rev = buildRevision(latest, changed, body.reason || 're-evaluation', actorName);
        revisionMeta = {
          parent_validity_id: rev.parent_validity_id,
          revision_number: rev.revision_number,
          changed_fields_json: rev.changed_fields_json,
          revision_reason: rev.revision_reason,
        };
      }

      const record = {
        validity_id: latest ? `${latest.validity_id.split('-R')[0]}-R${revisionMeta.revision_number}` : `AV-${Date.now()}`,
        assessment_id: result.assessmentId,
        assessment_type: result.assessmentType,
        dimension,
        intended_construct: `${result.intendedConstruct} — ${result.constructDescription}`.slice(0, 300),
        evidence_json: JSON.stringify(result.evidenceConsidered),
        construct_warnings_json: JSON.stringify(result.constructWarnings),
        missing_evidence_json: JSON.stringify(result.missingEvidence),
        contradictory_evidence_json: JSON.stringify(result.contradictoryEvidence),
        conclusion: result.conclusion || '',
        conclusion_level: result.conclusionLevel,
        conclusion_source: result.conclusionSource,
        confidence_original: result.confidenceOriginal,
        confidence_adjusted: result.confidenceAdjusted,
        validity_status: result.validityStatus,
        trace_json: JSON.stringify(result.trace),
        interpretation: result.interpretation,
        additional_evidence_would_improve_json: JSON.stringify(result.additionalEvidenceWouldImprove),
        model_version: result.provenance.modelVersion,
        assessment_version: result.provenance.assessmentVersion,
        governance_framework_version: result.provenance.frameworkVersion,
        provenance_incomplete: result.provenance.provenanceIncomplete,
        assessed_at: now,
        human_review_required: result.humanReviewRequired,
        revision_number: revisionMeta.revision_number,
        parent_validity_id: revisionMeta.parent_validity_id,
        changed_fields_json: revisionMeta.changed_fields_json,
        revision_reason: revisionMeta.revision_reason,
        human_decision_type: 'none',
        subject_user_id: subjectUserId,
        created_by_name: actorName,
      };
      await base44.asServiceRole.entities.AssessmentValidityRecord.create(record);
      if (latest) {
        // Linkage only — the original's result fields are never overwritten.
        await base44.asServiceRole.entities.AssessmentValidityRecord.update(latest.id, {
          superseded_by_validity_id: record.validity_id,
        });
      }

      await logAuditRecord(base44, {
        category: 'governance',
        action: 'assessment_validity_evaluated',
        performedById: auth.user?.id || 'system',
        performedByName: actorName,
        targetEntity: 'AssessmentValidityRecord',
        targetEntityId: record.validity_id,
        status: 'success',
        severity: 'info',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: { dimension, validity_status: result.validityStatus, revision: record.revision_number },
      });

      return Response.json({ ok: true, record, provenance_note: result.provenance.note, employment_boundary: result.employmentBoundary });
    }

    // ── get_validity: subject-scoped for ordinary users, full for governance ──
    if (action === 'get_validity') {
      if (body.validity_id) {
        const found = await base44.asServiceRole.entities.AssessmentValidityRecord.filter({ validity_id: body.validity_id }, '-created_date', 10);
        const record = found[0];
        if (!record) return Response.json({ error: 'Validity record not found' }, { status: 404 });
        if (!isGov && record.subject_user_id !== auth.user?.id) {
          return Response.json({ error: 'Not permitted' }, { status: 403 });
        }
        return Response.json({ records: [record] });
      }
      const limit = Math.min(Number(body.limit) || 25, 100);
      let records;
      if (isGov && !body.own_only) {
        records = body.subject_user_id
          ? await base44.asServiceRole.entities.AssessmentValidityRecord.filter({ subject_user_id: body.subject_user_id }, '-created_date', limit)
          : await base44.asServiceRole.entities.AssessmentValidityRecord.list('-created_date', limit);
      } else {
        if (!auth.user) return Response.json({ error: 'User authentication required' }, { status: 401 });
        // Server-side subject scoping — ordinary users only ever receive their own records.
        records = await base44.asServiceRole.entities.AssessmentValidityRecord.filter({ subject_user_id: auth.user.id }, '-created_date', limit);
      }
      return Response.json({ records });
    }

    // ── submit_challenge: any authenticated user challenges their own conclusion ──
    if (action === 'submit_challenge') {
      if (!auth.user) return Response.json({ error: 'User authentication required' }, { status: 401 });
      const { validity_id, assessment_id, reason, user_context, additional_evidence, requested_action } = body;
      if (!validity_id || !reason) return Response.json({ error: 'validity_id and reason are required' }, { status: 400 });

      const found = await base44.asServiceRole.entities.AssessmentValidityRecord.filter({ validity_id }, '-created_date', 10);
      const record = found[0];
      if (!record) return Response.json({ error: 'Validity record not found' }, { status: 404 });
      // Subject scoping is enforced server-side — users may only challenge their own assessments.
      if (!isGov && record.subject_user_id !== auth.user.id) {
        return Response.json({ error: 'Not permitted' }, { status: 403 });
      }

      const evidenceItems = (Array.isArray(additional_evidence) ? additional_evidence : [])
        .filter((e) => e && e.description)
        .map((e) => ({
          description: String(e.description).slice(0, 1000),
          signal_type: e.signal_type || 'demonstrated_behavior',
          quality: e.quality || 'medium',
          supports: e.supports === 'contradicts' ? 'contradicts' : 'supports',
        }));

      const challenge = {
        challenge_id: `CH-${Date.now()}`,
        validity_id,
        assessment_id: assessment_id || record.assessment_id,
        subject_user_id: record.subject_user_id || auth.user.id,
        reason: String(reason).slice(0, 2000),
        user_context: String(user_context || '').slice(0, 2000),
        additional_evidence_json: JSON.stringify(evidenceItems),
        requested_action: ['reassessment', 'review', 'correction'].includes(requested_action) ? requested_action : 'reassessment',
        status: 'submitted',
        created_by_name: actorName,
      };
      await base44.asServiceRole.entities.AssessmentChallenge.create(challenge);

      await logAuditRecord(base44, {
        category: 'governance',
        action: 'assessment_challenge_submitted',
        performedById: auth.user.id,
        performedByName: actorName,
        targetEntity: 'AssessmentChallenge',
        targetEntityId: challenge.challenge_id,
        status: 'success',
        severity: 'info',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: { validity_id, requested_action: challenge.requested_action },
      });

      return Response.json({ ok: true, challenge, original_preserved: true });
    }

    // ── submit_additional_evidence: user appends evidence to their challenge ──
    if (action === 'submit_additional_evidence') {
      if (!auth.user) return Response.json({ error: 'User authentication required' }, { status: 401 });
      const { challenge_id, additional_evidence } = body;
      if (!challenge_id) return Response.json({ error: 'challenge_id required' }, { status: 400 });
      const found = await base44.asServiceRole.entities.AssessmentChallenge.filter({ challenge_id }, '-created_date', 10);
      const challenge = found[0];
      if (!challenge) return Response.json({ error: 'Challenge not found' }, { status: 404 });
      if (!isGov && challenge.subject_user_id !== auth.user.id) {
        return Response.json({ error: 'Not permitted' }, { status: 403 });
      }

      const incoming = (Array.isArray(additional_evidence) ? additional_evidence : [])
        .filter((e) => e && e.description)
        .map((e) => ({
          description: String(e.description).slice(0, 1000),
          signal_type: e.signal_type || 'demonstrated_behavior',
          quality: e.quality || 'medium',
          supports: e.supports === 'contradicts' ? 'contradicts' : 'supports',
        }));
      const merged = [...safeParse(challenge.additional_evidence_json, []), ...incoming];
      await base44.asServiceRole.entities.AssessmentChallenge.update(challenge.id, {
        additional_evidence_json: JSON.stringify(merged),
        status: 'additional_evidence_received',
      });
      return Response.json({ ok: true, evidence_count: merged.length, reassessment_possible: true });
    }

    // ── list_challenges: own for ordinary users, all for governance ──
    if (action === 'list_challenges') {
      const limit = Math.min(Number(body.limit) || 25, 100);
      let challenges;
      if (isGov) {
        challenges = body.subject_user_id
          ? await base44.asServiceRole.entities.AssessmentChallenge.filter({ subject_user_id: body.subject_user_id }, '-created_date', limit)
          : await base44.asServiceRole.entities.AssessmentChallenge.list('-created_date', limit);
      } else {
        if (!auth.user) return Response.json({ error: 'User authentication required' }, { status: 401 });
        challenges = await base44.asServiceRole.entities.AssessmentChallenge.filter({ subject_user_id: auth.user.id }, '-created_date', limit);
      }
      return Response.json({ challenges });
    }

    // ── review_challenge (governance) ──
    if (action === 'review_challenge') {
      if (!isGov) return govDenied();
      const { challenge_id, status, resolution } = body;
      if (!challenge_id) return Response.json({ error: 'challenge_id required' }, { status: 400 });
      const found = await base44.asServiceRole.entities.AssessmentChallenge.filter({ challenge_id }, '-created_date', 10);
      const challenge = found[0];
      if (!challenge) return Response.json({ error: 'Challenge not found' }, { status: 404 });
      const updated = await base44.asServiceRole.entities.AssessmentChallenge.update(challenge.id, {
        status: ['submitted', 'in_review', 'additional_evidence_received', 'awaiting_reassessment', 'resolved', 'dismissed'].includes(status) ? status : 'in_review',
        resolution: String(resolution || '').slice(0, 2000),
        resolution_date: new Date().toISOString(),
        reviewer_name: actorName,
      });
      await logAuditRecord(base44, {
        category: 'governance',
        action: 'assessment_challenge_reviewed',
        performedById: auth.user?.id || 'system',
        performedByName: actorName,
        targetEntity: 'AssessmentChallenge',
        targetEntityId: challenge_id,
        status: 'success',
        severity: 'info',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: {},
      });
      return Response.json({ ok: true, challenge: updated });
    }

    // ── reassess (governance): new evidence → NEW linked revision record ──
    if (action === 'reassess') {
      if (!isGov) return govDenied();
      const { challenge_id, validity_id, model_version, reason } = body;
      if (!challenge_id && !validity_id) return Response.json({ error: 'challenge_id or validity_id required' }, { status: 400 });

      let challenge = null;
      if (challenge_id) {
        const found = await base44.asServiceRole.entities.AssessmentChallenge.filter({ challenge_id }, '-created_date', 10);
        challenge = found[0] || null;
        if (!challenge) return Response.json({ error: 'Challenge not found' }, { status: 404 });
      }
      const originalRecords = await base44.asServiceRole.entities.AssessmentValidityRecord
        .filter({ validity_id: validity_id || challenge.validity_id }, '-created_date', 10);
      const original = originalRecords[0];
      if (!original) return Response.json({ error: 'Original validity record not found' }, { status: 404 });

      const originalEvidence = safeParse(original.evidence_json, []);
      const userEvidence = (challenge ? safeParse(challenge.additional_evidence_json, []) : [])
        .map((e, i) => ({
          id: `ue-${i + 1}`,
          source: 'user_submitted',
          signal_type: e.signal_type || 'demonstrated_behavior',
          quality: e.quality || 'medium',
          supports: e.supports === 'contradicts' ? 'contradicts' : 'supports',
          description: e.description || '',
        }));

      const result = evaluateValidity({
        assessmentId: original.assessment_id,
        assessmentType: original.assessment_type,
        dimension: original.dimension,
        conclusion: original.conclusion || undefined,
        conclusionLevel: original.conclusion_level || undefined,
        conclusionSource: original.conclusion_source,
        confidence: original.confidence_original,
        evidence: [...originalEvidence, ...userEvidence],
        modelVersion: model_version || original.model_version,
        assessmentVersion: original.assessment_version,
      });

      const rev = buildRevision(original, [], reason || (challenge ? 'challenge: additional evidence reassessed' : 'reassessment'), actorName);
      const changed = [];
      if (original.validity_status !== result.validityStatus) changed.push('validity_status');
      if (original.conclusion !== (result.conclusion || original.conclusion)) changed.push('conclusion');
      if (Number(original.confidence_adjusted) !== Number(result.confidenceAdjusted)) changed.push('confidence_adjusted');

      const record = {
        validity_id: rev.validity_id,
        assessment_id: original.assessment_id,
        assessment_type: original.assessment_type,
        dimension: original.dimension,
        intended_construct: original.intended_construct,
        evidence_json: JSON.stringify(result.evidenceConsidered),
        construct_warnings_json: JSON.stringify(result.constructWarnings),
        missing_evidence_json: JSON.stringify(result.missingEvidence),
        contradictory_evidence_json: JSON.stringify(result.contradictoryEvidence),
        conclusion: result.conclusion || original.conclusion,
        conclusion_level: result.conclusionLevel || original.conclusion_level,
        conclusion_source: original.conclusion_source,
        confidence_original: result.confidenceOriginal,
        confidence_adjusted: result.confidenceAdjusted,
        validity_status: result.validityStatus,
        trace_json: JSON.stringify(result.trace),
        interpretation: result.interpretation,
        additional_evidence_would_improve_json: JSON.stringify(result.additionalEvidenceWouldImprove),
        model_version: result.provenance.modelVersion,
        assessment_version: result.provenance.assessmentVersion,
        governance_framework_version: result.provenance.frameworkVersion,
        provenance_incomplete: result.provenance.provenanceIncomplete,
        assessed_at: new Date().toISOString(),
        human_review_required: result.humanReviewRequired,
        revision_number: rev.revision_number,
        parent_validity_id: rev.parent_validity_id,
        changed_fields_json: JSON.stringify(changed),
        revision_reason: rev.revision_reason,
        human_decision_type: 'none',
        subject_user_id: original.subject_user_id,
        created_by_name: actorName,
      };
      await base44.asServiceRole.entities.AssessmentValidityRecord.create(record);
      await base44.asServiceRole.entities.AssessmentValidityRecord.update(original.id, {
        superseded_by_validity_id: record.validity_id, // linkage only
      });
      if (challenge) {
        await base44.asServiceRole.entities.AssessmentChallenge.update(challenge.id, {
          status: 'resolved',
          resolution: `Reassessment completed: ${record.validity_id} (${result.validityStatus})`,
          resolution_date: new Date().toISOString(),
          reviewer_name: actorName,
        });
      }

      await logAuditRecord(base44, {
        category: 'governance',
        action: 'assessment_reassessed',
        performedById: auth.user?.id || 'system',
        performedByName: actorName,
        targetEntity: 'AssessmentValidityRecord',
        targetEntityId: record.validity_id,
        status: 'success',
        severity: 'info',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: { parent: original.validity_id, changed_fields: changed },
      });

      return Response.json({ ok: true, record, original_preserved: true, changed_fields: changed });
    }

    // ── record_human_override (governance): AI conclusion never erased ──
    if (action === 'record_human_override') {
      if (!isGov) return govDenied();
      const { validity_id, human_decision, decision_type, rationale, supporting_evidence } = body;
      if (!validity_id || !human_decision || !decision_type) {
        return Response.json({ error: 'validity_id, human_decision, and decision_type are required' }, { status: 400 });
      }
      const found = await base44.asServiceRole.entities.AssessmentValidityRecord.filter({ validity_id }, '-created_date', 10);
      const record = found[0];
      if (!record) return Response.json({ error: 'Validity record not found' }, { status: 404 });

      const override = buildHumanOverride(
        { conclusion: record.conclusion, validity_status: record.validity_status, source: record.conclusion_source },
        human_decision,
        decision_type,
        rationale,
        actorName,
        Array.isArray(supporting_evidence) ? supporting_evidence : [],
      );
      // ONLY human-decision fields are written — the AI conclusion fields stay intact.
      const updated = await base44.asServiceRole.entities.AssessmentValidityRecord.update(record.id, {
        human_decision_type: override.decision_type,
        human_decision: override.human_decision,
        human_decision_rationale: override.rationale,
        human_decision_evidence_json: JSON.stringify(override.supporting_evidence),
        reviewer_name: override.reviewer,
        review_date: override.timestamp.slice(0, 10),
      });

      await logAuditRecord(base44, {
        category: 'governance',
        action: 'assessment_human_override_recorded',
        performedById: auth.user?.id || 'system',
        performedByName: actorName,
        targetEntity: 'AssessmentValidityRecord',
        targetEntityId: validity_id,
        status: 'success',
        severity: 'info',
        requestId: auth.requestId,
        ipAddress: clientIp,
        metadata: { decision_type: override.decision_type },
      });

      return Response.json({ ok: true, record: updated, ai_conclusion_preserved: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});