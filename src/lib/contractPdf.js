import { base44 } from "@/api/base44Client";
import { formatCPQPrice } from "@/lib/cpqEngine";

// ============================================================
// CONTRACT PDF GENERATOR
// Generates a Master Service Agreement + Subscription
// Agreement PDF, uploads it, and returns the file URL.
// ============================================================

export async function generateContractPDF(quote, breakdown, catalog) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 0;

  const fmt = (val) => formatCPQPrice(val, quote.currency, catalog?.currencies);
  const today = new Date().toLocaleDateString();

  // ── Header ──
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageWidth, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("EXECLEAD.AI", margin, 24);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(129, 140, 248);
  doc.text("Enterprise Agreement", pageWidth - margin, 24, { align: "right" });

  y = 50;

  // ── Title ──
  doc.setTextColor(30, 30, 40);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("MASTER SERVICE AGREEMENT", margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 110);
  doc.text(`Agreement Reference: ${quote.proposal_number}`, margin, y);
  y += 5;
  doc.text(`Effective Date: ${today}`, margin, y);
  y += 10;

  // ── Parties ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 40);
  doc.text("1. Parties", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 90);
  const parties = [
    `This Master Service Agreement ("Agreement") is entered into by and between EXECLEAD.AI ("Provider") and ${quote.organization_name} ("Customer"), collectively the "Parties."`,
    "",
    `Provider: EXECLEAD.AI, a leadership development platform.`,
    `Customer: ${quote.organization_name}, located in ${quote.country}, industry: ${quote.industry}.`,
  ];
  parties.forEach((line) => {
    doc.text(line, margin, y, { maxWidth: pageWidth - margin * 2 });
    y += 5;
  });
  y += 4;

  // ── Services ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 40);
  doc.text("2. Services", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 90);
  const services = [
    "Provider grants Customer access to the EXECLEAD.AI Enterprise platform, including executive coaching, leadership simulation, career intelligence, and analytics modules as specified in the Subscription Agreement below.",
    "The platform is provided as a hosted software-as-a-service (SaaS) solution accessible via web browser and mobile applications.",
  ];
  services.forEach((line) => {
    doc.text(line, margin, y, { maxWidth: pageWidth - margin * 2 });
    y += 5;
  });
  y += 4;

  // ── Subscription Terms ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 40);
  doc.text("3. Subscription Terms", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 90);
  const subRows = [
    ["Contract Length", `${quote.contract_length_years || 1} year(s)`],
    ["Licensed Seats", String(breakdown?.seats || quote.expected_active_users || 0)],
    ["AI Package", breakdown?.aiPackage?.name || "Standard"],
    ["Support Level", breakdown?.supportPackage?.name || "Standard"],
    ["Start Date", today],
  ];
  subRows.forEach(([label, value]) => {
    doc.setTextColor(150, 150, 160);
    doc.text(label + ":", margin, y);
    doc.setTextColor(60, 60, 70);
    doc.text(value, margin + 50, y);
    y += 5;
  });
  y += 4;

  // Modules
  if (breakdown?.selectedModules?.length > 0) {
    doc.setTextColor(150, 150, 160);
    doc.text("Purchased Modules:", margin, y);
    doc.setTextColor(60, 60, 70);
    const moduleText = breakdown.selectedModules.map((m) => `${m.icon} ${m.name}`).join(", ");
    doc.text(moduleText, margin + 50, y, { maxWidth: pageWidth - margin - 50 });
    y += 8;
  }

  // ── Fees ──
  if (y > pageHeight - 80) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 40);
  doc.text("4. Fees and Payment", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 90);
  const feeRows = [
    ["Annual Recurring Revenue", fmt(breakdown?.annualRecurring || quote.annual_value)],
  ];
  if (breakdown?.discount?.amount > 0) {
    feeRows.push(["Discount", `-${fmt(breakdown.discount.amount)}`]);
  }
  feeRows.push(["Services & Add-ons", fmt(breakdown?.servicesCost || 0)]);
  if (breakdown?.tax?.amount > 0) {
    feeRows.push([`Tax (${(breakdown.tax.rate * 100).toFixed(0)}% ${breakdown.tax.type})`, fmt(breakdown.tax.amount)]);
  }
  feeRows.forEach(([label, value]) => {
    doc.setTextColor(150, 150, 160);
    doc.text(label, margin, y);
    doc.setTextColor(60, 60, 70);
    doc.text(value, pageWidth - margin, y, { align: "right" });
    y += 5;
  });
  y += 2;
  doc.setDrawColor(200, 200, 210);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 40);
  doc.text("Grand Total", margin, y);
  doc.setTextColor(16, 185, 129);
  doc.text(fmt(quote.grand_total || breakdown?.grandTotal || 0), pageWidth - margin, y, { align: "right" });
  y += 10;

  // ── Term & Renewal ──
  if (y > pageHeight - 60) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 40);
  doc.text("5. Term and Renewal", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 90);
  doc.text("This Agreement is effective as of the Effective Date and continues for the Contract Length specified above. Upon expiration, the Agreement automatically renews for successive one-year terms unless either Party provides written notice of non-renewal at least 60 days prior to the renewal date.", margin, y, { maxWidth: pageWidth - margin * 2 });
  y += 16;

  // ── Standard Terms ──
  const standardSections = [
    ["6. Acceptable Use", "Customer agrees to use the platform in compliance with all applicable laws and regulations. Unauthorized access, redistribution, or resale of platform content is prohibited."],
    ["7. Data Protection", "Provider maintains industry-standard security measures including encryption at rest and in transit, SOC 2 compliance, and GDPR/CCPA data handling procedures. Customer retains ownership of all data uploaded to the platform."],
    ["8. Confidentiality", "Both Parties agree to maintain the confidentiality of any proprietary or sensitive information shared during the course of this agreement."],
    ["9. Limitation of Liability", "Provider's total liability shall not exceed the fees paid by Customer in the twelve (12) months preceding the claim. Neither Party shall be liable for indirect or consequential damages."],
    ["10. Termination", "Either Party may terminate this Agreement for material breach with 30 days written notice. Upon termination, Provider will provide a 30-day data export window before deactivating the account."],
  ];
  for (const [title, body] of standardSections) {
    if (y > pageHeight - 40) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 40);
    doc.text(title, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 90);
    doc.text(body, margin, y, { maxWidth: pageWidth - margin * 2 });
    y += 14;
  }

  // ── Subscription Agreement ──
  if (y > pageHeight - 80) { doc.addPage(); y = 20; }
  y += 6;
  doc.setDrawColor(200, 200, 210);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 40);
  doc.text("SUBSCRIPTION AGREEMENT", margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 90);
  doc.text(`This Subscription Agreement is incorporated into and made part of the Master Service Agreement (Ref: ${quote.proposal_number}). Customer acknowledges that the configuration, pricing, and terms set forth in the associated Proposal ${quote.proposal_number} are accepted and locked as of ${today}.`, margin, y, { maxWidth: pageWidth - margin * 2 });
  y += 16;

  // ── Signature Blocks ──
  if (y > pageHeight - 70) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 40);
  doc.text("Electronic Signatures", margin, y);
  y += 10;

  // Customer signature block
  doc.setDrawColor(180, 180, 190);
  doc.line(margin, y, margin + 70, y);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 110);
  doc.text("Customer Authorized Signatory", margin, y + 5);
  doc.text(`Name: ____________________________`, margin, y + 11);
  doc.text(`Title: ____________________________`, margin, y + 16);
  doc.text(`Date: ____________________________`, margin, y + 21);

  // Provider signature block
  doc.line(pageWidth - margin - 70, y, pageWidth - margin, y);
  doc.text("EXECLEAD.AI", pageWidth - margin - 70, y + 5);
  doc.text("Authorized Representative", pageWidth - margin - 70, y + 10);
  doc.text(`Date: ${today}`, pageWidth - margin - 70, y + 16);

  y += 30;

  // Footer on every page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 160);
    doc.text("EXECLEAD.AI — Develop Executive Leaders. Not Interview Candidates.", margin, pageHeight - 8);
    doc.text(`Agreement ${quote.proposal_number} · Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  const pdfBlob = doc.output("blob");
  const file = new File([pdfBlob], `contract-${quote.proposal_number}.pdf`, { type: "application/pdf" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}