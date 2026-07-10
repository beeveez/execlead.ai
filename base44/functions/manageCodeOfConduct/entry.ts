import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CURRENT_VERSION = "1.0";
const LAST_UPDATED = "2026-07-10T00:00:00Z";
const ESTIMATED_READING_TIME = 7;
const ACCEPTANCE_VERSION = "1.0";
const PLATFORM_VERSION = "EXECLEAD.AI v2.0";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = body.action;

    async function getUserProfile(userId) {
      try {
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: userId });
        return profiles[0] || {};
      } catch (e) { return {}; }
    }

    // ─── GET STATUS ────────────────────────────────────────
    if (action === 'get_status') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const acceptances = await base44.asServiceRole.entities.CodeOfConductAcceptance.filter(
        { user_id: user.id }, '-accepted_at', 50
      );

      const latestAcceptance = acceptances[0];
      const needsAcceptance = !latestAcceptance || latestAcceptance.version !== CURRENT_VERSION;

      return Response.json({
        current_version: CURRENT_VERSION,
        last_updated: LAST_UPDATED,
        estimated_reading_time: ESTIMATED_READING_TIME,
        needs_acceptance: needsAcceptance,
        user_accepted_version: latestAcceptance?.version || null,
        user_accepted_at: latestAcceptance?.accepted_at || null,
        acceptance_history: acceptances.slice(0, 10).map(a => ({
          version: a.version,
          accepted_at: a.accepted_at,
          digital_signature_hash: (a.digital_signature_hash || '').substring(0, 16) + '...',
        })),
      });
    }

    // ─── ACCEPT ────────────────────────────────────────────
    if (action === 'accept') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const profile = await getUserProfile(user.id);
      const acceptedAt = new Date().toISOString();
      const ipAddress = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
        || req.headers.get('x-real-ip')
        || 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      const country = profile.country || 'unknown';

      // Generate SHA-256 digital signature
      const signatureData = `${user.id}|${user.full_name || user.email}|${acceptedAt}|${CURRENT_VERSION}|${ipAddress}|${userAgent}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const digitalSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const acceptance = await base44.asServiceRole.entities.CodeOfConductAcceptance.create({
        user_id: user.id,
        user_name: user.full_name || '',
        user_email: user.email || '',
        member_id: user.id,
        version: CURRENT_VERSION,
        accepted_at: acceptedAt,
        ip_address: ipAddress,
        browser_user_agent: userAgent,
        country: country,
        platform_version: PLATFORM_VERSION,
        acceptance_version: ACCEPTANCE_VERSION,
        digital_signature_hash: digitalSignature,
      });

      // Update UserProfile community_standards_accepted
      if (profile.id) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          community_standards_accepted: true,
          community_standards_accepted_at: acceptedAt,
        });
      }

      return Response.json({ success: true, acceptance });
    }

    // ─── ADMIN: HISTORY ────────────────────────────────────
    if (action === 'admin_history') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const acceptances = await base44.asServiceRole.entities.CodeOfConductAcceptance.list('-accepted_at', 200);
      return Response.json({ acceptances, current_version: CURRENT_VERSION });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});