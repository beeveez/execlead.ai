import React from "react";
import { LineChart, GitBranch, Building2, Scale, Map } from "lucide-react";

const SECTIONS = {
  "market-trends": {
    icon: LineChart, color: "text-indigo-400",
    title: "Market Trends",
    content: "Leadership development is shifting from isolated coaching and courses toward unified, AI-native operating systems. Buyers increasingly demand measurable executive readiness, succession intelligence, and evidence-based development — not just coaching delivery. AI coaching is becoming table-stakes; differentiation is moving to executive-level outcomes, simulations, and governance.",
  },
  "product-evolution": {
    icon: GitBranch, color: "text-emerald-400",
    title: "Product Evolution",
    content: "Coaching-centric competitors are adding AI features incrementally. EXECLEAD.AI is AI-native by design: Executive Readiness™, Leadership Simulations™, Succession Planning™, Decision Intelligence™, and Executive Identity™ are core, not bolted on. Roadmap focus: deepening enterprise governance, multi-agent AI, and evidence-based identity.",
  },
  "enterprise-intelligence": {
    icon: Building2, color: "text-accent-orange",
    title: "Enterprise Intelligence",
    content: "Enterprise buyers evaluate leadership platforms on outcomes, security, and integration. EXECLEAD.AI's differentiators for enterprise: Executive ROI Calculator™, procurement-ready business cases, SSO/SCIM, enterprise dashboards, and value-based licensing — capabilities that coaching-centric competitors do not publicly document.",
  },
  "win-loss": {
    icon: Scale, color: "text-amber-400",
    title: "Win/Loss Analysis",
    content: "Wins: buyers needing executive readiness, succession, and decision intelligence choose EXECLEAD.AI. Losses (typical): buyers whose primary need is broad workforce wellbeing coaching or personal AI coaching apps. Action: qualify on scope (executive development vs. workforce coaching) early; lead with the ROI Calculator and battlecards.",
  },
  "roadmap-insights": {
    icon: Map, color: "text-indigo-400",
    title: "Roadmap Insights",
    content: "Competitive gaps to exploit: executive simulations, succession intelligence, evidence-based identity, and enterprise APIs. Maintain lead in multi-agent AI, voice coaching, and decision intelligence. Monitor competitor public announcements quarterly and update this center manually.",
  },
};

export default function IntelInsights({ section }) {
  const s = SECTIONS[section];
  if (!s) return null;
  const Icon = s.icon;
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className={s.color} />
        <h2 className="text-lg font-semibold">{s.title}</h2>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-white/65 text-sm leading-relaxed">{s.content}</p>
      </div>
      <p className="text-white/30 text-[11px] mt-3">Internal curated research. Update periodically from public sources. Not guarantees.</p>
    </div>
  );
}