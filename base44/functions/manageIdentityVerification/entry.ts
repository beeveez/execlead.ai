import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const ADMIN_ROLES = ['admin', 'super_admin', 'platform_admin', 'support'];
const ENTERPRISE_ADMIN_ROLES = ['enterprise_admin', 'organization_owner', 'super_admin', 'platform_admin'];

function calculateTrustScore(v) {
  if (!v) return 0;
  let score = 0;
  if (v.email_verified) score += 10;
  if (v.phone_verified) score += 10;
  if (v.identity_verified) score += 30;
  if (v.professional_verified) score += 20;
  if (v.resume_verified) score += 10;
  if (v.leadership_dna_complete) score += 10;
  if (v.profile_published) score += 10;
  if (v.verified_executive) score += 10;
  return score;
}

function calculateTrustLevel(v) {
  if (!v) return 0;
  if (v.verified_executive) return 5;
  if (v.professional_verified) return 4;
  if (v.identity_verified) return 3;
  if (v.phone_verified) return 2;
  if (v.email_verified) return 1;
  return 0;
}

function canGrantVerifiedExecutive(v) {
  if (!v) return false;
  return Boolean(
    v.identity_verified &&
    v.professional_verified &&
    v.profile_published &&
    v.resume_verified &&
    v.leadership_dna_complete
  );
}

function recalculateTrust(v) {
  const updated = { ...v };
  updated.verified_executive = canGrantVerifiedExecutive(updated);
  updated.trust_score = calculateTrustScore(updated);
  updated.trust_level = calculateTrustLevel(updated);
  return updated;
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, verificationId, reason, notes } = body;

    // List all verifications — admin only
    if (action === 'list') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }
      const all = await base44.asServiceRole.entities.IdentityVerification.list('-updated_date', 200);
      return Response.json({ verifications: all });
    }

    // Get audit logs — admin only
    if (action === 'get_logs') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }
      const logs = await base44.asServiceRole.entities.VerificationLog.list('-created_date', 200);
      return Response.json({ logs });
    }

    // All other actions require a verificationId
    if (!verificationId) {
      return Response.json({ error: 'verificationId is required' }, { status: 400 });
    }

    const verification = await base44.asServiceRole.entities.IdentityVerification.get(verificationId);
    if (!verification) {
      return Response.json({ error: 'Verification record not found' }, { status: 404 });
    }

    // Approve identity — admin only
    if (action === 'approve') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }
      const now = new Date();
      const updates = {
        identity_status: 'verified',
        identity_verified: true,
        identity_verified_date: now.toISOString().split('T')[0],
        identity_verified_by: user.full_name || user.email,
        identity_verified_method: verification.identity_verified_method || 'manual_review',
        identity_reviewed_date: now.toISOString(),
        identity_rejection_reason: '',
      };
      const recalced = recalculateTrust({ ...verification, ...updates });
      const updated = await base44.asServiceRole.entities.IdentityVerification.update(verificationId, {
        ...updates,
        trust_score: recalced.trust_score,
        trust_level: recalced.trust_level,
        verified_executive: recalced.verified_executive,
      });
      await createLog(base44, verification, 'identity_approved', user, 'approved', reason, notes);

      if (recalced.verified_executive && !verification.verified_executive) {
        await createLog(base44, verification, 'verified_executive_granted', user, 'approved', 'Automatically granted — all requirements met', '');
      }
      return Response.json({ success: true, verification: updated });
    }

    // Reject identity — admin only
    if (action === 'reject') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }
      const now = new Date();
      const updates = {
        identity_status: 'rejected',
        identity_verified: false,
        identity_reviewed_date: now.toISOString(),
        identity_rejection_reason: reason || 'Document rejected. Please resubmit with a clearer image.',
      };
      const recalced = recalculateTrust({ ...verification, ...updates });
      const updated = await base44.asServiceRole.entities.IdentityVerification.update(verificationId, {
        ...updates,
        trust_score: recalced.trust_score,
        trust_level: recalced.trust_level,
        verified_executive: recalced.verified_executive,
      });
      await createLog(base44, verification, 'identity_rejected', user, 'rejected', reason, notes);
      return Response.json({ success: true, verification: updated });
    }

    // Request additional documents — admin only
    if (action === 'request_documents') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }
      const updates = {
        identity_status: 'pending_upload',
      };
      const updated = await base44.asServiceRole.entities.IdentityVerification.update(verificationId, updates);
      await createLog(base44, verification, 'documents_requested', user, 'pending', notes || 'Additional documents requested', notes);
      return Response.json({ success: true, verification: updated });
    }

    // Approve professional verification — enterprise admin or platform admin
    if (action === 'approve_professional') {
      if (!ENTERPRISE_ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — enterprise admin access required' }, { status: 403 });
      }
      // Enterprise admins can only verify users in their own organization
      if (!ADMIN_ROLES.includes(user.role)) {
        const callerProfiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
        const callerOrg = callerProfiles[0]?.organization_id;
        if (callerOrg !== verification.organization_id) {
          return Response.json({ error: 'Cannot verify users outside your organization' }, { status: 403 });
        }
      }
      const orgName = verification.organization_name || 'Organization';
      const updates = {
        professional_verified: true,
        professional_verified_date: new Date().toISOString().split('T')[0],
        professional_verified_method: 'enterprise_admin',
        professional_verified_by: orgName,
      };
      const recalced = recalculateTrust({ ...verification, ...updates });
      const updated = await base44.asServiceRole.entities.IdentityVerification.update(verificationId, {
        ...updates,
        trust_score: recalced.trust_score,
        trust_level: recalced.trust_level,
        verified_executive: recalced.verified_executive,
      });
      await createLog(base44, verification, 'professional_verified', user, 'approved', `Verified by ${orgName}`, notes);
      if (recalced.verified_executive && !verification.verified_executive) {
        await createLog(base44, verification, 'verified_executive_granted', user, 'approved', 'Automatically granted — all requirements met', '');
      }
      return Response.json({ success: true, verification: updated });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('manageIdentityVerification error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});