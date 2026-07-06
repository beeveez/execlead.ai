import { base44 } from "@/api/base44Client";
import { formatCPQPrice } from "@/lib/cpqEngine";

// ============================================================
// PROPOSAL PDF GENERATOR
// Generates a professional enterprise proposal PDF,
// uploads it to file storage, and returns the file URL.
// ============================================================

export async function generateProposalPDF(quote, breakdown, catalog) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("EXECLEAD.AI", 20, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(129, 140, 248);
  doc.text("Enterprise Proposal", pageWidth - 20, 25, { align: "right" });

  // Proposal info
  doc.setTextColor(40, 40, 50);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Proposal ${quote.proposal_number}`, 20, 55);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  doc.text(`Date: ${new Date(quote.created_date).toLocaleDateString()}`, 20, 63);
  doc.text(`Valid Until: ${quote.valid_until}`, 20, 70);
  doc.text(`Status: ${(quote.status || "submitted").toUpperCase()}`, 20, 77);

  // Divider
  doc.setDrawColor(230, 230, 235);
  doc.line(20, 85, pageWidth - 20, 85);

  // Organization section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 50);
  doc.text("Organization", 20, 97);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  const orgFields = [
    ["Name", quote.organization_name],
    ["Industry", quote.industry],
    ["Country", quote.country],
    ["Employees", String(quote.num_employees || "")],
    ["Active Users", String(quote.expected_active_users || "")],
    ["Timeline", quote.implementation_timeline],
    ["Email", quote.customer_email],
  ];
  let y = 105;
  orgFields.forEach(([label, value]) => {
    doc.setTextColor(150, 150, 160);
    doc.text(label + ":", 20, y);
    doc.setTextColor(60, 60, 70);
    doc.text(String(value || "—"), 70, y);
    y += 7;
  });

  // Configuration section
  y += 5;
  doc.setDrawColor(230, 230, 235);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 50);
  doc.text("Configuration", 20, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const configRows = [
    ["Seats", `${breakdown.seats} @ ${formatCPQPrice(breakdown.seatPricePerUser, quote.currency, catalog?.currencies)}/user/yr (${breakdown.seatTier})`],
    ["AI Package", breakdown.aiPackage?.name || "None"],
    ["Support", breakdown.supportPackage?.name || "None"],
    ["Contract Length", `${breakdown.contractLength} year(s)`],
    ["Currency", breakdown.currency],
  ];
  configRows.forEach(([label, value]) => {
    doc.setTextColor(150, 150, 160);
    doc.text(label + ":", 20, y);
    doc.setTextColor(60, 60, 70);
    doc.text(String(value || "—"), 70, y);
    y += 6;
  });

  // Modules & Services
  if (breakdown.selectedModules?.length > 0) {
    y += 4;
    doc.setTextColor(150, 150, 160);
    doc.text("Modules:", 20, y);
    doc.setTextColor(60, 60, 70);
    doc.text(breakdown.selectedModules.map(m => `${m.icon} ${m.name}`).join(", "), 70, y, { maxWidth: pageWidth - 90 });
    y += 8;
  }
  if (breakdown.selectedServices?.length > 0) {
    doc.setTextColor(150, 150, 160);
    doc.text("Services:", 20, y);
    doc.setTextColor(60, 60, 70);
    doc.text(breakdown.selectedServices.map(s => `${s.icon} ${s.name}`).join(", "), 70, y, { maxWidth: pageWidth - 90 });
    y += 8;
  }

  // Pricing section
  y += 5;
  doc.setDrawColor(230, 230, 235);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 50);
  doc.text("Pricing Summary", 20, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const priceRows = [
    ["Annual Recurring", formatCPQPrice(breakdown.annualRecurring, quote.currency, catalog?.currencies)],
  ];
  if (breakdown.discount.amount > 0) {
    priceRows.push(["Discount", `-${formatCPQPrice(breakdown.discount.amount, quote.currency, catalog?.currencies)}`]);
  }
  priceRows.push(["Services & Add-ons", formatCPQPrice(breakdown.servicesCost, quote.currency, catalog?.currencies)]);
  if (breakdown.tax.amount > 0) {
    priceRows.push([`Tax (${(breakdown.tax.rate * 100).toFixed(0)}% ${breakdown.tax.type})`, formatCPQPrice(breakdown.tax.amount, quote.currency, catalog?.currencies)]);
  }

  priceRows.forEach(([label, value]) => {
    doc.setTextColor(150, 150, 160);
    doc.text(label, 20, y);
    doc.setTextColor(60, 60, 70);
    doc.text(value, pageWidth - 20, y, { align: "right" });
    y += 6;
  });

  // Grand total
  y += 3;
  doc.setDrawColor(200, 200, 210);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 50);
  doc.text("Grand Total", 20, y);
  doc.setTextColor(16, 185, 129);
  doc.text(formatCPQPrice(breakdown.grandTotal, quote.currency, catalog?.currencies), pageWidth - 20, y, { align: "right" });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 160);
  doc.text("EXECLEAD.AI — Develop Executive Leaders. Not Interview Candidates.", 20, 285);
  doc.text(`Proposal ${quote.proposal_number} · Generated ${new Date().toLocaleDateString()}`, 20, 290);

  // Convert to blob and upload
  const pdfBlob = doc.output("blob");
  const file = new File([pdfBlob], `proposal-${quote.proposal_number}.pdf`, { type: "application/pdf" });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}