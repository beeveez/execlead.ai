import { formatCPQPrice } from "@/lib/cpqEngine";
import { createDocument } from "@/lib/pdfDocument";

// ============================================================
// PROPOSAL PDF GENERATOR
// Produces a professionally formatted enterprise proposal
// using the shared Unicode document builder.
// ============================================================

export async function generateProposalPDF(quote, breakdown, catalog) {
  const fmt = (v) => formatCPQPrice(v, quote.currency, catalog?.currencies);
  const today = new Date().toLocaleDateString();

  const pdf = await createDocument({
    title: "Enterprise Proposal",
    docNumber: quote.proposal_number,
    customer: quote.organization_name,
    version: String(quote.version_number || 1),
    effectiveDate: today,
  });

  pdf.title(`Proposal ${quote.proposal_number}`, 14)
     .paragraph(`Generated ${today}  ·  Valid until ${quote.valid_until}  ·  Status: ${(quote.status || "submitted").toUpperCase()}`)
     .divider()
     .heading("Organization")
     .kv("Name", quote.organization_name)
     .kv("Industry", quote.industry)
     .kv("Country", quote.country)
     .kv("Employees", quote.num_employees)
     .kv("Active Users", quote.expected_active_users)
     .kv("Timeline", quote.implementation_timeline)
     .kv("Email", quote.customer_email)
     .spacer(6)
     .heading("Configuration")
     .kv("Seats", `${breakdown.seats} @ ${fmt(breakdown.seatPricePerUser)}/user/yr (${breakdown.seatTier})`)
     .kv("AI Package", breakdown.aiPackage?.name || "None")
     .kv("Support", breakdown.supportPackage?.name || "None")
     .kv("Contract Length", `${breakdown.contractLength} year(s)`)
     .kv("Currency", breakdown.currency);

  if (breakdown.selectedModules?.length) {
    pdf.spacer(6).heading("Purchased Modules").bullets(breakdown.selectedModules.map((m) => m.name));
  }
  if (breakdown.selectedServices?.length) {
    pdf.spacer(6).heading("Services & Add-ons").bullets(breakdown.selectedServices.map((s) => s.name));
  }

  pdf.divider().heading("Pricing Summary");
  const priceRows = [["Annual Recurring", fmt(breakdown.annualRecurring)]];
  if (breakdown.discount.amount > 0) priceRows.push(["Discount", `-${fmt(breakdown.discount.amount)}`]);
  priceRows.push(["Services & Add-ons", fmt(breakdown.servicesCost)]);
  if (breakdown.tax.amount > 0) priceRows.push([`Tax (${(breakdown.tax.rate * 100).toFixed(0)}% ${breakdown.tax.type})`, fmt(breakdown.tax.amount)]);
  pdf.table(["Line Item", "Amount"], priceRows);

  pdf.total("Grand Total", fmt(breakdown.grandTotal));

  return pdf.upload(`proposal-${quote.proposal_number}.pdf`);
}