// ============================================================
// Phase 14F Post-Send Hardening — RFC-conformant MIME transport
// deterministic test suite. Verifies that gmailTransportSend's MIME
// serializer (buildGmailRawMime) is fully RFC-conformant for
// non-ASCII Unicode content (the root cause of the observed Gmail
// mojibake) while leaving every governed layer untouched:
// draft hash 85f19a98 invariance, approval binding invariance,
// server-resolved recipient, fixed sender identity, and the
// control-character contract. NO REAL GMAIL SEND OCCURS: this suite
// never invokes gmailTransportSend — it tests the pure MIME serializer.
// Run: deno test --allow-net --allow-read base44/shared/gmailMimeTransport.test.ts
// All tests are local/deterministic — no network, no DB, no LLM.
// ============================================================
import {
  buildGmailRawMime,
  GMAIL_DELIVERY_SENDER_IDENTITY,
} from "./gmailDeliveryBoundary.ts";
import {
  deriveFirstSendDraftHash,
  deriveFirstSendMessageHash,
  validateFirstSendInput,
  validateFirstSendDraftContent,
} from "./controlledFirstSend.ts";

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, label) { if (!cond) throw new Error("FAILED: " + label); }
function assertEq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(label + ": expected " + e + " but got " + a);
}

// ------------------------------------------------------------
// INDEPENDENT reference codecs — deliberately NOT the module's own
// encoder/decoder, so a defect in the module cannot mask itself.
// ------------------------------------------------------------
function utf8EncodeRef(str) {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i);
    if (cp > 0xffff) i++;
    if (cp < 0x80) out.push(cp);
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 63));
    else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
  }
  return out;
}

function utf8DecodeRef(bytes) {
  let s = '';
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b < 0x80) { s += String.fromCharCode(b); i += 1; }
    else if (b < 0xe0) {
      s += String.fromCharCode(((b & 31) << 6) | (bytes[i + 1] & 63)); i += 2;
    } else if (b < 0xf0) {
      s += String.fromCharCode(((b & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63)); i += 3;
    } else {
      const cp = ((b & 7) << 18) | ((bytes[i + 1] & 63) << 12) | ((bytes[i + 2] & 63) << 6) | (bytes[i + 3] & 63);
      s += String.fromCodePoint(cp); i += 4;
    }
  }
  return s;
}

const B64STD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64StdDecodeRef(text) {
  const clean = text.replace(/[^A-Za-z0-9+/]/g, '');
  const out = [];
  for (let i = 0; i < clean.length; i += 4) {
    const n0 = B64STD.indexOf(clean[i]);
    const n1 = i + 1 < clean.length ? B64STD.indexOf(clean[i + 1]) : 0;
    const n2 = i + 2 < clean.length ? B64STD.indexOf(clean[i + 2]) : 0;
    const n3 = i + 3 < clean.length ? B64STD.indexOf(clean[i + 3]) : 0;
    out.push((n0 << 2) | (n1 >> 4));
    if (i + 2 < clean.length) out.push(((n1 & 15) << 4) | (n2 >> 2));
    if (i + 3 < clean.length) out.push(((n2 & 3) << 6) | n3);
  }
  return out;
}

// ------------------------------------------------------------
// Representative non-ASCII content: em dash, curly apostrophe, curly
// quotes, euro sign, CJK characters, and paragraph newlines.
// ------------------------------------------------------------
const RECIPIENT = "decision.maker@prospect-company.example";
const SUBJECT_MIXED = "EXECLEAD.AI — “governed” 東京 test — €100 — don’t stop “leadership”";
const BODY_MIXED = "Hello — “governed” team,\n\nThis controlled test — 東京 · €100 · ’apostrophe’ · “quotes” — carries paragraph newlines.\n\nWould you be open to a brief conversation?\n\nBest regards,\nRay Valdez — 東京";

// The EXACT approved Phase 14F first-send draft (approved draft hash 85f19a98).
const APPROVED_PROSPECT_ID = "870ff8ca-d143-4360-807e-86c3c2d7e130";
const APPROVED_CONTACT_ID = "4ed69628-c2f5-47aa-b38a-833de3655fc7";
const APPROVED_INPUT_HASH = "prep:09db3568-ae2c-41a2-a176-832edb58306e";
const APPROVED_SUBJECT = "EXECLEAD.AI CONTROLLED DELIVERY TEST — Connecting with EXECLEAD.AI Internal Test — Controlled First-Send (DO NOT CONTACT) — executive leadership";
const APPROVED_BODY = "Hello EXECLEAD.AI Internal Test — Controlled First-Send (DO NOT CONTACT) team,\n\nI am reaching out to introduce EXECLEAD.AI, an executive leadership operating platform, with relevance to the Internal Testing industry. Introduce EXECLEAD.AI to EXECLEAD.AI Internal Test — Controlled First-Send (DO NOT CONTACT) and explore whether executive leadership development is a timely fit.\n\nWould you be open to a brief introductory conversation in the coming weeks?\n\nBest regards,\nRay Valdez";
const APPROVED_DRAFT_HASH = "85f19a98";

function parseMime(mime) {
  const sepIdx = mime.indexOf("\r\n\r\n");
  assert(sepIdx > 0, "MIME contains a CRLF blank-line header/body separator");
  const headerBlock = mime.slice(0, sepIdx);
  const bodyBlock = mime.slice(sepIdx + 4);
  return { headers: headerBlock.split("\r\n"), bodyBlock };
}

function subjectEncodedWord(mime) {
  const { headers } = parseMime(mime);
  const subjectLine = headers.find((h) => h.startsWith("Subject: "));
  assert(subjectLine !== undefined, "MIME has a Subject header");
  return subjectLine.slice("Subject: ".length);
}

function decodeRfc2047Word(word) {
  const m = /^=\?UTF-8\?B\?([A-Za-z0-9+/=]+)\?=$/.exec(word);
  assert(m !== null, "Subject is a well-formed RFC 2047 UTF-8 Base64 encoded word: " + word);
  return utf8DecodeRef(base64StdDecodeRef(m[1]));
}

test("A: MIME Subject uses RFC 2047 UTF-8 Base64 encoding and headers stay pure ASCII", () => {
  const mime = buildGmailRawMime(RECIPIENT, SUBJECT_MIXED, BODY_MIXED);
  const word = subjectEncodedWord(mime);
  assert(/^=\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=$/.test(word), "Subject is an RFC 2047 encoded word");
  const { headers } = parseMime(mime);
  for (const h of headers) {
    assert(/^[\x20-\x7e]*$/.test(h), "Every header line is pure printable ASCII (no raw non-ASCII bytes): " + h);
  }
});

test("B: Decoding the RFC 2047 Subject reproduces the original Unicode subject byte-for-byte", () => {
  const mime = buildGmailRawMime(RECIPIENT, SUBJECT_MIXED, BODY_MIXED);
  const decoded = decodeRfc2047Word(subjectEncodedWord(mime));
  assertEq(decoded, SUBJECT_MIXED, "Decoded Subject is byte-identical to the governed draft subject");
  const bytes = utf8EncodeRef(decoded);
  assertEq(bytes, utf8EncodeRef(SUBJECT_MIXED), "Decoded Subject UTF-8 bytes are identical");
});

test("C: MIME body declares charset=UTF-8", () => {
  const mime = buildGmailRawMime(RECIPIENT, SUBJECT_MIXED, BODY_MIXED);
  const { headers } = parseMime(mime);
  assert(headers.includes("Content-Type: text/plain; charset=UTF-8"), "charset=UTF-8 is declared");
  assert(headers.includes("MIME-Version: 1.0"), "MIME-Version is declared");
});

test("D: MIME body declares Content-Transfer-Encoding: base64", () => {
  const mime = buildGmailRawMime(RECIPIENT, SUBJECT_MIXED, BODY_MIXED);
  const { headers } = parseMime(mime);
  assert(headers.includes("Content-Transfer-Encoding: base64"), "explicit CTE base64 is declared (no implicit 7bit guessing)");
});

test("E: Base64-decoding the MIME body reproduces the exact UTF-8 bytes of the original body", () => {
  const mime = buildGmailRawMime(RECIPIENT, SUBJECT_MIXED, BODY_MIXED);
  const { bodyBlock } = parseMime(mime);
  const decodedBytes = base64StdDecodeRef(bodyBlock);
  assertEq(decodedBytes, utf8EncodeRef(BODY_MIXED), "Decoded body bytes are the exact UTF-8 bytes of the governed draft body");
});

test("F: Decoded body reproduces the exact original Unicode body", () => {
  const mime = buildGmailRawMime(RECIPIENT, SUBJECT_MIXED, BODY_MIXED);
  const { bodyBlock } = parseMime(mime);
  assertEq(utf8DecodeRef(base64StdDecodeRef(bodyBlock)), BODY_MIXED, "Decoded body is byte-identical to the governed draft body");
});

test("G: CRLF MIME structure is valid (no bare LF, 76-char base64 wrapping)", () => {
  const mime = buildGmailRawMime(RECIPIENT, SUBJECT_MIXED, BODY_MIXED);
  assert(!/[^\r]\n/.test(mime), "No bare LF anywhere in the MIME message");
  assert(!mime.startsWith("\n"), "MIME does not start with a bare LF");
  const { bodyBlock } = parseMime(mime);
  const bodyLines = bodyBlock.split("\r\n");
  for (const line of bodyLines) {
    assert(line.length <= 76, "Every base64 body line is at most 76 characters (RFC 2045 canonical)");
    assert(/^[A-Za-z0-9+/=]*$/.test(line), "Body lines are pure base64 (the raw body never leaks into the MIME structure)");
  }
  for (const cp of ["\u2014", "\u2019", "\u201c", "\u20ac", "\u6771"]) {
    assert(mime.indexOf(cp) === -1, "No raw non-ASCII codepoint survives in the transport MIME: U+" + cp.codePointAt(0).toString(16));
  }
});

test("H: Approved Phase 14F draft hash before transport remains exactly 85f19a98", () => {
  assertEq(deriveFirstSendDraftHash(APPROVED_SUBJECT, APPROVED_BODY), APPROVED_DRAFT_HASH, "Approved draft hash is unchanged");
  const v = validateFirstSendInput({
    prospect_id: APPROVED_PROSPECT_ID,
    recipient_contact_id: APPROVED_CONTACT_ID,
    draft_subject: APPROVED_SUBJECT,
    draft_body: APPROVED_BODY,
    idempotency_key: APPROVED_INPUT_HASH,
  });
  assert(v.ok === true, "The exact approved first-send input still validates");
  assertEq(v.input.draft_hash, APPROVED_DRAFT_HASH, "The full input→hash pipeline still derives 85f19a98");
  // The transport serializer never touches the hashing inputs.
  const mime = buildGmailRawMime(RECIPIENT, APPROVED_SUBJECT, APPROVED_BODY);
  assert(mime.length > 0, "MIME built");
  assertEq(deriveFirstSendDraftHash(APPROVED_SUBJECT, APPROVED_BODY), APPROVED_DRAFT_HASH, "Draft hash is unchanged after MIME serialization");
});

test("I: Approval binding invariance — the governed message hash is unaffected by MIME serialization", () => {
  const message = {
    approved_draft_hash: APPROVED_DRAFT_HASH,
    content_binding: "APPROVED_DRAFT_HASH",
    to: null,
    subject: APPROVED_SUBJECT,
    body: APPROVED_BODY,
  };
  const before = deriveFirstSendMessageHash(message);
  const mime = buildGmailRawMime(RECIPIENT, APPROVED_SUBJECT, APPROVED_BODY);
  assert(mime.length > 0, "MIME built");
  const after = deriveFirstSendMessageHash(message);
  assertEq(before, after, "Governed message hash is unchanged by transport serialization");
  assertEq(validateFirstSendInput({
    prospect_id: APPROVED_PROSPECT_ID,
    recipient_contact_id: APPROVED_CONTACT_ID,
    draft_subject: APPROVED_SUBJECT,
    draft_body: APPROVED_BODY,
    idempotency_key: APPROVED_INPUT_HASH,
  }).input.idempotency_key, APPROVED_INPUT_HASH, "Approval input binding is unchanged");
});

test("J: No recipient or sender transformation occurs at transport", () => {
  const mime = buildGmailRawMime(RECIPIENT, SUBJECT_MIXED, BODY_MIXED);
  const { headers } = parseMime(mime);
  assert(headers.includes("To: " + RECIPIENT), "The To header is the server-resolved recipient, byte-identical");
  assert(headers.includes("From: " + GMAIL_DELIVERY_SENDER_IDENTITY), "The From header is the fixed Growth sender identity");
  assertEq(GMAIL_DELIVERY_SENDER_IDENTITY, "growth@execleadai.co", "Sender identity remains the fixed Growth mailbox");
  const headerText = headers.join("\r\n");
  assertEq(headerText.split("To:").length - 1, 1, "Exactly one recipient header");
  assert(!headerText.includes("Cc:") && !headerText.includes("Bcc:"), "No secondary recipient headers are ever created");
});

test("K: No control-character relaxation — forbidden subject controls remain rejected, newline-in-body contract preserved", () => {
  const marker = "EXECLEAD.AI CONTROLLED DELIVERY TEST";
  const ctrl = validateFirstSendDraftContent(marker + "\u0000 injected", "body");
  assert(ctrl.ok === false && ctrl.error_code === "FIRST_SEND_INPUT_INVALID", "NUL in subject rejected");
  const nl = validateFirstSendDraftContent(marker + "\nsecond line", "body");
  assert(nl.ok === false && nl.error_code === "FIRST_SEND_INPUT_INVALID", "LF in subject rejected (header-injection defense)");
  const cr = validateFirstSendDraftContent(marker + "\rsecond line", "body");
  assert(cr.ok === false && cr.error_code === "FIRST_SEND_INPUT_INVALID", "CR in subject rejected");
  const bodyNul = validateFirstSendDraftContent(marker, "body with \u0000 control");
  assert(bodyNul.ok === false && bodyNul.error_code === "FIRST_SEND_INPUT_INVALID", "NUL in body rejected");
  const bodyLf = validateFirstSendDraftContent(marker, "paragraph one\n\nparagraph two");
  assert(bodyLf.ok === true, "LF paragraph newlines in body remain permitted (already-approved contract)");
  const bodyCr = validateFirstSendDraftContent(marker, "paragraph one\r\nparagraph two");
  assert(bodyCr.ok === true, "CRLF in body remains permitted (already-approved contract)");
  const noMarker = validateFirstSendDraftContent("unmarked subject", "body");
  assert(noMarker.ok === false && noMarker.error_code === "FIRST_SEND_CONTROLLED_MARKER_REQUIRED", "Unmarked subject remains rejected");
});

test("MIME round-trips the approved draft byte-exactly (no mojibake regeneration)", () => {
  const mime = buildGmailRawMime(RECIPIENT, APPROVED_SUBJECT, APPROVED_BODY);
  const decodedSubject = decodeRfc2047Word(subjectEncodedWord(mime));
  assertEq(decodedSubject, APPROVED_SUBJECT, "Approved subject decodes byte-identically");
  const { bodyBlock } = parseMime(mime);
  assertEq(utf8DecodeRef(base64StdDecodeRef(bodyBlock)), APPROVED_BODY, "Approved body decodes byte-identically");
  const emDash = "\u2014";
  const decodedBytes = utf8EncodeRef(decodedSubject);
  const eIdx = decodedBytes.indexOf(0xe2);
  assert(decodedBytes[eIdx] === 0xe2 && decodedBytes[eIdx + 1] === 0x80 && decodedBytes[eIdx + 2] === 0x94,
    "The em dash survives as exact UTF-8 bytes e2 80 94 (mojibake cannot regenerate)");
  assertEq(emDash.codePointAt(0), 0x2014, "Em dash codepoint intact");
});

// Runner — Deno or sequential Node fallback.
let passed = 0; let failed = 0; const failures = [];
if (typeof Deno !== "undefined" && typeof Deno.test === "function") {
  for (const t of tests) {
    Deno.test(t.name, t.fn);
  }
} else {
  (async () => {
    for (const t of tests) {
      try { await t.fn(); passed++; }
      catch (e) { failed++; failures.push(t.name + " — " + String(e && e.message ? e.message : e).substring(0, 300)); }
    }
    console.log("RESULT " + passed + "/" + (passed + failed) + " deterministic tests " + (failed === 0 ? "pass" : "FAILED"));
    for (const f of failures) console.error("ERR>> " + f);
    if (failed > 0 && typeof process !== "undefined" && process.exit) process.exitCode = 1;
  })();
}