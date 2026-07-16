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
  headline: "An AI Executive Leadership Operating System™",
  tagline: "One Leadership Journey. One AI Platform.",
  secondaryTagline: "From Classroom to Boardroom.",
  description:
    "Purpose-built to help ambitious technology professionals prepare for executive leadership through AI-powered coaching, executive simulations, career intelligence, and personalized guidance.",
  descriptionShort:
    "Purpose-built to help ambitious technology professionals prepare for executive leadership.",
  positioningStatement:
    "EXECLEAD.AI is an AI Executive Leadership Operating System™, purpose-built to help ambitious technology professionals prepare for executive leadership through AI-powered coaching, executive simulations, career intelligence, and personalized guidance.",

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
    "The EXECLEAD.AI mark combines an Executive 'E' with an ascending arrow. Together, the mark symbolizes the journey from ambitious technology professional to executive leader.",
  logoMeaning: {
    e: ["Executive Leadership", "Excellence", "Execution", "Empowerment"],
    arrow: ["Leadership Growth", "Career Progression", "Continuous Learning", "Promotion", "Executive Impact"],
  },
  brandPhilosophy:
    "EXECLEAD.AI exists to help ambitious technology professionals become executive leaders. The new Executive 'E' represents excellence. The upward arrow represents continuous leadership growth. Every interaction should reinforce that journey.",

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
  favicon: "https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/f176d963a_generated_image.png?v=3.0",
  faviconImage: "https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/f176d963a_generated_image.png?v=3.0",

  // ── Open Graph / Social Images ──
  ogImage: "https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/f176d963a_generated_image.png?v=3.0",
  socialImage: "https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/f176d963a_generated_image.png?v=3.0",

  // ── Email Signature ──
  emailSignature:
    "EXECLEAD.AI\nAn AI Executive Leadership Operating System™\nhttps://execlead.ai",

  // ── Social Links ──
  social: {
    linkedin: "https://www.linkedin.com",
    twitter: "https://www.twitter.com",
  },

  // ── SEO Metadata (mirrored in index.html) ──
  seo: {
    title: "EXECLEAD.AI — An AI Executive Leadership Operating System™",
    description:
      "An AI Executive Leadership Operating System™. Purpose-built to help ambitious technology professionals prepare for executive leadership through AI-powered coaching, executive simulations, career intelligence, and personalized guidance.",
    keywords:
      "executive leadership, AI coaching, leadership development, executive simulations, career intelligence, executive operating system",
  },

  // ── Auth Subtitles ──
  auth: {
    loginSubtitle: "Continue your Executive Leadership Journey",
    registerSubtitle: "Start your executive leadership journey",
  },
};

export default BrandRegistry;