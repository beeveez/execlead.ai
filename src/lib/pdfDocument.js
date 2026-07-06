import { base44 } from "@/api/base44Client";

// ============================================================
// UNICODE PDF DOCUMENT BUILDER
// ------------------------------------------------------------
// Embeds a Unicode TTF font (Roboto) so every UTF-8 character,
// accented letter, bullet, and currency symbol renders correctly.
// jsPDF's built-in Helvetica uses WinAnsi encoding and produces
// garbled text (Ã, Â, Ø‹) for anything outside Latin-1.
//
// Layout: flowing y-cursor — each section pushes the next downward.
// No fixed positioning. Page breaks are automatic via ensureSpace().
//
// Safety layers:
//   1. Text sanitization — strips emojis, normalizes symbols
//   2. Font-activation check — verifies Roboto is actually in use
//   3. Pre-save validation — rejects corrupt/empty output
// ============================================================

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

const MARGIN = 48;
const HEADER_HEIGHT = 64;
const FOOTER_HEIGHT = 36;

let fontCache = null;

// ============================================================
// TEXT SANITIZATION
// Removes emojis and unsupported Unicode symbols from text that
// will be rendered in the PDF. Replaces decorative variants
// with plain ASCII equivalents (•, -, "", '').
// ============================================================

const EMOJI_RE = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2190}-\u{21FF}\u{2460}-\u{24FF}\u{25A0}-\u{25FF}\u{2C60}-\u{2C7F}\u{3000}-\u{303F}\u{3200}-\u{33FF}]/gu;

function sanitizeText(input) {
  if (input == null) return "";
  let s = String(input);
  // Strip emojis and symbol blocks that Roboto doesn't cover
  s = s.replace(EMOJI_RE, "");
  // Normalize bullet variants → standard • (U+2022)
  s = s.replace(/[\u2022\u2023\u2043\u204C\u204D\u2219\u25AA\u25CF\u25E6\u2044\u00B7\u2024]/g, "\u2022");
  // Normalize dash variants → plain -
  s = s.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-");
  // Normalize smart quotes
  s = s.replace(/[\u2018\u2019\u201A\u2032]/g, "'").replace(/[\u201C\u201D\u201E\u2033]/g, '"');
  // Normalize ellipsis
  s = s.replace(/\u2026/g, "...");
  // Normalize non-breaking / special spaces
  s = s.replace(/[\u00A0\u2007\u202F\u200B-\u200F\uFEFF]/g, " ");
  // Remove any remaining astral-plane characters (4-byte UTF-8)
  s = s.replace(/[\u{10000}-\u{10FFFF}]/gu, "");
  // Collapse runs of whitespace
  s = s.replace(/[ \t]{2,}/g, " ");
  return s.trim();
}

// ============================================================
// FONT LOADING
// ============================================================

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function fetchWithFallback(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        if (buf && buf.byteLength > 5000) return buf;
      }
    } catch (e) {}
  }
  throw new Error("Unable to load Unicode font for PDF generation");
}

async function loadFonts() {
  if (fontCache) return fontCache;
  const [regular, bold] = await Promise.all([
    fetchWithFallback(FONT_SOURCES.regular),
    fetchWithFallback(FONT_SOURCES.bold),
  ]);
  fontCache = {
    regular: arrayBufferToBase64(regular),
    bold: arrayBufferToBase64(bold),
  };
  return fontCache;
}

// ============================================================
// DOCUMENT FACTORY
// ============================================================

export async function createDocument({ title = "", docNumber = "", customer = "", version = "", effectiveDate = "" } = {}) {
  const { jsPDF } = await import("jspdf");
  const fonts = await loadFonts();

  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  doc.addFileToVFS("Roboto-Regular.ttf", fonts.regular);
  doc.addFileToVFS("Roboto-Bold.ttf", fonts.bold);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

  // -- Font-activation verification --------------------------------
  // If Roboto fails to register, jsPDF silently falls back to
  // Helvetica (WinAnsi) and all Unicode text garbles. Reject early.
  doc.setFont("Roboto", "normal");
  const activeFont = doc.getFont();
  if (!activeFont || activeFont.fontName !== "Roboto") {
    throw new Error("PDF_FONT_NOT_ACTIVE: Unicode font failed to activate");
  }

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const contentWidth = pw - MARGIN * 2;
  const top = HEADER_HEIGHT;
  const bottom = ph - FOOTER_HEIGHT;
  let y = top;

  // Sanitizing wrapper around doc.text — every string that reaches
  // the PDF passes through this, guaranteeing no emoji/unsupported
  // glyph ever enters the document.
  function putText(rawText, x, py, opts) {
    doc.text(sanitizeText(rawText), x, py, opts);
  }

  function drawHeader() {
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, pw, HEADER_HEIGHT - 8, "F");
    doc.setFont("Roboto", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    putText("EXECLEAD.AI", MARGIN, 26);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(9);
    doc.setTextColor(129, 140, 248);
    putText(title, MARGIN, 42);
    doc.setFontSize(7.5);
    doc.setTextColor(190, 190, 200);
    const lines = [
      docNumber && `Number: ${docNumber}`,
      customer && `Customer: ${customer}`,
      version && `Version: ${version}`,
      effectiveDate && `Effective: ${effectiveDate}`,
    ].filter(Boolean);
    let my = 18;
    lines.forEach((ln) => {
      putText(ln, pw - MARGIN, my, { align: "right" });
      my += 11;
    });
  }

  function drawFooter(pageNum, total) {
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 160);
    putText("Confidential", MARGIN, ph - 14);
    putText(`EXECLEAD.AI${version ? `  -  Document Version ${version}` : ""}`, pw / 2, ph - 14, { align: "center" });
    putText(`Page ${pageNum} of ${total}`, pw - MARGIN, ph - 14, { align: "right" });
  }

  drawHeader();

  // ============================================================
  // FLOWING LAYOUT API
  // Every method advances `y` by exactly the height it consumes.
  // ensureSpace() is called before each draw to trigger a page
  // break if the element would overflow the bottom margin.
  // This guarantees no two sections ever overlap.
  // ============================================================

  const api = {
    ensureSpace(h) {
      if (y + h > bottom) this.pageBreak();
      return this;
    },
    pageBreak() {
      doc.addPage();
      y = top;
      drawHeader();
      return this;
    },
    spacer(h = 12) {
      y += h;
      return this;
    },
    divider() {
      this.ensureSpace(12);
      doc.setDrawColor(225, 225, 230);
      doc.line(MARGIN, y, pw - MARGIN, y);
      y += 10;
      return this;
    },
    title(text, size = 16) {
      this.ensureSpace(size + 20);
      y += size + 4;
      doc.setFont("Roboto", "bold");
      doc.setFontSize(size);
      doc.setTextColor(20, 20, 30);
      putText(text, MARGIN, y);
      y += 10;
      return this;
    },
    heading(text, size = 12) {
      this.ensureSpace(size + 18);
      y += size + 6;
      doc.setFont("Roboto", "bold");
      doc.setFontSize(size);
      doc.setTextColor(20, 20, 30);
      putText(text, MARGIN, y);
      y += 6;
      return this;
    },
    paragraph(text, size = 9) {
      const lineH = size * 1.45;
      doc.setFont("Roboto", "normal");
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(sanitizeText(text), contentWidth);
      lines.forEach((ln) => {
        this.ensureSpace(lineH);
        doc.setFont("Roboto", "normal");
        doc.setFontSize(size);
        doc.setTextColor(70, 70, 80);
        putText(ln, MARGIN, y);
        y += lineH;
      });
      y += 4;
      return this;
    },
    kv(label, value, { bold = false } = {}) {
      const size = 9;
      const lineH = size * 1.5;
      const valueX = MARGIN + 150;
      const valueW = pw - MARGIN - valueX;
      doc.setFont("Roboto", "normal");
      doc.setFontSize(size);
      const valLines = doc.splitTextToSize(sanitizeText(value ?? "-"), valueW);
      const rowH = lineH * valLines.length;
      this.ensureSpace(rowH);
      doc.setFont("Roboto", "normal");
      doc.setFontSize(size);
      doc.setTextColor(140, 140, 150);
      putText(String(label) + ":", MARGIN, y);
      doc.setFont("Roboto", bold ? "bold" : "normal");
      doc.setTextColor(50, 50, 60);
      valLines.forEach((ln, i) => {
        putText(ln, valueX, y + i * lineH);
      });
      y += rowH;
      return this;
    },
    bullets(items, size = 9) {
      const lineH = size * 1.45;
      const indent = 16;
      const bulletIndent = MARGIN + 2;
      const textIndent = MARGIN + indent;
      items.forEach((item) => {
        doc.setFont("Roboto", "normal");
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(sanitizeText(item), contentWidth - indent);
        lines.forEach((ln, i) => {
          this.ensureSpace(lineH);
          doc.setFont("Roboto", "normal");
          doc.setFontSize(size);
          doc.setTextColor(70, 70, 80);
          if (i === 0) doc.text("\u2022", bulletIndent, y);
          putText(ln, textIndent, y);
          y += lineH;
        });
      });
      y += 4;
      return this;
    },
    table(headers, rows, opts = {}) {
      const { labelWidth = 210, size = 9 } = opts;
      const lineH = size * 1.5;
      const colValX = MARGIN + labelWidth;
      const labelColW = labelWidth - 16;
      const valColW = pw - MARGIN - colValX - 16;
      // header row
      this.ensureSpace(lineH + 8);
      doc.setFillColor(245, 245, 248);
      doc.rect(MARGIN, y, contentWidth, lineH + 6, "F");
      doc.setFont("Roboto", "bold");
      doc.setFontSize(size);
      doc.setTextColor(60, 60, 70);
      putText(headers[0] || "", MARGIN + 8, y + lineH);
      if (headers[1]) putText(headers[1], colValX + 8, y + lineH);
      y += lineH + 6;
      // data rows — each row expands to fit wrapped content
      rows.forEach((row) => {
        doc.setFont("Roboto", "normal");
        doc.setFontSize(size);
        const labelLines = doc.splitTextToSize(sanitizeText(row[0] ?? ""), labelColW);
        const valLines = doc.splitTextToSize(sanitizeText(row[1] ?? "-"), valColW);
        const rowCount = Math.max(labelLines.length, valLines.length);
        const rowH = lineH * rowCount;
        this.ensureSpace(rowH);
        doc.setDrawColor(230, 230, 235);
        doc.line(MARGIN, y, pw - MARGIN, y);
        doc.setFont("Roboto", "normal");
        doc.setFontSize(size);
        doc.setTextColor(100, 100, 110);
        labelLines.forEach((ln, i) => putText(ln, MARGIN + 8, y + lineH * (i + 1) - 3));
        doc.setTextColor(50, 50, 60);
        valLines.forEach((ln, i) => putText(ln, colValX + 8, y + lineH * (i + 1) - 3));
        y += rowH;
      });
      doc.setDrawColor(230, 230, 235);
      doc.line(MARGIN, y, pw - MARGIN, y);
      y += 10;
      return this;
    },
    total(label, value, size = 12) {
      this.ensureSpace(size + 18);
      doc.setDrawColor(200, 200, 210);
      doc.line(MARGIN, y, pw - MARGIN, y);
      y += size + 4;
      doc.setFont("Roboto", "bold");
      doc.setFontSize(size);
      doc.setTextColor(20, 20, 30);
      putText(label, MARGIN, y);
      doc.setTextColor(16, 185, 129);
      putText(value, pw - MARGIN, y, { align: "right" });
      y += 10;
      return this;
    },
    signatures(leftLabel, rightLabel, leftLines = [], rightLines = []) {
      const colW = contentWidth / 2;
      const leftX = MARGIN;
      const rightX = MARGIN + colW;
      const sigLineW = colW - 24;
      const lh = 13;
      const blockH = 20 + 14 + lh * (Math.max(leftLines.length, rightLines.length) + 1) + 12;
      this.ensureSpace(blockH);
      y += 20;
      doc.setDrawColor(140, 140, 150);
      doc.line(leftX, y, leftX + sigLineW, y);
      doc.line(rightX, y, rightX + sigLineW, y);
      y += 14;
      const renderCol = (x, label, lines) => {
        doc.setFont("Roboto", "bold");
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 60);
        putText(label, x, y);
        doc.setFont("Roboto", "normal");
        doc.setTextColor(120, 120, 130);
        lines.forEach((ln, i) => putText(ln, x, y + (i + 1) * lh));
      };
      renderCol(leftX, leftLabel, leftLines);
      renderCol(rightX, rightLabel, rightLines);
      y += lh * (Math.max(leftLines.length, rightLines.length) + 1) + 12;
      return this;
    },
    async upload(filename) {
      const total = doc.internal.getNumberOfPages();

      // -- Pre-save validation ---------------------------------------
      // Reject generation if any check fails rather than saving a
      // corrupt or garbled document.
      if (!total || total < 1) {
        throw new Error("PDF_VALIDATION_FAILED: no pages generated");
      }
      // Re-verify font is still active (not silently swapped)
      doc.setFont("Roboto", "normal");
      const checkFont = doc.getFont();
      if (!checkFont || checkFont.fontName !== "Roboto") {
        throw new Error("PDF_VALIDATION_FAILED: font not active on save");
      }

      // Draw footers on every page
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        drawFooter(i, total);
      }

      const blob = doc.output("blob");
      if (!blob || blob.size < 1000) {
        throw new Error("PDF_VALIDATION_FAILED: output too small, rendering error");
      }

      const file = new File([blob], filename, { type: "application/pdf" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    },
  };

  return api;
}