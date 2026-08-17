import { createClientFromRequest } from 'npm:@base44/sdk@0.8.42';
import { resolveActiveOrgMembership } from '../../shared/authoritativeOrgAccess.ts';

const PLATFORM_REVIEW_ROLES = ['admin', 'support', 'super_admin', 'platform_admin', 'founder_root_admin'];
const PLATFORM_ADMIN_ROLES = ['super_admin', 'platform_admin', 'founder_root_admin'];
const ORG_REVIEW_ROLES = ['organization_admin', 'department_admin'];

function calculateTrustScore(verification) {
  if (!verification) return 0;
  return Math.min(100,
    (verification.email_verified ? 10 : 0) +
    (verification.phone_verified ? 10 : 0) +
    (verification.identity_verified ? 30 : 0) +
    (verification.professional_verified ? 20 : 0) +
    (verification.resume_verified ? 10 : 0) +
    (verification.leadership_dna_complete ? 10 : 0) +
    (verification.profile_published ? 10 : 0) +
    (verification.verified_executive ? 10 : 0)
  );
}

function calculateTrustLevel(verification) {
  if (verification?.verified_executive) return 5;
  if (verification?.professional_verified) return 4;
  if (verification?.identity_verified) return 3;
  if (verification?.phone_verified) return 2;
  if (verification?.email_verified) return 1;
  return 0;
}

function recalculateTrust(verification) {
  const verifiedExecutive = Boolean(
    verification?.identity_verified && verification?.professional_verified &&
    verification?.profile_published && verification?.resume_verified &&
    verification?.leadership_dna_complete
  );
  const updated = { ...verification, verified_executive: verifiedExecutive };
  return { trust_score: calculateTrustScore(updated), trust_level: calculateTrustLevel(updated), verified_executive: verifiedExecutive };
}

async function createLog(base44, verification, action, reviewer, decision, reason, notes) {
  await base44.asServiceRole.entities.VerificationLog.create({
    verification_id: verification.id,
    user_id: verification.user_id,
    user_name: verification.user_name,
    action,
    document_type: verification.identity_document_type || '',
    submitted_date: verification.identity_submitted_date || null,
    reviewed_date: new Date().toISOString(),
    reviewer_id: reviewer.id,
    reviewer_name: reviewer.full_name || reviewer.email,
    decision,
    reason: reason || '',
    notes: notes || '',
  });
}

async function requireOrganizationReview(base44, user, verification) {
  if (PLATFORM_ADMIN_ROLES.includes(user.role)) return { isPlatformAdmin: true, orgId: verification.organization_id };
  if (!verification.organization_id) return null;
  return resolveActiveOrgMembership(base44, user, {
    requestedOrgId: verification.organization_id,
    allowedRoles: ORG_REVIEW_ROLES,
  });
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, verificationId, reason, notes } = body;

    if (action === 'list') {
      if (!PLATFORM_REVIEW_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const verifications = await base44.asServiceRole.entities.IdentityVerification.list('-updated_date', 200);
      return Response.json({ verifications });
    }

    if (action === 'get_logs') {
      if (!PLATFORM_REVIEW_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const logs = await base44.asServiceRole.entities.VerificationLog.list('-created_date', 200);
      return Response.json({ logs });
    }

    if (!verificationId) return Response.json({ error: 'verificationId is required' }, { status: 400 });
    const verification = await base44.asServiceRole.entities.IdentityVerification.get(verificationId);
    if (!verification) return Response.json({ error: 'Verification record not found' }, { status: 404 });

    if (action === 'approve_professional') {
      const access = await requireOrganizationReview(base44, user, verification);
      if (!access) return Response.json({ error: 'Cannot verify users outside your organization' }, { status: 403 });
      const organization = verification.organization_id
        ? await base44.asServiceRole.entities.Organization.get(verification.organization_id)
        : null;
      const updates = {
        professional_verified: true,
        professional_verified_date: new Date().toISOString().split('T')[0],
        professional_verified_method: 'enterprise_admin',
        professional_verified_by: organization?.name || 'Organization',
      };
      const trust = recalculateTrust({ ...verification, ...updates });
      const updated = await base44.asServiceRole.entities.IdentityVerification.update(verificationId, { ...updates, ...trust });
      await createLog(base44, verification, 'professional_verified', user, 'approved', `Verified by ${organization?.name || 'Organization'}`, notes);
      if (trust.verified_executive && !verification.verified_executive) {
        await createLog(base44, verification, 'verified_executive_granted', user, 'approved', 'Automatically granted — all requirements met', '');
      }
      return Response.json({ success: true, verification: updated });
    }

    if (!PLATFORM_REVIEW_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const now = new Date().toISOString();
    let updates;
    let logAction;
    let decision;

    if (action === 'approve') {
      updates = {
        identity_status: 'verified', identity_verified: true,
        identity_verified_date: now.split('T')[0],
        identity_verified_by: user.full_name || user.email,
        identity_verified_method: verification.identity_verified_method || 'manual_review',
        identity_reviewed_date: now, identity_rejection_reason: '',
      };
      logAction = 'identity_approved';
      decision = 'approved';
    } else if (action === 'reject') {
      updates = {
        identity_status: 'rejected', identity_verified: false,
        identity_reviewed_date: now,
        identity_rejection_reason: reason || 'Document rejected. Please resubmit with a clearer image.',
      };
      logAction = 'identity_rejected';
      decision = 'rejected';
    } else if (action === 'request_documents') {
      updates = { identity_status: 'pending_upload' };
      logAction = 'documents_requested';
      decision = 'pending';
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const trust = recalculateTrust({ ...verification, ...updates });
    const updated = await base44.asServiceRole.entities.IdentityVerification.update(verificationId, { ...updates, ...trust });
    await createLog(base44, verification, logAction, user, decision, reason, notes);
    if (trust.verified_executive && !verification.verified_executive) {
      await createLog(base44, verification, 'verified_executive_granted', user, 'approved', 'Automatically granted — all requirements met', '');
    }
    return Response.json({ success: true, verification: updated });
  } catch (error) {
    console.error('manageIdentityVerification error:', error.message);
    return Response.json({ error: 'Identity verification operation failed.' }, { status: 500 });
  }
}