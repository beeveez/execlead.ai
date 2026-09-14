import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// ============================================================
// PUBLIC INTAKE FUNCTION — Contact + Security Reports
// ============================================================
// Creates a ContactSubmission record via the service role so that
// BOTH authenticated and unauthenticated visitors can submit.
// RLS on the entity blocks direct client creation — submissions
// must go through this function. Reads are admin-only via RLS.
//
// Duplicate-click protection: rejects an identical submission
// (same email + message) submitted within the last 90 seconds.
// ============================================================

const VALID_TYPES = new Set(['contact', 'security_report']);
const DEDUPE_WINDOW_MS = 90 * 1000;
const MAX_MESSAGE_LENGTH = 6000;
const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 300;
const MAX_SUBJECT_LENGTH = 300;

function truncate(value: string, max: number): string {
  if (!value) return '';
  return value.length > max ? value.substring(0, max) : value;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    let payload: any = {};
    try {
      const body = await req.clone().text();
      if (body) payload = JSON.parse(body);
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const submissionType = (payload.submission_type || 'contact').toString().trim();
    if (!VALID_TYPES.has(submissionType)) {
      return Response.json({ error: 'Invalid submission type' }, { status: 400 });
    }

    const name = truncate((payload.name || '').toString().trim(), MAX_NAME_LENGTH);
    const email = (payload.email || '').toString().trim().toLowerCase();
    const message = (payload.message || '').toString().trim();
    const subject = truncate((payload.subject || '').toString().trim(), MAX_SUBJECT_LENGTH);
    const sourcePage = truncate((payload.source_page || '').toString().trim(), 200);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'A valid email is required' }, { status: 400 });
    }
    if (!message || message.length < 5) {
      return Response.json({ error: 'A message of at least 5 characters is required' }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return Response.json({ error: 'Message is too long' }, { status: 400 });
    }

    // ── Duplicate-click protection ──
    // Reject identical (email + message) submissions within a short window.
    try {
      const recent = await base44.asServiceRole.entities.ContactSubmission.filter(
        { email },
        '-created_date',
        5
      );
      const now = Date.now();
      const duplicate = (recent || []).find((r: any) => {
        if (!r.created_date) return false;
        const age = now - new Date(r.created_date).getTime();
        return age < DEDUPE_WINDOW_MS && r.message === message;
      });
      if (duplicate) {
        return Response.json({ ok: true, duplicate: true }, { status: 200 });
      }
    } catch {
      // Dedupe check is best-effort; proceed to create.
    }

    const record = await base44.asServiceRole.entities.ContactSubmission.create({
      submission_type: submissionType,
      name,
      email,
      subject,
      message,
      status: 'new',
      source_page: sourcePage,
    });

    return Response.json({ ok: true, id: record.id });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to submit' }, { status: 500 });
  }
}