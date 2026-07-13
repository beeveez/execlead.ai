import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, FileText, ShieldCheck, ClipboardCheck } from "lucide-react";

const CLAIM_CATEGORIES = [
  { id: "testimonials", label: "Customer Testimonials", desc: "Only from verified beta participants or paying customers with permission" },
  { id: "analyst", label: "Analyst Recognition", desc: "Only displayed if formally received (Gartner, Forrester, IDC, Bersin, etc.)" },
  { id: "savings", label: "Financial Savings Claims", desc: "Must be labeled as Target Outcome or Illustrative Example" },
  { id: "performance", label: "Performance Improvement Claims", desc: "Must be labeled as Product Goal or Beta Objective" },
  { id: "outcomes", label: "Measurable Business Outcomes", desc: "Must be labeled as Expected Business Outcomes or Target Outcome" },
];

const ALLOWED_CATEGORIES = [
  "Vision", "Illustrative Example", "Target Outcome",
  "Product Goal", "Beta Objective", "Future Roadmap",
];

const REPLACEMENT_SECTIONS = [
  "Founding Private Beta™", "Beta Program Overview", "Expected Business Outcomes",
  "Product Vision", "Future Analyst Engagement",
];

const PAGES = [
  { path: "/", name: "Landing Page", status: "pass", notes: "CTAs updated to beta application. Pricing labeled as Future GA." },
  { path: "/pricing", name: "Pricing Page", status: "pass", notes: "Testimonials replaced with Coming Soon. Analyst claims replaced with Future Analyst Engagement. ROI labeled as Illustrative Example." },
  { path: "/leaderboard", name: "Leaderboard", status: "review", notes: "Verify leaderboard data is real and not fabricated." },
  { path: "/company-library", name: "Company Library", status: "pass", notes: "Company data is publicly sourced." },
  { path: "/founders", name: "Founders Wall", status: "review", notes: "Verify all featured founders are real participants." },
  { path: "/beta", name: "Beta Apply", status: "pass", notes: "Application page — no unsupported claims." },
  { path: "/trust-center", name: "Trust Center", status: "review", notes: "Verify security and compliance claims match current implementation." },
  { path: "/about", name: "About", status: "review", notes: "Review for unsupported organizational claims." },
  { path: "/contact", name: "Contact", status: "pass", notes: "Contact form — no unsupported claims." },
];

const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Pass" },
  review: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Needs Review" },
  fail: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Flagged" },
};

export default function ClaimsEvidenceChecklist() {
  const passCount = PAGES.filter((p) => p.status === "pass").length;
  const reviewCount = PAGES.filter((p) => p.status === "review").length;
  const failCount = PAGES.filter((p) => p.status === "fail").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
          <ClipboardCheck size={18} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-base">Claims & Evidence Checklist</h3>
          <p className="text-white/40 text-xs">Scans all public-facing marketing pages for unsupported claims before publication</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{passCount}</div>
          <div className="text-white/40 text-[10px] uppercase tracking-wider mt-1">Pass</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{reviewCount}</div>
          <div className="text-white/40 text-[10px] uppercase tracking-wider mt-1">Needs Review</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{failCount}</div>
          <div className="text-white/40 text-[10px] uppercase tracking-wider mt-1">Flagged</div>
        </div>
      </div>

      {/* Claim Categories */}
      <div>
        <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Claim Categories Audited</h4>
        <div className="space-y-2">
          {CLAIM_CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-start gap-2.5 bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <ShieldCheck size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-white/70 text-xs font-medium">{cat.label}</span>
                <p className="text-white/30 text-[11px] mt-0.5">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allowed Replacement Categories */}
      <div>
        <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Allowed Replacement Categories</h4>
        <div className="flex flex-wrap gap-2">
          {ALLOWED_CATEGORIES.map((cat) => (
            <span key={cat} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[11px] text-indigo-300 font-medium">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Replacement Sections */}
      <div>
        <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Approved Replacement Sections</h4>
        <div className="flex flex-wrap gap-2">
          {REPLACEMENT_SECTIONS.map((sec) => (
            <span key={sec} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-300 font-medium">
              {sec}
            </span>
          ))}
        </div>
      </div>

      {/* Page-by-page audit */}
      <div>
        <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Page Audit</h4>
        <div className="space-y-2">
          {PAGES.map((page) => {
            const status = STATUS_CONFIG[page.status];
            return (
              <motion.div
                key={page.path}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex items-start gap-3 rounded-lg p-3 border ${status.border} ${status.bg}`}
              >
                <status.icon size={16} className={`${status.color} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText size={12} className="text-white/30" />
                    <span className="text-white/70 text-xs font-medium">{page.name}</span>
                    <span className="text-white/30 text-[10px]">{page.path}</span>
                    <span className={`text-[10px] font-medium ${status.color} ml-auto`}>{status.label}</span>
                  </div>
                  <p className="text-white/40 text-[11px] mt-1">{page.notes}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Release Stage Notice */}
      <div className="bg-amber-500/[0.04] border border-amber-500/15 rounded-xl p-4">
        <p className="text-amber-400/60 text-xs leading-relaxed">
          <strong className="text-amber-400">Current Release Stage:</strong> Founding Private Beta™ / Release Candidate 1 (RC1).
          Every public-facing statement must be accurate, supportable, and appropriate for this stage.
          No customer testimonials, analyst recognition, or measurable outcomes may be displayed unless verified.
        </p>
      </div>
    </div>
  );
}