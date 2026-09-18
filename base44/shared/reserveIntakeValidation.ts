// ============================================================
// Reserve intake input policy — reserveFoundingMembership 'reserve'
// PUBLIC UNAUTHENTICATED INTAKE BOUNDARY (High remediation)
//
// The reservation flow is INTENTIONALLY public (no login). This policy is the
// deterministic server-side boundary between anonymous input and:
//   • the FoundingWaitlist database record,
//   • the trusted-domain confirmation email (body + plan label),
//   • the public Founders Wall.
//
// It enforces:
//   • email addr-spec syntax + CR/LF/control-char rejection + 254-char cap,
//   • CR/LF/control-char stripping + length caps on all free-text fields,
//   • display_preference restricted to the public/private/anonymous enum,
//   • no HTML injection and no raw RFC 2822/MIME construction anywhere.
//
// Invalid EMAIL input terminates the reservation before any database write
// or email dispatch. Free-text fields are sanitized (never silently
// transformed into a different recipient) and truncated to safe lengths.
// ============================================================

const EMAIL_MAX_LENGTH = 254;

// Non-global (stateless) pattern used for rejection checks.
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
// Global pattern used for stripping.
const CONTROL_CHARS_G = /[\u0000-\u001F\u007F]/g;

// RFC 5322 atom-based addr-spec subset. Accepts ordinary addresses,
// plus-tags, %~& etc. punctuation. Rejects whitespace, CR/LF, quoting,
// and header-dangerous characters. Does not over-constrain normal addresses.
const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

// Sanitization policy for every user-supplied text field accepted by 'reserve'.
// Length caps mirror the entity field expectations; ordinary Unicode names,
// punctuation, and emoji are preserved — only control characters are stripped.
export const RESERVE_TEXT_FIELD_LIMITS = {
  full_name: 120,
  country: 60,
  profession: 120,
  company: 120,
  industry: 120,
  photo: 500,
  linkedin: 253,
  expected_start_date: 40,
  comments: 1000,
  referral_source: 120,
  preferred_plan: 40,
};

export function normalizeReservationEmail(raw) {
  return String(raw ?? "").trim().toLowerCase();
}

export function isValidReservationEmail(email) {
  if (typeof email !== "string") return false;
  if (email.length === 0 || email.length > EMAIL_MAX_LENGTH) return false;
  if (CONTROL_CHARS.test(email)) return false;
  return EMAIL_PATTERN.test(email);
}

// Deterministic free-text sanitizer: strips CR/LF and other control
// characters (including DEL and C0), trims, then caps length. Non-strings
// become "". Never transforms content into another recipient.
export function sanitizeReservationText(raw, maxLength) {
  if (typeof raw !== "string") return "";
  const cap = typeof maxLength === "number" && maxLength > 0 ? maxLength : 0;
  return raw.replace(CONTROL_CHARS_G, "").trim().slice(0, cap);
}

// display_preference restricted to the legitimate enum; preserves the exact
// existing business semantics: an attacker-supplied valid enum is honored
// (as today), anything else falls back to public_profile ? "public" : "private".
export function sanitizeDisplayPreference(raw, publicProfile) {
  const pref = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (pref === "public" || pref === "private" || pref === "anonymous") return pref;
  return publicProfile ? "public" : "private";
}

// Sanitize the whole anonymous reserve payload into the exact field set the
// reservation record accepts. Does NOT touch server-controlled fields
// (priority_number, verification_id, certificate ids, pricing expiry, statuses).
export function buildSanitizedReserveInput(body) {
  const source = (body && typeof body === "object") ? body : {};
  const L = RESERVE_TEXT_FIELD_LIMITS;
  const publicProfile = source.public_profile === true;
  return {
    full_name: sanitizeReservationText(source.full_name, L.full_name),
    country: sanitizeReservationText(source.country, L.country),
    profession: sanitizeReservationText(source.profession, L.profession),
    company: sanitizeReservationText(source.company, L.company),
    industry: sanitizeReservationText(source.industry, L.industry),
    photo: sanitizeReservationText(source.photo, L.photo),
    linkedin: sanitizeReservationText(source.linkedin, L.linkedin),
    preferred_plan: sanitizeReservationText(source.preferred_plan, L.preferred_plan),
    expected_start_date: sanitizeReservationText(source.expected_start_date, L.expected_start_date),
    comments: sanitizeReservationText(source.comments, L.comments),
    referral_source: sanitizeReservationText(source.referral_source, L.referral_source),
    public_profile: publicProfile,
    display_preference: sanitizeDisplayPreference(source.display_preference, publicProfile),
  };
}