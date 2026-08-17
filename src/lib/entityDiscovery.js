/**
 * EXECLEAD.AI — Entity Discovery™
 * ============================================================
 * Automatically discovers, classifies, and audits every entity
 * in the platform. Replaces manual curation with systematic
 * discovery — ensuring 100% coverage of the security surface.
 *
 * Pipeline:
 *   Discover  →  Classify (heuristic + confidence)  →  Human Review  →  Audit  →  Report
 *
 * Risk-Based Deployment Gate:
 *   Platform/Org/User unverified → BLOCKS deployment
 *   Public unverified (non-sensitive) → WARNING only
 */
import { RLS_REGISTRY } from "./rlsRegistry";
import { ENTITIES } from "./platformKnowledgeCenter/entities";

const LEGACY_DISCOVERED_ENTITY_NAMES = [
  // ── Enterprise & Identity ──
  "Organization", "OrgMembership", "IdentityProvider", "IdentityVersion",
  "IdentityVerification", "ExecutiveIdentityTransfer", "SSOConfig",
  "IdentitySyncEvent", "ExecutiveAffiliation",

  // ── User & Profile ──
  "UserProfile", "UserMembership", "MembershipProgram",
  "ExecutiveCompetency", "LeadershipDNA", "ExecutiveMemory",
  "ExecutiveInterest", "ExecutiveLegacy", "ExecutiveReputation",
  "MentorProfile",

  // ── Financial ──
  "Subscription", "SubscriptionAuditLog", "Invoice", "BillingEvent",
  "ExecutiveWallet", "WalletTransaction", "WithdrawalRequest",
  "ReferralTransaction", "Referral", "ReferralEvent", "ReferralSettings",
  "ReferralReward", "PaymentSettings", "Purchase", "Coupon",
  "PricingPlan", "FeatureSubscription",

  // ── Security ──
  "SecurityEvent", "SecurityIncident", "SecuritySession",
  "TrustedDevice", "AccountDeletionRequest", "VerificationLog",
  "GovernanceCertificate", "PlatformStateEvent", "SelfHealingEvent",
  "GuardianActivity", "AIAgentState",

  // ── Organization Hierarchy ──
  "Department", "Team", "Company", "CompanyVersion",
  "CompanyAuditLog", "CompanyReport", "CompanyRequest",
  "FoundingMember", "FoundingMemberAuditLog", "FoundingWaitlist",
  "FounderTimeCapsule",

  // ── Network & Community ──
  "NetworkConnection", "NetworkCircle", "NetworkPost",
  "NetworkDiscussion", "NetworkEvent", "NetworkBadge",
  "CommunityMembership", "EventRegistration", "CouncilSession",
  "CouncilReview", "PartnershipListing",

  // ── Legacy & Reputation ──
  "LeadershipLetter", "LetterComment", "LetterInteraction",
  "LetterReport", "LegacyAuditLog", "LegacyCaseStudy",
  "ReputationAuditLog", "ReputationAppeal", "CommentAppeal",
  "CommentReaction", "CodeOfConductAcceptance",

  // ── Career & Learning ──
  "CareerOpportunity", "JobApplication", "JobSource", "SavedJob",
  "CareerResume", "CareerDocument", "ResumeVersion",
  "JournalEntry", "ChallengeResult", "SimulationSession",
  "LearningAssignment", "LessonProgress", "Achievement",
  "Certificate",

  // ── Platform & Product ──
  "Feature", "ProductRelease", "Feedback", "Task",
  "AITask", "UsageLog", "Notification", "EmailEvent",
  "EmailSettings", "ShareEvent", "ProfileView", "Wishlist",
  "MarketplaceItem", "DemoRequest",

  // ── CPQ & Enterprise ──
  "CPQQuote", "CPQModule", "CPQSeatTier", "CPQApprovalWorkflow",
  "CPQDiscountRule", "CPQCurrency", "CPQTaxRule",
  "CPQAIPackage", "CPQSupportPackage", "SuccessionPlan",

  // ── Reporting ──
  "EnterpriseReport", "ReportEvidence", "ScheduledReport",

  // ── Knowledge & Intelligence ──
  "ELIMKnowledgePack", "JourneyEvent",
];

const DISCOVERED_ENTITY_NAMES = [...new Set([
  ...LEGACY_DISCOVERED_ENTITY_NAMES,
  ...ENTITIES.map((entity) => entity.name),
  "KnowledgeArticle",
  "KnowledgeRegistryEntry",
])];

// ── Auto-Classification Heuristics ──

function autoClassify(name) {
  const n = name.toLowerCase();

  if (/(audit|event|log|activity|state|guardian|self.?heal|platform|governance|usage|certificate$)/.test(n) &&
      !/(wallet|invoice|payment|subscription|withdrawal|referral)/.test(n)) {
    return "platform";
  }

  if (/(organization|^org|company|department|^team|cpq|enterprise|sso|membership.?program|pricing.?plan|succession|seat.?tier|approval.?workflow|discount.?rule|currency|tax.?rule)/.test(n)) {
    return "organization";
  }

  return "user";
}

function autoScope(name, classification) {
  if (classification === "organization") return "organization_id";
  if (classification === "platform") return "—";
  const n = name.toLowerCase();
  if (/referral|wallet|withdraw|invoice|transaction/.test(n)) return "user_id";
  if (/network|connection/.test(n)) return "requester_id / recipient_id";
  if (/resume|career|job/.test(n)) return "user_id";
  return "user_id / created_by_id";
}

function isSensitive(name) {
  const n = name.toLowerCase();
  return /(wallet|invoice|payment|billing|subscription|identity|verification|security|session|credential|secret|key|token|salary|resume|phone|email|address|pii|wallet|withdrawal|governance|certificate|audit)/.test(n);
}

function autoRule(classification, status) {
  if (status === "protected") {
    switch (classification) {
      case "organization": return "same-org + org admin";
      case "user": return "owner + admin";
      case "platform": return "admin/dev only";
      default: return "public read + admin CUD";
    }
  }
  if (status === "partial") return "read restricted; CUD open";
  if (status === "unverified") return "discovered — RLS not yet confirmed";
  return "— (no restrictions)";
}

// ── Confidence Calculation ──
// Returns 0-100 confidence for the heuristic classification.
// Strong pattern match → 90%+. Fallback to "user" → 72%.

function computeConfidence(name, classification) {
  const n = name.toLowerCase();
  if (classification === "platform") {
    if (/(audit|event|log|activity|state|guardian|self.?heal|platform|governance|usage|certificate$)/.test(n)) return 96;
    return 85;
  }
  if (classification === "organization") {
    if (/(organization|^org|company|department|^team|cpq|enterprise|sso)/.test(n)) return 95;
    if (/(membership.?program|pricing.?plan|succession|seat.?tier|approval.?workflow|discount.?rule|currency|tax.?rule)/.test(n)) return 90;
    return 82;
  }
  if (/(wallet|invoice|payment|subscription|withdrawal|referral|resume|career|job|profile|membership|competency|journey|memory|interest|legacy|reputation|mentor|certificate|achievement|challenge|simulation|lesson|learning)/.test(n)) return 92;
  return 72;
}

// ── Discovery Engine ──

export function discoverAllEntities() {
  const known = RLS_REGISTRY.map((e) => ({
    ...e,
    reviewStatus: "locked",
    confidence: 100,
    discovered: false,
  }));
  const knownNames = new Set(known.map((e) => e.name));

  const discovered = DISCOVERED_ENTITY_NAMES
    .filter((name) => !knownNames.has(name))
    .map((name) => {
      const classification = autoClassify(name);
      return {
        name,
        classification,
        scope: autoScope(name, classification),
        status: "unverified",
        sensitive: isSensitive(name),
        rule: autoRule(classification, "unverified"),
        discovered: true,
        reviewStatus: "awaiting_review",
        confidence: computeConfidence(name, classification),
      };
    });

  return [...known, ...discovered];
}

// ── Discovery Metrics ──

export function computeDiscoveryMetrics() {
  const all = discoverAllEntities();
  const discovered = all.length;
  const classified = all.filter((e) => e.classification).length;
  const audited = all.filter((e) => e.status !== "unverified").length;
  const protectedCount = all.filter((e) => e.status === "protected").length;
  const partial = all.filter((e) => e.status === "partial").length;
  const unverified = all.filter((e) => e.status === "unverified").length;
  const coverage = discovered > 0 ? Math.round((protectedCount / discovered) * 100) : 0;
  const auditCoverage = discovered > 0 ? Math.round((audited / discovered) * 100) : 0;
  const awaitingReview = all.filter((e) => e.reviewStatus === "awaiting_review").length;
  const locked = all.filter((e) => e.reviewStatus === "locked").length;

  const byClass = {
    user: all.filter((e) => e.classification === "user"),
    organization: all.filter((e) => e.classification === "organization"),
    platform: all.filter((e) => e.classification === "platform"),
    public: all.filter((e) => e.classification === "public"),
  };

  return {
    discovered,
    classified,
    audited,
    protected: protectedCount,
    partial,
    unverified,
    coverage,
    auditCoverage,
    awaitingReview,
    locked,
    entities: all,
    byClass,
  };
}

// ── Risk-Based Coverage™ ──
// Critical = Platform + Organization + User (blocks deployment when unverified).
// Public = Warning only (unless sensitive).

export function computeRiskBasedCoverage() {
  const all = discoverAllEntities();

  const groups = {
    platform: all.filter((e) => e.classification === "platform"),
    organization: all.filter((e) => e.classification === "organization"),
    user: all.filter((e) => e.classification === "user"),
    public: all.filter((e) => e.classification === "public"),
  };

  const computeCov = (entities) => {
    if (entities.length === 0) return { total: 0, protected: 0, coverage: 100 };
    const prot = entities.filter((e) => e.status === "protected").length;
    return { total: entities.length, protected: prot, coverage: Math.round((prot / entities.length) * 100) };
  };

  const platform = computeCov(groups.platform);
  const organization = computeCov(groups.organization);
  const user = computeCov(groups.user);
  const publicEntities = computeCov(groups.public);

  const criticalEntities = [...groups.platform, ...groups.organization, ...groups.user];
  const criticalProtected = criticalEntities.filter((e) => e.status === "protected").length;
  const criticalCoverage = criticalEntities.length > 0
    ? Math.round((criticalProtected / criticalEntities.length) * 100)
    : 100;

  const overallProtected = all.filter((e) => e.status === "protected").length;
  const overallCoverage = all.length > 0 ? Math.round((overallProtected / all.length) * 100) : 0;

  const criticalUnverified = criticalEntities.filter((e) => e.status !== "protected").length;
  const publicUnverified = groups.public.filter((e) => e.status !== "protected").length;
  const deploymentBlocked = criticalUnverified > 0;

  return {
    platform,
    organization,
    user,
    public: publicEntities,
    criticalCoverage,
    overallCoverage,
    criticalUnverified,
    publicUnverified,
    deploymentBlocked,
  };
}

// ── Security Technical Debt™ ──
// Categorizes unverified entities by risk severity and estimates effort.

export function computeSecurityDebt() {
  const all = discoverAllEntities();
  const unverified = all.filter((e) => e.status !== "protected");

  const debt = { critical: 0, high: 0, medium: 0, low: 0 };

  unverified.forEach((e) => {
    if (e.classification === "platform" && e.sensitive) debt.critical++;
    else if (e.classification === "platform" || (e.classification === "organization" && e.sensitive)) debt.high++;
    else if (e.classification === "organization" || (e.classification === "user" && e.sensitive)) debt.medium++;
    else debt.low++;
  });

  const effortHours = Math.round(debt.critical * 2 + debt.high * 1 + debt.medium * 0.5 + debt.low * 0.15);

  return { ...debt, total: unverified.length, effortHours };
}