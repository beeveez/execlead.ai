/**
 * Company Intelligence Library
 * Legal Compliance & Trademark Safeguards
 * Version 1.0
 *
 * Single source of truth for all legal disclaimers, profile statuses,
 * source attributions, content restrictions, and takedown workflows.
 */

export const LEGAL_META = {
  version: "1.0",
  title: "Legal Compliance & Trademark Safeguards",
  mission:
    "Ensure the Company Intelligence Library complies with intellectual property, trademark, copyright, and fair-use principles while delivering valuable executive intelligence. EXECLEAD.AI is an independent executive leadership platform and does not represent or imply endorsement by any organization listed.",
};

// ============================================================
// PLATFORM LEGAL STATUS
// EXECLEAD.AI is currently independently developed and not yet
// incorporated under a parent entity. Update this block when the
// business is formally incorporated (set ownershipLine, parent, etc).
// ============================================================
export const LEGAL_STATUS = {
  copyright: "© 2026 EXECLEAD.AI. All rights reserved.",
  description:
    "EXECLEAD.AI is an independently developed AI platform focused on executive leadership intelligence.",
  trademark:
    "Company names, logos, and trademarks are the property of their respective owners.",
  // When formally incorporated, set this to e.g.
  // "EXECLEAD.AI is a product of [Entity Name] ([Jurisdiction])."
  ownershipLine: null,
};

export const COMPANY_ENTITY = {
  product: "EXECLEAD.AI",
  // Parent company not yet incorporated. Update when formally established.
  parent: null,
  parentCountry: null,
  registeredAs: null,
};

export const GLOBAL_DISCLAIMER = {
  compact:
    "EXECLEAD.AI provides independent executive research and analysis. Company names, trademarks, logos, and brands are the property of their respective owners. EXECLEAD.AI is not affiliated with, sponsored by, or endorsed by any company listed unless explicitly stated.",
  full: [
    "EXECLEAD.AI provides independent executive research, leadership analysis, interview preparation, and educational content.",
    "Company names, trademarks, logos, and brands are the property of their respective owners.",
    "EXECLEAD.AI is not affiliated with, sponsored by, endorsed by, or representing any company listed unless explicitly stated.",
    "Company profiles are compiled from publicly available information together with EXECLEAD.AI's proprietary executive analysis.",
  ],
};

export const EXPORT_DISCLAIMER = [
  "This report contains independent executive analysis produced by EXECLEAD.AI.",
  "Company names and trademarks belong to their respective owners.",
  "EXECLEAD.AI is an independent leadership development platform and does not claim affiliation with organizations referenced in this report unless explicitly stated.",
];

// ============================================================
// DATA TRANSPARENCY FRAMEWORK — Version 1.0
// Comprehensive notices for the Company Intelligence Library
// ============================================================

export const PUBLIC_DATA_SOURCES = [
  "Official company websites",
  "Annual reports",
  "Investor presentations",
  "Regulatory filings",
  "Sustainability reports",
  "Public press releases",
  "Executive interviews",
  "Public job postings",
  "Industry publications",
  "Technology documentation",
  "Publicly available research",
];

export const INTENDED_USES = [
  "Executive learning",
  "Leadership development",
  "Career preparation",
  "Interview preparation",
  "Professional research",
  "Educational purposes",
];

export const NO_AFFILIATION_ITEMS = [
  "Partnership",
  "Sponsorship",
  "Endorsement",
  "Certification",
  "Official representation",
  "Business relationship",
];

export const COMPANY_TRADEMARK_NOTICE =
  "All company names, product names, trademarks, service marks, and logos remain the property of their respective owners. Their appearance on EXECLEAD.AI is for identification, educational, commentary, research, and informational purposes only.";

export const AI_GENERATED_CONTENT_NOTICE =
  "Some executive insights, summaries, recommendations, leadership analyses, and interview guidance are generated or enhanced using artificial intelligence based on publicly available information. Users should independently verify critical information before making business, legal, investment, or employment decisions.";

export const PRIVACY_RESTRICTIONS = [
  "Confidential information",
  "Trade secrets",
  "Private employee information",
  "Personally identifiable information",
  "Internal-only documents",
  "Leaked information",
  "Restricted corporate materials",
];

export const DATA_TRANSPARENCY_SECTIONS = [
  {
    id: "data-sources",
    title: "Where Information Comes From",
    icon: "Database",
    content:
      "EXECLEAD.AI compiles company intelligence from publicly available information and AI-assisted analysis. Sources include official company websites, annual reports, investor presentations, regulatory filings, sustainability reports, public press releases, executive interviews, public job postings, industry publications, technology documentation, and publicly available research. EXECLEAD.AI does not claim access to confidential, proprietary, or non-public business information unless explicitly stated.",
  },
  {
    id: "ai-insights",
    title: "How AI Generates Insights",
    icon: "Sparkles",
    content:
      "Some executive insights, summaries, recommendations, leadership analyses, and interview guidance are generated or enhanced using artificial intelligence based on publicly available information. AI models analyze public data to produce proprietary executive intelligence — including leadership culture assessments, interview style analysis, and career path recommendations. Users should independently verify critical information before making business, legal, investment, or employment decisions.",
  },
  {
    id: "request-corrections",
    title: "How to Request Corrections",
    icon: "Flag",
    content:
      "Organizations and individuals may request factual corrections, report outdated information, request logo removal, report trademark concerns, submit verification, or contact our compliance team. Every request generates an audit record and is reviewed by the EXECLEAD.AI compliance team. Use the 'Report / Request Update' button on any company profile, or track existing requests from the Request Tracking page.",
  },
  {
    id: "data-maintenance",
    title: "How Data Is Maintained",
    icon: "RefreshCw",
    content:
      "Company profiles are regularly reviewed and updated using publicly available sources. Each profile displays a data quality badge showing its confidence score, last updated date, and source verification status. Profiles can be enriched with additional public data and are versioned to maintain an audit trail of changes. Only legally and publicly available information is published — confidential, proprietary, or non-public information is never included.",
  },
];

export const PROFILE_STATUSES = [
  { id: "independent", label: "Independent Profile", desc: "Compiled from public sources with EXECLEAD.AI proprietary analysis", color: "slate", icon: "FileText" },
  { id: "verified", label: "Verified Organization", desc: "Organization has claimed and verified this profile", color: "emerald", icon: "BadgeCheck" },
  { id: "official_partner", label: "Official Partner", desc: "Official partner organization with verified information", color: "blue", icon: "Handshake" },
  { id: "strategic_partner", label: "Strategic Partner", desc: "Strategic partner with co-developed intelligence", color: "violet", icon: "Star" },
];

export function getProfileStatus(status) {
  return PROFILE_STATUSES.find(s => s.id === status) || PROFILE_STATUSES[0];
}

/** Logo can only be shown for claimed/verified profiles. */
export function canShowLogo(company) {
  if (!company?.logo_url) return false;
  return ["verified", "official_partner", "strategic_partner"].includes(company.profile_status);
}

export const PUBLIC_INFO_FIELDS = [
  { key: "industry", label: "Industry" },
  { key: "headquarters", label: "Headquarters" },
  { key: "country", label: "Country" },
  { key: "founded", label: "Founded" },
  { key: "employee_count", label: "Employees" },
  { key: "revenue", label: "Revenue" },
  { key: "ceo", label: "CEO" },
  { key: "stock_symbol", label: "Stock Symbol" },
  { key: "market_cap", label: "Market Capitalization" },
  { key: "countries_count", label: "Countries" },
  { key: "company_type", label: "Company Type" },
  { key: "official_website", label: "Public Website" },
];

export const ANALYSIS_DIMENSIONS = [
  "Leadership Culture", "Executive Expectations", "Interview Insights", "Leadership Competencies",
  "Digital Transformation Maturity", "AI Adoption", "Cloud Strategy", "Innovation Score",
  "Executive Readiness", "Career Opportunities", "Promotion Culture", "Decision-Making Style",
  "Risk Profile", "Organizational Complexity", "Executive Communication Style", "Board Expectations",
];

export const SOURCE_TYPES = [
  "Official company websites",
  "Annual reports",
  "Investor presentations",
  "Regulatory filings",
  "Sustainability reports",
  "Public press releases",
  "Executive interviews",
  "Public job postings",
  "Industry publications",
  "Technology documentation",
  "Publicly available research",
  "Government Registry",
  "LinkedIn Company Page",
];

export const CONTENT_RESTRICTIONS = [
  "Confidential information",
  "Trade secrets",
  "Private employee information",
  "Personally identifiable information (PII)",
  "Internal-only documents",
  "Leaked information",
  "Restricted corporate materials",
  "Internal documents",
  "Confidential presentations",
  "Leaked interview questions",
  "Copyrighted training manuals",
  "Internal strategy documents",
  "Private salary databases",
  "Confidential customer information",
];

export const REPORT_TYPES = [
  { id: "factual_correction", label: "Request Factual Correction", desc: "Report information that is factually inaccurate" },
  { id: "outdated_info", label: "Report Outdated Information", desc: "Report information that is no longer current" },
  { id: "logo_removal", label: "Request Logo Removal", desc: "Request removal of a logo or brand asset" },
  { id: "verification_request", label: "Submit Verification", desc: "Verify organizational identity to claim this profile" },
  { id: "copyright_concern", label: "Report Copyright Concern", desc: "Report potential copyright or IP infringement" },
  { id: "trademark_concern", label: "Report Trademark Concern", desc: "Report improper use of a trademark or brand asset" },
  { id: "contact_compliance", label: "Contact Compliance", desc: "Reach the compliance team regarding this profile" },
  { id: "other", label: "Other", desc: "Other inquiry or request" },
];

export const COMPARE_DIMENSIONS_NOTE =
  "Comparison data reflects EXECLEAD.AI's proprietary executive intelligence — not copyrighted company documentation.";

export const ENTERPRISE_POSITIONING = {
  avoid: ["Official Company Guide", "Official Leadership Profile", "Official Interview Questions"],
  use: ["EXECLEAD Executive Intelligence", "Independent Leadership Analysis", "Executive Readiness Profile", "Company Intelligence", "Leadership Insights"],
};

export const FOOTER_LINKS = [
  { label: "Legal Notice", section: "legal-notice" },
  { label: "Trademark Notice", section: "trademark-notice" },
  { label: "Copyright Policy", section: "copyright-policy" },
  { label: "DMCA Policy", section: "dmca-policy" },
  { label: "Fair Use Statement", section: "fair-use" },
  { label: "Privacy Policy", section: "privacy-policy" },
  { label: "Terms of Service", section: "terms-of-service" },
  { label: "Report Incorrect Information", section: "report" },
  { label: "Claim Company Profile", section: "claim" },
];

export const LEGAL_SECTIONS = {
  "legal-notice": {
    title: "Legal Notice",
    icon: "FileText",
    content: `EXECLEAD.AI is an independently developed AI platform focused on executive leadership intelligence. The platform provides independent executive research, leadership analysis, interview preparation, and educational content.

EXECLEAD.AI does not represent or imply endorsement by any organization listed in the Company Intelligence Library. All company names, trademarks, logos, and brands referenced on this platform are the property of their respective owners.

Company profiles are compiled from publicly available information together with EXECLEAD.AI's proprietary executive analysis. EXECLEAD.AI is not affiliated with, sponsored by, endorsed by, or representing any company listed unless explicitly stated through a Verified Organization or Official Partner badge.`,
  },
  "trademark-notice": {
    title: "Trademark Notice",
    icon: "Trademark",
    content: `All trademarks, service marks, trade names, and logos referenced on EXECLEAD.AI are the property of their respective owners. References to any company, product, or service do not constitute or imply endorsement, sponsorship, or affiliation.

The following are trademarks of EXECLEAD.AI:

• EXECLEAD.AI™
• Executive Council™
• Truth Engine™
• Leadership DNA™
• Resume Intelligence™
• Executive Identity™
• Promotion Readiness™
• Organization Intelligence™
• Marketplace™
• Executive Academy™
• Document Generator™
• Executive Career Graph™
• FORTRESS™ Security Architecture

Unauthorized use of any EXECLEAD.AI trademark is strictly prohibited.`,
  },
  "copyright-policy": {
    title: "Copyright Policy",
    icon: "Copyright",
    content: `EXECLEAD.AI respects the intellectual property rights of others.

Company profiles on this platform are compiled from publicly available factual information (company name, industry, headquarters, employee count, revenue, CEO, stock symbol, etc.) combined with EXECLEAD.AI's proprietary executive analysis.

We do not reproduce:
• Internal documents
• Confidential presentations
• Copyrighted training manuals
• Internal strategy documents
• Leaked interview questions
• Private employee information
• Trade secrets
• Private salary databases
• Confidential customer information

All original analysis, commentary, and educational content produced by EXECLEAD.AI is protected by copyright. The platform provides value through original insights and AI-generated executive intelligence — not by reproducing proprietary company materials.`,
  },
  "dmca-policy": {
    title: "DMCA Policy",
    icon: "Shield",
    content: `EXECLEAD.AI complies with the Digital Millennium Copyright Act (DMCA).

If you believe that content on this platform infringes your copyright, please submit a DMCA takedown notice including:

1. Identification of the copyrighted work you claim has been infringed
2. Identification of the allegedly infringing material on EXECLEAD.AI
3. Your full name, address, telephone number, and email address
4. A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner
5. A statement under penalty of perjury that the information in your notice is accurate and that you are authorized to act on behalf of the copyright owner
6. Your physical or electronic signature

All takedown requests generate an audit record for review. Submit DMCA notices through the Report Incorrect Information workflow on the relevant company profile or contact EXECLEAD.AI support.`,
  },
  "fair-use": {
    title: "Fair Use Statement",
    icon: "Scale",
    content: `EXECLEAD.AI's Company Intelligence Library is built on fair use principles.

Company profiles reference publicly available factual information — such as company name, industry, headquarters, employee count, revenue, and CEO — and combine it with original executive analysis, commentary, and educational content produced by EXECLEAD.AI.

This constitutes fair use under copyright law because it:
• Transforms factual data into original analytical content
• Serves educational and leadership development purposes
• Does not reproduce copyrighted company materials
• Does not substitute for the original company's products or services
• Provides commentary, criticism, and news reporting

EXECLEAD.AI adds substantial original value through proprietary executive intelligence that does not exist in the source materials.`,
  },
  "privacy-policy": {
    title: "Privacy Policy",
    icon: "Lock",
    content: `EXECLEAD.AI protects user data through the FORTRESS™ Security Architecture:

• Encryption at rest (AES-256) and in transit (TLS 1.3)
• Multi-tenant isolation — every organization's data is logically separated
• Role-based access control with least-privilege principles
• Continuous audit logging of all user and system actions

Personal data, resume files, generated reports, marketplace purchases, invoices, contracts, and organizational data are encrypted and never shared with third parties.

Users control their privacy settings and may configure profile visibility (public, private, recruiter-visible). Users may request data deletion at any time.

For full security details, visit the Security Center within the platform.`,
  },
  "terms-of-service": {
    title: "Terms of Service",
    icon: "FileSignature",
    content: `By using EXECLEAD.AI, you agree to the following terms:

Acceptable Use
• Use the platform for lawful purposes only
• Do not attempt to access proprietary AI logic, system prompts, or internal algorithms
• Do not redistribute or resell content without authorization
• Respect the intellectual property rights of organizations referenced on the platform
• Provide accurate and truthful information in your profile and interactions

Intellectual Property
• Company intelligence profiles are provided for your personal executive development
• EXECLEAD.AI's proprietary analysis, algorithms, and content remain the property of EXECLEAD.AI
• Company names and trademarks belong to their respective owners

Account Security
• You are responsible for maintaining the security of your account
• Do not share credentials or enable unauthorized access
• Report any suspected security breach immediately

Disclaimers
• The platform is provided "as is" without warranties of any kind
• Executive analysis is opinion-based and should not be the sole basis for career decisions
• EXECLEAD.AI is not affiliated with referenced organizations unless explicitly stated

EXECLEAD.AI reserves the right to modify or discontinue features, terminate accounts for violations, and update these terms at any time.`,
  },
};