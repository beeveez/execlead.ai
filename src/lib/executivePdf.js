/**
 * EXECLEAD.AI — Executive Identity Print Engine
 * ----------------------------------------------
 * Renders a dedicated print-optimized PDF directly from structured profile
 * data (NOT a browser screenshot). Vector text, embedded Unicode fonts,
 * selectable/searchable output, print-friendly colors, section keep-together.
 *
 * Page: A4 / US Letter • Portrait / Landscape
 * Margins: 20mm top/bottom, 18mm left/right (no clipping)
 */
import { computeExecutiveScore, getLeadershipLevel, getPublicProfileUrl, getExecutiveSlug } from "@/lib/socialShare";

const FONT_SOURCES = {
  regular: [
    "https://cdn.jsdelivr.net/gh/openmaptiles/fonts@master/roboto/Roboto-Regular.ttf",
    "https://raw.githubusercontent.com/openmaptiles/fonts/master/roboto/Roboto-Regular.ttf",
  ],
  bold: [
    "https://cdn.jsdelivr.net/gh/openmaptiles/fonts@master/roboto/Roboto-Bold.ttf",
    "https://raw.githubusercontent.com/openmaptiles/fonts/master/roboto/Roboto-Bold.ttf",
  ],
};

const PT_MM = 25.4 / 72; // pt → mm
const M = { top: 20, bottom: 20, left: 18, right: 18 };

const C = {
  brand: [37, 99, 235],
  ink: [17, 24, 39],
  body: [55, 65, 81],
  muted: [107, 114, 128],
  line: [214, 222, 234],
  tint: [241, 245, 252],
  tintBorder: [203, 213, 232],
  amber: [161, 98, 7],
  green: [21, 128, 61],
};

let fontCache = null;
let FONT_FAMILY = "helvetica";

const EMOJI_RE = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2190}-\u{21FF}\u{2460}-\u{24FF}\u{25A0}-\u{25FF}\u{2C60}-\u{2C7F}\u{3000}-\u{303F}\u{3200}-\u{33FF}]/gu;

function sanitize(input) {
  if (input == null) return "";
  let s = String(input);
  s = s.replace(EMOJI_RE, "");
  s = s.replace(/[\u2022\u2023\u2043\u204C\u204D\u2219\u25AA\u25CF\u25E6\u2044\u00B7\u2024]/g, "\u2022");
  s = s.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-");
  s = s.replace(/[\u2018\u2019\u201A\u2032]/g, "'").replace(/[\u201C\u201D\u201E\u2033]/g, '"');
  s = s.replace(/\u2026/g, "...");
  s = s.replace(/[\u00A0\u2007\u202F\u200B-\u200F\uFEFF]/g, " ");
  s = s.replace(/[\u{10000}-\u{10FFFF}]/gu, "");
  s = s.replace(/[ \t]{2,}/g, " ");
  return s.trim();
}

function bufToB64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  return btoa(binary);
}

async function fetchFont(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) { const buf = await res.arrayBuffer(); if (buf && buf.byteLength > 5000) return buf; }
    } catch {}
  }
  throw new Error("Unable to load Unicode font");
}

async function loadFonts() {
  if (fontCache) return fontCache;
  const [reg, bold] = await Promise.all([fetchFont(FONT_SOURCES.regular), fetchFont(FONT_SOURCES.bold)]);
  fontCache = { regular: bufToB64(reg), bold: bufToB64(bold) };
  return fontCache;
}

function parseJson(str, fallback) {
  if (!str) return fallback;
  if (Array.isArray(str) || typeof str === "object") return str;
  try { const v = JSON.parse(str); return v ?? fallback; } catch { return fallback; }
}

function lineH(pt) { return pt * PT_MM * 1.4; }

/** Fetch an image URL and normalize to a PNG data URL + natural dimensions. */
async function loadImage(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let out = dataUrl;
        try {
          const c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext("2d").drawImage(img, 0, 0);
          out = c.toDataURL("image/png");
        } catch {}
        resolve({ dataUrl: out, w: img.naturalWidth, h: img.naturalHeight });
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  } catch { return null; }
}

export async function buildExecutivePdf(profile, opts = {}) {
  if (!profile) throw new Error("No profile provided");
  let format = opts.format || "a4";
  let orientation = opts.orientation || "auto";
  if (orientation === "auto") orientation = "portrait"; // executive report reads best in portrait

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format, orientation, compress: true });

  // Embed Unicode font; fall back to helvetica if registration fails (still vector/selectable)
  try {
    const fonts = await loadFonts();
    doc.addFileToVFS("Roboto-Regular.ttf", fonts.regular);
    doc.addFileToVFS("Roboto-Bold.ttf", fonts.bold);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
    doc.setFont("Roboto", "normal");
    if (doc.getFont()?.fontName === "Roboto") FONT_FAMILY = "Roboto";
  } catch {}

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const cw = pw - M.left - M.right;
  const bottomLimit = ph - M.bottom - 4;
  let y = 24;

  const slug = profile.public_username || getExecutiveSlug(profile);
  const publicUrl = getPublicProfileUrl(slug);
  const execScore = computeExecutiveScore(profile);
  const level = getLeadershipLevel(execScore);
  const genDateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const version = profile.updated_date ? new Date(profile.updated_date).toISOString().slice(0, 10) : "draft";

  const photo = await loadImage(profile.profile_photo);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${publicUrl}?source=qr`)}`;
  const qr = await loadImage(qrUrl);

  function drawHeader() {
    doc.setFont(FONT_FAMILY, "bold"); doc.setFontSize(13); doc.setTextColor(...C.ink);
    doc.text("EXECLEAD", M.left, 6, { baseline: "top" });
    const wExec = doc.getTextWidth("EXECLEAD");
    doc.setTextColor(...C.brand);
    doc.text(".AI", M.left + wExec, 6, { baseline: "top" });
    doc.setFont(FONT_FAMILY, "normal"); doc.setFontSize(8); doc.setTextColor(...C.muted);
    doc.text("Executive Identity Card", M.left, 12, { baseline: "top" });
    doc.setFontSize(8); doc.setTextColor(...C.muted);
    doc.text(`Generated: ${genDateStr}`, pw - M.right, 6, { align: "right", baseline: "top" });
    doc.text(`Version: ${version}`, pw - M.right, 11, { align: "right", baseline: "top" });
    doc.setDrawColor(...C.line); doc.setLineWidth(0.3);
    doc.line(M.left, 19, pw - M.right, 19);
  }

  function drawFooter(pageNum, total) {
    doc.setDrawColor(...C.line); doc.setLineWidth(0.3);
    doc.line(M.left, ph - 19, pw - M.right, ph - 19);
    doc.setFont(FONT_FAMILY, "normal"); doc.setFontSize(8); doc.setTextColor(...C.muted);
    doc.text("EXECLEAD.AI", M.left, ph - 14, { baseline: "top" });
    doc.text(publicUrl, pw / 2, ph - 14, { align: "center", baseline: "top" });
    doc.text(`Page ${pageNum} of ${total}`, pw - M.right, ph - 14, { align: "right", baseline: "top" });
  }

  function ensureSpace(h) {
    if (y + h > bottomLimit) { doc.addPage(); y = 24; drawHeader(); }
  }

  function drawLine(text, x, size, style = "normal", color = C.body, align = "left") {
    const lh = lineH(size);
    ensureSpace(lh);
    doc.setFont(FONT_FAMILY, style); doc.setFontSize(size); doc.setTextColor(...color);
    doc.text(sanitize(text), x, y, { align, baseline: "top" });
    y += lh;
  }

  function drawWrapped(text, x, size, style, color, maxWidth, align = "left") {
    if (!text) return;
    doc.setFont(FONT_FAMILY, style); doc.setFontSize(size);
    const lines = doc.splitTextToSize(sanitize(text), maxWidth);
    lines.forEach((ln) => drawLine(ln, x, size, style, color, align));
  }

  function center(text, size, style, color) {
    drawWrapped(text, pw / 2, size, style, color, cw - 30, "center");
  }

  function section(title) {
    ensureSpace(16);
    doc.setFillColor(...C.brand);
    doc.rect(M.left, y + 1, 2.5, 6, "F");
    doc.setFont(FONT_FAMILY, "bold"); doc.setFontSize(16); doc.setTextColor(...C.ink);
    doc.text(sanitize(title), M.left + 5, y, { baseline: "top" });
    y += 13;
  }

  function metricCards(cards) {
    const n = cards.length; if (!n) return;
    const gap = 4; const cardW = (cw - gap * (n - 1)) / n; const cardH = 20;
    ensureSpace(cardH + 6);
    cards.forEach((c, i) => {
      const x = M.left + i * (cardW + gap);
      doc.setFillColor(...C.tint); doc.roundedRect(x, y, cardW, cardH, 2, 2, "F");
      doc.setDrawColor(...C.tintBorder); doc.roundedRect(x, y, cardW, cardH, 2, 2, "S");
      doc.setFont(FONT_FAMILY, "bold"); doc.setFontSize(16); doc.setTextColor(...C.brand);
      doc.text(sanitize(String(c.value)), x + cardW / 2, y + 4.5, { align: "center", baseline: "top" });
      doc.setFont(FONT_FAMILY, "normal"); doc.setFontSize(8); doc.setTextColor(...C.muted);
      const lbls = doc.splitTextToSize(sanitize(c.label), cardW - 4).slice(0, 2);
      lbls.forEach((ln, li) => doc.text(ln, x + cardW / 2, y + 12 + li * 3.2, { align: "center", baseline: "top" }));
    });
    y += cardH + 6;
  }

  function barRow(label, value) {
    const rowH = 13;
    ensureSpace(rowH);
    doc.setFont(FONT_FAMILY, "normal"); doc.setFontSize(11); doc.setTextColor(...C.body);
    doc.text(sanitize(label), M.left, y, { baseline: "top" });
    doc.setFont(FONT_FAMILY, "bold"); doc.setTextColor(...C.ink);
    doc.text(`${value}%`, pw - M.right, y, { align: "right", baseline: "top" });
    const by = y + 7.5; const bh = 3;
    doc.setFillColor(...C.tint); doc.roundedRect(M.left, by, cw, bh, 1.5, 1.5, "F");
    const fw = Math.max(2, (cw * Math.min(100, Math.max(0, value))) / 100);
    doc.setFillColor(...C.brand); doc.roundedRect(M.left, by, fw, bh, 1.5, 1.5, "F");
    y += rowH;
  }

  function entry({ title, meta, desc, titleSize = 11 }) {
    doc.setFont(FONT_FAMILY, "bold"); doc.setFontSize(titleSize);
    const tH = doc.splitTextToSize(sanitize(title), cw).length * lineH(titleSize);
    doc.setFont(FONT_FAMILY, "normal"); doc.setFontSize(10);
    const mH = meta ? doc.splitTextToSize(sanitize(meta), cw).length * lineH(10) : 0;
    const dH = desc ? doc.splitTextToSize(sanitize(desc), cw).length * lineH(10) : 0;
    ensureSpace(tH + mH + dH + 3);
    if (title) drawWrapped(title, M.left, titleSize, "bold", C.ink, cw);
    if (meta) drawWrapped(meta, M.left, 10, "normal", C.muted, cw);
    if (desc) drawWrapped(desc, M.left, 10, "normal", C.body, cw);
    y += 3;
  }

  // ── First page header ───────────────────────────────────────────
  drawHeader();

  // ── 1. IDENTITY ─────────────────────────────────────────────────
  if (photo) {
    const targetH = 30;
    let dw = photo.w * (targetH / photo.h);
    let dh = targetH;
    if (dw > 42) { dh = photo.h * (42 / photo.w); dw = 42; }
    const px = (pw - dw) / 2;
    ensureSpace(dh + 5);
    doc.addImage(photo.dataUrl, "PNG", px, y, dw, dh, undefined, "FAST");
    y += dh + 5;
  } else {
    const r = 15; const cx = pw / 2; const cy = y + r;
    ensureSpace(r * 2 + 5);
    doc.setFillColor(...C.tint); doc.circle(cx, cy, r, "F");
    doc.setDrawColor(...C.tintBorder); doc.circle(cx, cy, r, "S");
    doc.setFont(FONT_FAMILY, "bold"); doc.setFontSize(22); doc.setTextColor(...C.brand);
    doc.text((profile.full_name || "?").charAt(0).toUpperCase(), cx, cy, { align: "center", baseline: "middle" });
    y += r * 2 + 5;
  }

  // Name — auto-fit so it never overflows
  let nameSize = 22;
  doc.setFont(FONT_FAMILY, "bold");
  while (nameSize > 14 && doc.getTextWidth(sanitize(profile.full_name || "Executive Leader")) > cw - 30) {
    nameSize--; doc.setFontSize(nameSize);
  }
  center(profile.full_name || "Executive Leader", nameSize, "bold", C.ink);

  if (profile.professional_headline || profile.current_role) center(profile.professional_headline || profile.current_role, 12, "normal", C.body);
  if (profile.current_company) center(profile.current_company, 11, "normal", C.muted);

  const targetParts = [];
  if (profile.target_role) targetParts.push(`Target: ${profile.target_role}`);
  if (profile.target_company) targetParts.push(`at ${profile.target_company}`);
  if (targetParts.length) center(targetParts.join(" "), 11, "normal", C.brand);

  const badgeBits = [level];
  if (profile.verified_executive) badgeBits.push("Verified Executive");
  center(badgeBits.join("   •   "), 10, "bold", C.amber);

  y += 2;
  if (qr) {
    const qs = 22; const qx = (pw - qs) / 2;
    ensureSpace(qs + 10);
    doc.addImage(qr.dataUrl, "PNG", qx, y, qs, qs, undefined, "FAST");
    y += qs + 2;
    center("Scan to view executive profile", 9, "normal", C.muted);
    center(publicUrl, 9, "bold", C.brand);
  }
  y += 4;

  // ── 2. EXECUTIVE SUMMARY ────────────────────────────────────────
  if (profile.bio) {
    section("Executive Summary");
    drawWrapped(profile.bio, M.left, 11, "normal", C.body, cw);
    y += 3;
  }

  // ── 3. EXECUTIVE SCORES ─────────────────────────────────────────
  section("Executive Scores");
  metricCards([
    { label: "Promotion Readiness", value: `${profile.promotion_readiness || 0}%` },
    { label: "Executive Score", value: `${execScore}/100` },
    { label: "Leadership Level", value: level },
    { label: "Sessions Completed", value: `${profile.sessions_completed || 0}` },
  ]);

  // ── 4. LEADERSHIP DNA ───────────────────────────────────────────
  section("Leadership DNA");
  barRow("Promotion Readiness", profile.promotion_readiness || 0);
  barRow("Leadership Maturity", profile.leadership_maturity || 0);
  barRow("Commercial Maturity", profile.commercial_maturity || 0);
  barRow("Communication Growth", profile.communication_growth || 0);
  barRow("Executive Presence", profile.executive_presence || 0);
  barRow("Confidence", profile.confidence || 0);
  y += 2;

  // ── 5. EXPERIENCE ───────────────────────────────────────────────
  const experience = parseJson(profile.experience_json, []);
  if (Array.isArray(experience) && experience.length) {
    section("Experience");
    experience.forEach((exp) => entry({
      title: exp.title || exp.role || "",
      meta: [exp.company, exp.startDate, exp.endDate].filter(Boolean).join("  •  "),
      desc: exp.description || "",
    }));
  }

  // ── 6. EDUCATION ────────────────────────────────────────────────
  const education = parseJson(profile.education_json, []);
  if (Array.isArray(education) && education.length) {
    section("Education");
    education.forEach((edu) => entry({
      title: edu.degree || "",
      meta: [edu.institution || edu.school, edu.year].filter(Boolean).join("  •  "),
    }));
  }

  // ── 7. SKILLS ───────────────────────────────────────────────────
  const skills = profile.skills || [];
  if (Array.isArray(skills) && skills.length) {
    section("Skills");
    drawWrapped(skills.map((s) => sanitize(s)).join("   •   "), M.left, 11, "normal", C.body, cw);
    y += 3;
  }

  // ── 8. CERTIFICATIONS ───────────────────────────────────────────
  const certifications = parseJson(profile.certifications_json, []);
  if (Array.isArray(certifications) && certifications.length) {
    section("Certifications");
    certifications.forEach((cert) => entry({
      title: typeof cert === "string" ? cert : cert.name || "",
      meta: typeof cert === "object" ? [cert.issuer, cert.institution, cert.date].filter(Boolean).join("  •  ") : "",
    }));
  }

  // ── Footer on every page ────────────────────────────────────────
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) { doc.setPage(i); drawFooter(i, total); }

  return doc;
}