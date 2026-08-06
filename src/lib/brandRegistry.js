/**
 * Brand Registry™ — Single Source of Truth
 * =========================================
 * All EXECLEAD.AI branding lives here. Every page, component, email,
 * and metadata surface should import from this registry — never hardcode.
 *
 * STATIC FILES (index.html, public/manifest.json) mirror these values
 * manually since they cannot import JS at runtime. Keep them in sync
 * when updating this file.
 */

export const BrandRegistry = {
  // ── Core Identity ──
  brandName: "EXECLEAD.AI",
  headline: "The Executive Leadership Operating System™",
  tagline: "One Leadership Journey. One AI Platform.",
  secondaryTagline: "From Classroom to Boardroom.",
  description:
    "EXECLEAD.AI is the world's first evidence-based Executive Leadership Operating System™ — helping ambitious professionals become executive-ready leaders through AI-powered coaching, executive simulations, and an integrated Leadership Intelligence Layer™.",
  descriptionShort:
    "The world's first evidence-based Executive Leadership Operating System™.",
  positioningStatement:
    "EXECLEAD.AI is the world's first evidence-based Executive Leadership Operating System that helps ambitious professionals become executive-ready leaders. Unlike traditional coaching or simulation platforms, EXECLEAD.AI continuously measures, develops, and demonstrates executive readiness through AI-powered coaching, executive simulations, and an integrated Leadership Intelligence Layer™.",

  // ── Positioning Architecture™ (single source of truth) ──
  // One canonical positioning used across landing, about, pricing, pitch deck,
  // investor materials, enterprise sales, docs, marketing, press, and future site.
  positioning: {
    primaryStatement:
      "EXECLEAD.AI is the world's first evidence-based Executive Leadership Operating System that helps ambitious professionals become executive-ready leaders.",
    secondaryStatement:
      "Unlike traditional coaching or simulation platforms, EXECLEAD.AI continuously measures, develops, and demonstrates executive readiness through AI-powered coaching, executive simulations, and an integrated Leadership Intelligence Layer™.",
    goToMarket: {
      line1: "Starting with Technology Leadership.",
      line2: "Built to redefine executive leadership development across every industry.",
    },
    category: {
      name: "Executive Leadership Operating System™",
      definition:
        "A continuous, AI-powered platform that assesses, develops, measures, and demonstrates executive readiness through coaching, simulations, evidence, identity, outcomes, and organizational intelligence.",
    },
    differentiation: {
      traditional: ["Coach leaders", "Deliver learning", "Offer simulations", "Conduct assessments"],
      execlead: [
        "Continuously develops executive leaders",
        "Measures Executive Readiness™",
        "Builds Executive Identity™",
        "Generates verified leadership evidence",
        "Demonstrates measurable executive growth",
      ],
    },
    valueProposition: {
      primary: "Become the executive every organization wants to hire.",
      supporting:
        "EXECLEAD.AI transforms executive leadership development from periodic training into continuous organizational intelligence.",
    },
    marketPositioning: {
      today: ["Technology Leaders"],
      tomorrow: [
        "Business Leaders", "Operations Leaders", "Finance Leaders", "HR Leaders",
        "Healthcare Leaders", "Government Leaders", "Product Leaders",
      ],
    },
    messagingHierarchy: {
      l1: "Executive Leadership Operating System™",
      l2: "Evidence-Based Executive Readiness™",
      l3: "Leadership Intelligence Layer™",
      l4: [
        "AI Coaching", "Executive Simulations", "Executive Identity™",
        "Executive Outcomes™", "Executive Journey™", "Evidence Engine™",
      ],
    },
    philosophy:
      "EXECLEAD.AI is not built for one profession. It is built for one outcome — helping ambitious professionals become executive-ready leaders through continuous, evidence-based leadership development. Technology Leadership is where the journey begins. Executive Leadership is where the platform belongs. One Leadership Journey. One AI Platform. One Executive Leadership Operating System™.",
  },

  // ── Mission & Vision ──
  mission:
    "Leadership is a lifelong journey—not a single promotion. EXECLEAD.AI provides one intelligent AI platform that grows with professionals from their earliest career aspirations to executive leadership and beyond.",
  vision:
    "Our vision is to establish the AI Executive Leadership Operating System category and become one of the world's most trusted platforms for executive leadership development.",

  // ── Contact ──
  website: "https://execlead.ai",
  supportEmail: "hello@execlead.ai",

  // ── Legal ──
  copyright: "© 2026 EXECLEAD.AI. All rights reserved.",

  // ── Logo Assets ──
  logo: {
    brandName: "EXECLEAD.AI",
    parts: { prefix: "EXEC", middle: "LEAD", dot: ".", suffix: "AI" },
    markName: "Executive Mark™",
    description: "A custom Executive 'E' monogram with an integrated upward arrow.",
  },

  // ── Logo Story & Brand Philosophy ──
  logoStory:
    "The EXECLEAD.AI mark combines an Executive 'E' with an ascending arrow. Together, the mark symbolizes the journey from ambitious professional to executive-ready leader.",
  logoMeaning: {
    e: ["Executive Leadership", "Excellence", "Execution", "Empowerment"],
    arrow: ["Leadership Growth", "Career Progression", "Continuous Learning", "Promotion", "Executive Impact"],
  },
  brandPhilosophy:
    "EXECLEAD.AI exists to help ambitious professionals become executive-ready leaders. The Executive 'E' represents excellence. The upward arrow represents continuous leadership growth. Every interaction should reinforce that journey.",

  // ── Colors ──
  colors: {
    primary: "#6366f1",
    primaryLight: "#818cf8",
    primaryDark: "#4f46e5",
    gold: "#f59e0b",
    goldLight: "#fbbf24",
    goldDark: "#d97706",
    background: "#0a0a0f",
    card: "#0d0d14",
  },

  // ── Typography ──
  typography: {
    heading: "ui-sans-serif, system-ui, sans-serif",
    body: "ui-sans-serif, system-ui, sans-serif",
    display: "ui-sans-serif, system-ui, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },

  // ── Favicon ──
  favicon: "https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/c8da542d1_image.png?v=3.0",
  faviconImage: "https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/c8da542d1_image.png?v=3.0",

  // ── Open Graph / Social Images ──
  ogImage: "https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/c8da542d1_image.png?v=3.0",
  socialImage: "https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/c8da542d1_image.png?v=3.0",

  // ── Email Signature ──
  emailSignature:
    "EXECLEAD.AI\nThe Executive Leadership Operating System™\nhttps://execlead.ai",

  // ── Social Links ──
  social: {
    linkedin: "https://www.linkedin.com",
    twitter: "https://www.twitter.com",
  },

  // ── SEO Metadata (mirrored in index.html) ──
  seo: {
    title: "EXECLEAD.AI — The Executive Leadership Operating System™",
    description:
      "The world's first evidence-based Executive Leadership Operating System™. Helping ambitious professionals become executive-ready leaders through AI coaching, executive simulations, and a Leadership Intelligence Layer™.",
    keywords:
      "executive leadership platform, executive readiness, executive leadership operating system, leadership development platform, AI executive coach, executive simulations, executive career development, leadership intelligence, technology leadership",
  },

  // ── Auth Subtitles ──
  auth: {
    loginSubtitle: "Continue your Executive Leadership Journey",
    registerSubtitle: "Start your executive leadership journey",
  },
};

export default BrandRegistry;