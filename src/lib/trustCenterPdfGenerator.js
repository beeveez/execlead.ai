/**
 * EXECLEAD.AI — Trust Center PDF Generator
 * Generates versioned PDF documents for the Download Center and Procurement Mode.
 * Each document includes version metadata, classification, and generation timestamp.
 */
import { jsPDF } from "jspdf";
import { PLATFORM_METADATA } from "./platformManifest";
import {
  PLATFORM_SECURITY, PRIVACY_DATA, COMPLIANCE_FRAMEWORKS,
  ENTERPRISE_GOVERNANCE, RESPONSIBLE_AI, OPERATIONAL_RELIABILITY,
  CERTIFICATION_TIMELINE, STATUS_CONFIG,
} from "./trustCenterData";
import {
  CAPACITY_DISCLOSURE, RESPONSIBLE_AI_DISCLOSURES,
  CERTIFICATION_ROADMAP_DETAILED, FOUNDATION_CERTIFICATION_CLARIFICATION,
  EXEC_TRUST_QA_ENHANCED, CLASSIFICATION_LEVELS,
} from "./trustCenterExtendedData";

const COLORS = {
  primary: [99, 102, 241],
  dark: [10, 10, 15],
  text: [30, 30, 40],
  muted: [120, 120, 130],
  green: [16, 185, 129],
  amber: [245, 158, 11],
  red: [239, 68, 68],
};

const DOC_CONFIG = {
  "security-overview": { title: "Security Overview", classification: "Public", sections: "security" },
  "privacy-overview": { title: "Privacy Overview", classification: "Public", sections: "privacy" },
  "architecture-overview": { title: "Architecture Overview", classification: "Public", sections: "architecture" },
  "compliance-roadmap": { title: "Compliance Roadmap", classification: "Public", sections: "compliance" },
  "responsible-ai": { title: "Responsible AI Overview", classification: "Public", sections: "responsible_ai" },
  "enterprise-readiness": { title: "Enterprise Readiness Report", classification: "Enterprise", sections: "enterprise" },
  "vendor-questionnaire": { title: "Vendor Security Questionnaire", classification: "Enterprise", sections: "vendor" },
};

function statusColor(status) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return COLORS.muted;
  const hex = cfg.color;
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

export function generateTrustDocument(docId) {
  const config = DOC_CONFIG[docId];
  if (!config) throw new Error(`Unknown document type: ${docId}`);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;
  const now = new Date();

  const ensureSpace = (h) => {
    if (y + h > pageH - margin) { doc.addPage(); y = margin; }
  };

  const drawText = (text, size, color, opts = {}) => {
    ensureSpace(size + 4);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    if (opts.wrap) {
      const lines = doc.splitTextToSize(text, opts.width || contentW);
      lines.forEach((line) => { ensureSpace(size + 2); doc.text(line, margin, y); y += size + 2; });
    } else {
      doc.text(text, opts.x || margin, y);
      y += size + (opts.space || 4);
    }
  };

  const drawSection = (title) => {
    y += 14;
    ensureSpace(30);
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, y - 4, 3, 16, "F");
    drawText(title, 13, COLORS.dark, { bold: true });
    y += 6;
  };

  const drawItem = (name, status, detail) => {
    ensureSpace(28);
    const cfg = STATUS_CONFIG[status] || {};
    doc.setFillColor(...statusColor(status));
    doc.circle(margin + 3, y - 2, 2, "F");
    doc.setFontSize(9); doc.setTextColor(...COLORS.text); doc.setFont("helvetica", "bold");
    doc.text(name, margin + 10, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
    doc.setTextColor(...statusColor(status));
    const label = cfg.label || status;
    const labelW = doc.getTextWidth(label);
    doc.text(label, pageW - margin - labelW, y);
    y += 10;
    if (detail) {
      doc.setFontSize(7.5); doc.setTextColor(...COLORS.muted); doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(detail, contentW - 14);
      lines.forEach((line) => { ensureSpace(10); doc.text(line, margin + 10, y); y += 9; });
    }
    y += 4;
  };

  // ── Header ──
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setFontSize(7); doc.setTextColor(...COLORS.primary); doc.setFont("helvetica", "bold");
  doc.text("EXECLEAD.AI", margin, 26);
  doc.setFontSize(16); doc.setTextColor(255, 255, 255);
  doc.text(config.title, margin, 48);
  doc.setFontSize(7.5); doc.setTextColor(180, 180, 190); doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${now.toLocaleString()}`, margin, 64);
  doc.text(`Platform v${PLATFORM_METADATA.platformVersion} · Build ${PLATFORM_METADATA.buildNumber}`, margin, 75);
  const classColor = CLASSIFICATION_LEVELS[config.classification]?.color || "#64748b";
  const [cr, cg, cb] = [parseInt(classColor.slice(1, 3), 16), parseInt(classColor.slice(3, 5), 16), parseInt(classColor.slice(5, 7), 16)];
  doc.setTextColor(cr, cg, cb); doc.setFont("helvetica", "bold");
  doc.text(config.classification, pageW - margin - 40, 75);
  y = 120;

  // ── Version Metadata ──
  drawSection("Document Metadata");
  drawText(`Document Version: 2.0  |  Platform Version: ${PLATFORM_METADATA.platformVersion}  |  Manifest Version: ${PLATFORM_METADATA.manifestVersion}`, 8, COLORS.muted);
  drawText(`Knowledge Pack Version: ${PLATFORM_METADATA.knowledgeVersion}  |  Framework Version: ${PLATFORM_METADATA.frameworkVersion}`, 8, COLORS.muted);
  drawText(`Environment: ${PLATFORM_METADATA.environment}  |  Generated By: EXEC™`, 8, COLORS.muted);

  // ── Content Sections ──
  if (config.sections === "security") {
    drawSection("Platform Security™");
    PLATFORM_SECURITY.forEach((item) => drawItem(item.name, item.status, item.detail));
  } else if (config.sections === "privacy") {
    drawSection("Privacy & Data Protection™");
    PRIVACY_DATA.forEach((item) => drawItem(item.name, item.status, item.detail));
  } else if (config.sections === "architecture") {
    drawSection("Platform Architecture™");
    drawText("Architecture: React SPA + Serverless Backend (Deno Deploy) + Managed Database", 9, COLORS.text, { bold: true });
    drawText("Core Services: Platform State Manager™, Platform Governance Center™, Guardian™, Knowledge Pack Engine™", 8, COLORS.muted, { wrap: true });
    drawSection("Enterprise Governance™");
    ENTERPRISE_GOVERNANCE.forEach((item) => drawItem(item.name, item.status, item.detail));
  } else if (config.sections === "compliance") {
    drawSection("Compliance Frameworks™");
    COMPLIANCE_FRAMEWORKS.forEach((fw) => drawItem(fw.name, fw.status, fw.description));
    drawSection("Certification Roadmap™ (Detailed)");
    CERTIFICATION_ROADMAP_DETAILED.forEach((cert) => {
      drawItem(cert.name, cert.status, `Owner: ${cert.owner} | Target: ${cert.targetQuarter} | Progress: ${cert.progress}%${cert.blockedBy ? ` | Blocked: ${cert.blockedBy}` : ""}`);
    });
  } else if (config.sections === "responsible_ai") {
    drawSection("Responsible AI™");
    RESPONSIBLE_AI.forEach((item) => drawItem(item.name, item.status, item.detail));
    drawSection("Expanded Disclosures");
    RESPONSIBLE_AI_DISCLOSURES.forEach((item) => drawItem(item.topic, item.status, item.detail));
  } else if (config.sections === "enterprise") {
    drawSection("Operational Reliability™");
    OPERATIONAL_RELIABILITY.forEach((item) => drawItem(item.name, item.status, item.detail));
    drawSection("Capacity Disclosure™");
    drawText(`Estimated Concurrent Users: ≈${CAPACITY_DISCLOSURE.estimatedConcurrentUsers}`, 9, COLORS.text, { bold: true });
    CAPACITY_DISCLOSURE.basis.forEach((b) => drawText(`• ${b.factor}: ${b.detail}`, 8, COLORS.muted, { wrap: true }));
    drawSection("Foundation Certification™");
    drawText(FOUNDATION_CERTIFICATION_CLARIFICATION.description, 8.5, COLORS.muted, { wrap: true });
    drawText(`Status: ${FOUNDATION_CERTIFICATION_CLARIFICATION.status}`, 8, COLORS.amber, { bold: true });
  } else if (config.sections === "vendor") {
    drawSection("Vendor Security Questionnaire");
    EXEC_TRUST_QA_ENHANCED.forEach((qa, i) => {
      ensureSpace(40);
      drawText(`Q${i + 1}: ${qa.question}`, 9, COLORS.text, { bold: true, wrap: true });
      drawText(qa.answer, 8, COLORS.muted, { wrap: true });
      drawText(`Status: ${qa.distinction}`, 7.5, COLORS.primary, { wrap: true });
      y += 4;
    });
  }

  // ── Footer ──
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(...COLORS.muted); doc.setFont("helvetica", "normal");
    doc.text("EXECLEAD.AI — Enterprise Trust Center™ — Confidential", margin, pageH - 20);
    doc.text(`Page ${i} of ${pages}`, pageW - margin - 40, pageH - 20);
  }

  doc.save(`execlead-${docId}-${now.toISOString().split("T")[0]}.pdf`);
}