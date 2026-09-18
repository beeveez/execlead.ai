// ============================================================
// Regression tests — reserveIntakeValidation (reserveFoundingMembership High)
// Run: deno test --allow-net base44/shared/reserveIntakeValidation.test.ts
// Maps to mandated verification matrix A–P (pure-function, offline:
// no email, no database writes, no production records).
// ============================================================
import {
  normalizeReservationEmail,
  isValidReservationEmail,
  sanitizeReservationText,
  sanitizeDisplayPreference,
  buildSanitizedReserveInput,
} from "./reserveIntakeValidation.ts";

function assertEquals(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`[${label}] Expected ${e} but got ${a}`);
}

// ── TEST A — valid public reservation input remains accepted ──

Deno.test("A1: valid email normalizes (trim + lowercase)", () => {
  assertEquals(normalizeReservationEmail("  Jane.Doe+Reserve@Company.COM "), "jane.doe+reserve@company.com", "A1");
});

Deno.test("A2: ordinary international user names survive sanitization", () => {
  assertEquals(sanitizeReservationText("José María Muñoz-Öztürk", 120), "José María Muñoz-Öztürk", "A2");
});

Deno.test("A3: sanitized payload preserves every legitimate field", () => {
  const p = buildSanitizedReserveInput({
    full_name: "Jane Doe", country: "PH", profession: "CTO", preferred_plan: "founding_member",
    comments: "Excited!", referral_source: "linkedin", public_profile: true,
  });
  assertEquals(p.full_name, "Jane Doe", "A3a");
  assertEquals(p.preferred_plan, "founding_member", "A3b");
  assertEquals(p.comments, "Excited!", "A3c");
  assertEquals(p.public_profile, true, "A3d");
  assertEquals(p.display_preference, "public", "A3e");
});

// ── TESTS C–G — email validation terminates before write/send ──

Deno.test("C: CR in email is rejected (embedded CR fails validation; trailing CR is removed by normalization and never reaches the recipient)", () => {
  assertEquals(isValidReservationEmail("jane\r@company.com"), false, "C1");
  assertEquals(isValidReservationEmail("jane@company\r.com"), false, "C2");
  // Normalization (existing trim+lowercase convention) strips leading/trailing
  // CR — the resulting recipient is the clean address, never the CR payload.
  assertEquals(normalizeReservationEmail("jane@company.com\r"), "jane@company.com", "C3");
  assertEquals(isValidReservationEmail(normalizeReservationEmail("jane@company.com\r")), true, "C4");
  assertEquals(normalizeReservationEmail(" \r\njane@company.com"), "jane@company.com", "C5");
});

Deno.test("D: LF in email is rejected", () => {
  assertEquals(isValidReservationEmail("jane\n@company.com"), false, "D");
  assertEquals(isValidReservationEmail(normalizeReservationEmail("jane@company.com\n")), false, "D");
});

Deno.test("E: control characters in email are rejected", () => {
  assertEquals(isValidReservationEmail("ja\u0000ne@company.com"), false, "E1");
  assertEquals(isValidReservationEmail("jane@company.com\u0007"), false, "E2");
  assertEquals(isValidReservationEmail("jane@company\u007F.com"), false, "E3");
  assertEquals(isValidReservationEmail("jane\x0b@company.com"), false, "E4");
});

Deno.test("F: email longer than 254 characters is rejected", () => {
  const longLocal = "a".repeat(250);
  assertEquals(isValidReservationEmail(`${longLocal}@company.com`), false, "F");
});

Deno.test("G: invalid email syntax is rejected", () => {
  assertEquals(isValidReservationEmail("jane@@company.com"), false, "G1");
  assertEquals(isValidReservationEmail("@company.com"), false, "G2");
  assertEquals(isValidReservationEmail("jane@company"), false, "G3"); // no TLD dot
  assertEquals(isValidReservationEmail("jane doe@company.com"), false, "G4");
  assertEquals(isValidReservationEmail("jane@company..com"), false, "G5");
  assertEquals(isValidReservationEmail(""), false, "G6");
  assertEquals(isValidReservationEmail(null), false, "G7");
  assertEquals(isValidReservationEmail(42), false, "G8");
  // header-dangerous chars rejected
  assertEquals(isValidReservationEmail("jane@company.com\r\nBcc: victim@x.com"), false, "G9");
  assertEquals(isValidReservationEmail("\"jane\"@company.com"), false, "G10");
});

Deno.test("G+: common legitimate address forms are accepted", () => {
  assertEquals(isValidReservationEmail("jane.doe+reserve@company.co.uk"), true, "G+1");
  assertEquals(isValidReservationEmail("o'brien_jane%tag@sub.company.io"), true, "G+2");
  assertEquals(isValidReservationEmail("jane@company.com"), true, "G+3");
});

// ── TESTS H–I — free-text control-character sanitization ──

Deno.test("H: CR/LF/control characters in full_name are stripped, Unicode preserved", () => {
  assertEquals(sanitizeReservationText("Jane\r\nDoe", 120), "JaneDoe", "H1");
  assertEquals(sanitizeReservationText("Ja\u0000ne", 120), "Jane", "H2");
  assertEquals(sanitizeReservationText("Jane\u007FDoe", 120), "JaneDoe", "H3");
  // no transformation into another recipient: text only, no email semantics
  assertEquals(sanitizeReservationText("Jane Doe 🎉", 120), "Jane Doe 🎉", "H4");
});

Deno.test("H2: full_name length is capped", () => {
  const long = "J".repeat(200);
  assertEquals(sanitizeReservationText(long, 120).length, 120, "H2");
});

Deno.test("I: control characters in other free-text fields are handled by the shared payload builder", () => {
  const p = buildSanitizedReserveInput({
    full_name: "Jane\rDoe",
    country: "P\nH",
    comments: "Great\r\nstuff\u0000!",
    profession: "CTO\u0008",
    industry: "Tech\u007F",
    linkedin: "linkedin.com/in/jane\r\n",
    photo: "https://img.example/p.png\u0000",
    referral_source: "twitter\u0003",
    expected_start_date: "2026-10-01\u001F",
    preferred_plan: "founding_member\n",
  });
  assertEquals(p.full_name, "JaneDoe", "I1");
  assertEquals(p.country, "PH", "I2");
  assertEquals(p.comments, "Greatstuff!", "I3");
  assertEquals(p.profession, "CTO", "I4");
  assertEquals(p.industry, "Tech", "I5");
  assertEquals(p.linkedin, "linkedin.com/in/jane", "I6");
  assertEquals(p.photo, "https://img.example/p.png", "I7");
  assertEquals(p.referral_source, "twitter", "I8");
  assertEquals(p.expected_start_date, "2026-10-01", "I9");
  assertEquals(p.preferred_plan, "founding_member", "I10");
});

Deno.test("I2: non-string / non-object inputs collapse safely", () => {
  const p = buildSanitizedReserveInput(null);
  assertEquals(p.full_name, "", "I2a");
  assertEquals(p.public_profile, false, "I2b");
  assertEquals(p.display_preference, "private", "I2c");
  assertEquals(sanitizeReservationText(undefined, 10), "", "I2d");
  assertEquals(sanitizeReservationText({ evil: 1 }, 10), "", "I2e");
});

// ── TEST J — request body can never influence email headers ──

Deno.test("J: sanitized inputs contain no CR/LF and the policy exposes no header control surface", () => {
  const p = buildSanitizedReserveInput({
    full_name: "Bcc: victim@x.com\r\nSubject: forged",
    comments: "Reply-To: attacker@evil.com\nFrom: fake@evil.com",
    preferred_plan: "x@evil.com\r\nCc: victim@evil.com",
  });
  assertEquals(p.full_name.includes("\r"), false, "J1a");
  assertEquals(p.full_name.includes("\n"), false, "J1b");
  assertEquals(p.comments.includes("\r"), false, "J2a");
  assertEquals(p.comments.includes("\n"), false, "J2b");
  assertEquals(p.preferred_plan.includes("\r"), false, "J3a");
  assertEquals(p.preferred_plan.includes("\n"), false, "J3b");
  // any sanitized field is a plain value: no Cc/Bcc/Reply-To/From/Subject parameter exists in the policy output
  assertEquals(Object.keys(p).includes("cc"), false, "J4");
  assertEquals(Object.keys(p).includes("bcc"), false, "J5");
  assertEquals(Object.keys(p).includes("reply_to"), false, "J6");
  assertEquals(Object.keys(p).includes("from"), false, "J7");
  assertEquals(Object.keys(p).includes("subject"), false, "J8");
});

// ── TEST P — public Founders Wall fields are control-character-free ──

Deno.test("P: wall-visible fields (full_name/photo/linkedin/profession/company/industry) cannot carry control characters", () => {
  const p = buildSanitizedReserveInput({
    full_name: "Ghost\u0000\r\n",
    photo: "https://x/p.png\r\n",
    linkedin: "l\n",
    profession: "p\r",
    company: "c\u0000",
    industry: "i\u007F",
    public_profile: true,
    display_preference: "public",
  });
  for (const k of ["full_name", "photo", "linkedin", "profession", "company", "industry"]) {
    assertEquals(/[\u0000-\u001F\u007F]/.test(p[k]), false, `P-${k}`);
  }
  // enum restriction: only public/private/anonymous can reach the wall
  assertEquals(p.display_preference, "public", "P-enum1");
  assertEquals(sanitizeDisplayPreference("hijacked", true), "public", "P-enum2");
  assertEquals(sanitizeDisplayPreference("hijacked", false), "private", "P-enum3");
  assertEquals(sanitizeDisplayPreference("anonymous", false), "anonymous", "P-enum4");
});