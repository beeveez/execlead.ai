// ============================================================
// EXECLEAD.AI — Marketing Claims Validator™
// ------------------------------------------------------------
// Scans public marketing copy for unsupported claims before
// publishing. Every statement is classified as:
//   - Verified            (backed by customer evidence)
//   - Vision              (forward-looking aspiration)
//   - Product Capability  (what the platform does today)
//   - Roadmap             (planned future state)
//
// Unsupported outcome claims generate a publishing warning.
// ============================================================

export const CLASSIFICATIONS = {
  VERIFIED: "verified",
  VISION: "vision",
  PRODUCT_CAPABILITY: "product_capability",
  ROADMAP: "roadmap",
};

// Language patterns that indicate compliant copy
const ALLOWED_PATTERNS = [
  "designed to",
  "built to",
  "intended to",
  "our vision is",
  "we believe",
  "enables",
  "provides",
  "supports",
  "being built",
  "being developed",
  "our goal is",
  "we are partnering",
  "we are working",
  "our focus is",
];

// Banned terms — require verified customer evidence to publish
export const BANNED_TERMS = [
  { term: "improves", category: "outcome_claim", note: "Outcome claim — requires verified customer evidence" },
  { term: "increases", category: "outcome_claim", note: "Outcome claim — requires verified customer evidence" },
  { term: "saves", category: "outcome_claim", note: "Cost/efficiency claim — requires verified customer evidence" },
  { term: "reduces", category: "outcome_claim", note: "Reduction claim — requires verified customer evidence" },
  { term: "proven", category: "verification_claim", note: "Verification claim — requires verified evidence" },
  { term: "trusted by", category: "social_proof", note: "Social proof claim — requires customer references" },
  { term: "used by", category: "social_proof", note: "Adoption claim — requires verified usage data" },
  { term: "recognized by", category: "endorsement", note: "Endorsement claim — requires verified recognition" },
  { term: "customers achieved", category: "outcome_claim", note: "Customer outcome claim — requires verified case studies" },
];

function splitSentences(text) {
  const parts = text.match(/[^.!?]+[.!?]*/g) || [];
  return parts.map((s) => s.trim()).filter((s) => s.length > 0);
}

function classifyStatement(text) {
  const lower = text.toLowerCase();

  // Check for banned terms
  const violation = BANNED_TERMS.find((b) => lower.includes(b.term));
  if (violation) {
    return {
      classification: null,
      violation,
      severity: "error",
    };
  }

  // Classify based on language patterns
  if (lower.includes("vision") || lower.includes("we believe") || lower.includes("our goal") || lower.includes("our focus")) {
    return { classification: CLASSIFICATIONS.VISION, severity: "ok" };
  }
  if (lower.includes("roadmap") || lower.includes("upcoming") || lower.includes("future") || lower.includes("will be") || lower.includes("prepare for")) {
    return { classification: CLASSIFICATIONS.ROADMAP, severity: "ok" };
  }
  // Default to Product Capability for descriptive statements
  return { classification: CLASSIFICATIONS.PRODUCT_CAPABILITY, severity: "ok" };
}

export function validateMarketingCopy(text, sectionName = "Unnamed Section") {
  const sentences = splitSentences(text);

  const findings = sentences.map((sentence, i) => ({
    index: i,
    text: sentence,
    ...classifyStatement(sentence),
  }));

  const violations = findings.filter((f) => f.severity === "error");
  const passed = findings.filter((f) => f.severity === "ok");

  return {
    sectionName,
    totalStatements: findings.length,
    violations,
    passed,
    findings,
    complianceScore:
      findings.length > 0
        ? Math.round((passed.length / findings.length) * 100)
        : 100,
  };
}

// Known marketing sections to audit at runtime
export const MARKETING_SECTIONS = [
  {
    id: "organizational_value",
    name: "Why Organizations Are Exploring EXECLEAD.AI",
    page: "Landing.jsx",
    copy: `Organizations today need more than online courses or isolated executive coaching. EXECLEAD.AI is being built as the world's first AI Executive Leadership Operating System, designed to help professionals, managers, executives, and enterprises develop leadership capability through AI coaching, executive simulations, assessments, analytics, and enterprise intelligence. During our Founding Private Beta, we are partnering with executive professionals and organizations to validate the platform, refine the experience, and prepare for General Availability.`,
  },
  {
    id: "hero",
    name: "Landing Hero",
    page: "Landing.jsx",
    copy: `Become the Executive Every Company Wants to Hire. The world's first AI Executive Leadership Operating System that helps professionals, managers, and organizations develop executive leaders through AI coaching, simulations, assessments, and enterprise intelligence. One Leadership Journey. One AI Platform.`,
  },
  {
    id: "pricing_hero",
    name: "Pricing Hero",
    page: "Pricing.jsx",
    copy: `Choose the Membership That Matches Your Leadership Journey. Whether you're an aspiring manager, an experienced executive, or an enterprise transforming leadership at scale, EXECLEAD.AI provides a membership aligned to your leadership journey.`,
  },
  {
    id: "pricing_beta",
    name: "Pricing Beta Notice",
    page: "Pricing.jsx",
    copy: `Founding Private Beta. Membership plans shown represent planned General Availability pricing. Current platform access is by application and invitation only.`,
  },
];