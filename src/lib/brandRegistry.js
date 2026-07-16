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
  },

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
  favicon: "/favicon.svg",

  // ── Open Graph / Social Images ──
  ogImage: "/og-image.png",
  socialImage: "/og-image.png",

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