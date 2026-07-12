/**
 * EXECLEAD.AI — Security Overview PDF Generator
 * Generates a comprehensive PDF for vendor assessments and procurement reviews.
 */
import { jsPDF } from "jspdf";
import {
  PLATFORM_SECURITY, PRIVACY_DATA, COMPLIANCE_FRAMEWORKS,
  ENTERPRISE_GOVERNANCE, RESPONSIBLE_AI, OPERATIONAL_RELIABILITY,
  CERTIFICATION_TIMELINE, PLATFORM_STATUS, SECURITY_CONTACT,
  SECURITY_REPORTING, STATUS_CONFIG,
} from "./trustCenterData";

const COLORS = {
  primary: [99, 102, 241],
  dark: [10, 10, 15],
  text: [30, 30, 40],
  muted: [120, 120, 130],
  light: [240, 240, 245],
  green: [16, 185, 129],
  amber: [245, 158, 11],
  red: [239, 68, 68],
};

function statusColor(status) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return COLORS.muted;
  const hex = cfg.color;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export function generateSecurityOverviewPdf() {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (h) => {
    if (y + h > pageH - margin) { doc.addPage(); y = margin; }
  };

  const drawText = (text, size, color, opts = {}) => {
    ensureSpace(size + 4);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.setFont(opts.bold ? "helvetica" : "normal", opts.bold ? "bold" : "normal");
    if (opts.wrap) {
      const lines = doc.splitTextToSize(text, contentW);
      lines.forEach((line) => { ensureSpace(size + 2); doc.text(line, margin, y); y += size + 2; });
    } else {
      doc.text(text, opts.x || margin, y);
      y += size + (opts.space || 4);
    }
  };

  const drawSection = (title) => {
    y += 12;
    ensureSpace(30);
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, y - 4, 3, 16, "F");
    drawText(title, 13, COLORS.dark, { bold: true });
    y += 4;
  };

  const drawItem = (name, status, detail) => {
    ensureSpace(28);
    const cfg = STATUS_CONFIG[status] || {};
    // Status dot
    doc.setFillColor(...statusColor(status));
    doc.circle(margin + 3, y - 2, 2, "F");
    // Name
    doc.setFontSize(9); doc.setTextColor(...COLORS.text); doc.setFont("helvetica", "bold");
    doc.text(name, margin + 10, y);
    // Status label
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
    doc.setTextColor(...statusColor(status));
    const label = cfg.label || status;
    const labelW = doc.getTextWidth(label);
    doc.text(label, pageW - margin - labelW, y);
    y += 10;
    // Detail
    if (detail) {
      doc.setFontSize(7.5); doc.setTextColor(...COLORS.muted); doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(detail, contentW - 14);
      lines.forEach((line) => { ensureSpace(10); doc.text(line, margin + 10, y); y += 9; });
    }
    y += 4;
  };

  // ── Header ──
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setFontSize(7); doc.setTextColor(...COLORS.primary); doc.setFont("helvetica", "bold");
  doc.text("EXECLEAD.AI", margin, 28);
  doc.setFontSize(16); doc.setTextColor(255, 255, 255);
  doc.text("Security Overview", margin, 50);
  doc.setFontSize(8); doc.setTextColor(180, 180, 190); doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 65);
  doc.text("Enterprise Trust Center™", pageW - margin - 100, 65);
  y = 110;

  // ── Intro ──
  drawText("This document provides a comprehensive overview of the security, privacy, compliance, and reliability posture of the EXECLEAD.AI platform. All statuses are honest and current as of the generation date. EXECLEAD.AI never implies external certification unless it has been officially obtained.", 9, COLORS.muted, { wrap: true });
  y += 8;

  // ── Platform Status ──
  drawSection("Platform Status™");
  drawText(`Current Status: ${PLATFORM_STATUS.currentStatus}  |  Uptime: ${PLATFORM_STATUS.uptime}  |  ${PLATFORM_STATUS.lastIncident}`, 9, COLORS.green, { bold: true });

  // ── Platform Security ──
  drawSection("Platform Security™");
  PLATFORM_SECURITY.forEach((item) => drawItem(item.name, item.status, item.detail));

  // ── Privacy & Data Protection ──
  drawSection("Privacy & Data Protection™");
  PRIVACY_DATA.forEach((item) => drawItem(item.name, item.status, item.detail));

  // ── Compliance Roadmap ──
  drawSection("Compliance Roadmap™");
  COMPLIANCE_FRAMEWORKS.forEach((fw) => drawItem(fw.name, fw.status, fw.description));

  // ── Enterprise Governance ──
  drawSection("Enterprise Governance™");
  ENTERPRISE_GOVERNANCE.forEach((item) => drawItem(item.name, item.status, item.detail));

  // ── Responsible AI ──
  drawSection("Responsible AI™");
  RESPONSIBLE_AI.forEach((item) => drawItem(item.name, item.status, item.detail));

  // ── Operational Reliability ──
  drawSection("Operational Reliability™");
  OPERATIONAL_RELIABILITY.forEach((item) => drawItem(item.name, item.status, item.detail));

  // ── Certification Roadmap ──
  drawSection("Certification Roadmap™");
  CERTIFICATION_TIMELINE.forEach((item) => drawItem(item.name, item.status, `${item.phase}: ${item.detail}`));

  // ── Security Contact ──
  drawSection("Security Contact™");
  drawText(`Email: ${SECURITY_CONTACT.email}`, 9, COLORS.text, { bold: true });
  drawText(`Response: ${SECURITY_CONTACT.responseTime}  |  Escalation: ${SECURITY_CONTACT.escalationPath}`, 8, COLORS.muted);
  SECURITY_CONTACT.teams.forEach((team) => {
    drawText(`${team.name} (${team.contact}): ${team.purpose}`, 8, COLORS.muted, { wrap: true });
  });

  // ── Report a Security Issue ──
  drawSection("Report a Security Issue™");
  drawText(SECURITY_REPORTING.policy, 8.5, COLORS.muted, { wrap: true });
  drawText(`Scope: ${SECURITY_REPORTING.scope}`, 8, COLORS.muted, { wrap: true });

  // ── Footer ──
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(...COLORS.muted); doc.setFont("helvetica", "normal");
    doc.text("EXECLEAD.AI — Enterprise Trust Center™ — Confidential", margin, pageH - 20);
    doc.text(`Page ${i} of ${pages}`, pageW - margin - 40, pageH - 20);
  }

  doc.save(`execlead-security-overview-${new Date().toISOString().split("T")[0]}.pdf`);
}