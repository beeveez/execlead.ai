import { formatCPQPrice } from "@/lib/cpqEngine";
import { createDocument } from "@/lib/pdfDocument";

// ============================================================
// CONTRACT PDF GENERATOR
// Produces a Master Service Agreement + Subscription Agreement
// using the shared Unicode document builder.
// ============================================================

export async function generateContractPDF(quote, breakdown, catalog) {
  const fmt = (v) => formatCPQPrice(v, quote.currency, catalog?.currencies);
  const today = new Date().toLocaleDateString();

  const pdf = await createDocument({
    title: "Master Service Agreement",
    docNumber: quote.proposal_number,
    customer: quote.organization_name,
    version: String(quote.version_number || 1),
    effectiveDate: today,
  });

  pdf.title("MASTER SERVICE AGREEMENT", 16)
     .paragraph(`Agreement Reference: ${quote.proposal_number}`)
     .paragraph(`Effective Date: ${today}`)
     .spacer(8)
     .heading("1. Parties")
     .paragraph(`This Master Service Agreement ("Agreement") is entered into by and between EXECLEAD.AI ("Provider"), a product of Meridian Wellspring Holdings Pte. Ltd. (Singapore), and ${quote.organization_name} ("Customer"), collectively the "Parties."`)
     .paragraph(`Provider: EXECLEAD.AI, operated by Meridian Wellspring Holdings Pte. Ltd., a company registered in Singapore.`)
     .paragraph(`Customer: ${quote.organization_name}, located in ${quote.country}, industry: ${quote.industry}.`)
     .spacer(6)
     .heading("2. Services")
     .paragraph("Provider grants Customer access to the EXECLEAD.AI Enterprise platform, including executive coaching, leadership simulation, career intelligence, and analytics modules as specified in the Subscription Agreement below.")
     .paragraph("The platform is provided as a hosted software-as-a-service (SaaS) solution accessible via web browser and mobile applications.")
     .spacer(6)
     .heading("3. Subscription Terms");

  const subRows = [
    ["Contract Length", `${quote.contract_length_years || 1} Year`],
    ["Seats", String(breakdown?.seats || quote.expected_active_users || 0)],
    ["Support", breakdown?.supportPackage?.name || "Standard"],
    ["AI Package", breakdown?.aiPackage?.name || "Standard"],
    ["Annual Recurring Revenue", fmt(breakdown?.annualRecurring || quote.annual_value)],
  ];
  pdf.table(["Property", "Value"], subRows, { labelWidth: 230 });

  if (breakdown?.selectedModules?.length) {
    pdf.spacer(6).heading("Purchased Modules").bullets(breakdown.selectedModules.map((m) => m.name));
  }

  pdf.spacer(6).heading("4. Fees and Payment");
  const feeRows = [["Annual Recurring Revenue", fmt(breakdown?.annualRecurring || quote.annual_value)]];
  if (breakdown?.discount?.amount > 0) feeRows.push(["Discount", `-${fmt(breakdown.discount.amount)}`]);
  feeRows.push(["Services & Add-ons", fmt(breakdown?.servicesCost || 0)]);
  if (breakdown?.tax?.amount > 0) feeRows.push([`Tax (${(breakdown.tax.rate * 100).toFixed(0)}% ${breakdown.tax.type})`, fmt(breakdown.tax.amount)]);
  pdf.table(["Line Item", "Amount"], feeRows, { labelWidth: 230 });
  pdf.total("Grand Total", fmt(quote.grand_total || breakdown?.grandTotal || 0));

  pdf.spacer(8)
     .heading("5. Term and Renewal")
     .paragraph("This Agreement is effective as of the Effective Date and continues for the Contract Length specified above. Upon expiration, the Agreement automatically renews for successive one-year terms unless either Party provides written notice of non-renewal at least 60 days prior to the renewal date.")
     .spacer(6);

  const standardSections = [
    ["6. Acceptable Use", "Customer agrees to use the platform in compliance with all applicable laws and regulations. Unauthorized access, redistribution, or resale of platform content is prohibited."],
    ["7. Data Protection", "Provider maintains industry-standard security measures including encryption at rest and in transit, SOC 2 compliance, and GDPR/CCPA data handling procedures. Customer retains ownership of all data uploaded to the platform."],
    ["8. Confidentiality", "Both Parties agree to maintain the confidentiality of any proprietary or sensitive information shared during the course of this agreement."],
    ["9. Limitation of Liability", "Provider's total liability shall not exceed the fees paid by Customer in the twelve (12) months preceding the claim. Neither Party shall be liable for indirect or consequential damages."],
    ["10. Termination", "Either Party may terminate this Agreement for material breach with 30 days written notice. Upon termination, Provider will provide a 30-day data export window before deactivating the account."],
  ];
  standardSections.forEach(([secTitle, secBody]) => {
    pdf.heading(secTitle).paragraph(secBody).spacer(4);
  });

  pdf.divider()
     .title("SUBSCRIPTION AGREEMENT", 14)
     .paragraph(`This Subscription Agreement is incorporated into and made part of the Master Service Agreement (Ref: ${quote.proposal_number}). Customer acknowledges that the configuration, pricing, and terms set forth in the associated Proposal ${quote.proposal_number} are accepted and locked as of ${today}.`)
     .spacer(8)
     .heading("Electronic Signatures")
     .signatures(
       "Customer Authorized Signatory",
       "EXECLEAD.AI",
       [
         `Name: ${quote.signature_name || "____________________"}`,
         `Title: ${quote.signature_title || "____________________"}`,
         "Date: ____________________",
       ],
       ["Authorized Representative", `Date: ${today}`]
     );

  return pdf.upload(`contract-${quote.proposal_number}.pdf`);
}