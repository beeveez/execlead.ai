import React, { useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useExecutiveIntelligence } from "@/hooks/useExecutiveIntelligence";
import WidgetErrorBoundary from "@/components/WidgetErrorBoundary";
import IntelligenceSummary from "@/components/intelligence/IntelligenceSummary";
import IntelligenceRadarSection from "@/components/intelligence/IntelligenceRadarSection";
import CapabilityDomains from "@/components/intelligence/CapabilityDomains";
import CompetencyIntelligence from "@/components/intelligence/CompetencyIntelligence";
import LeadershipDNARelationship from "@/components/intelligence/LeadershipDNARelationship";
import ReadinessIntegration from "@/components/intelligence/ReadinessIntegration";
import AIExecutiveInsights from "@/components/intelligence/AIExecutiveInsights";
import HistoricalIntelligence from "@/components/intelligence/HistoricalIntelligence";
import { Brain, ChevronRight, Gauge, Radar, Layers, Award, Fingerprint, Target, Sparkles, Clock } from "lucide-react";

const SECTIONS = [
  { id: "summary", label: "Summary", icon: Gauge },
  { id: "radar", label: "Radar", icon: Radar },
  { id: "domains", label: "Domains", icon: Layers },
  { id: "competencies", label: "Competencies", icon: Award },
  { id: "dna", label: "Leadership DNA", icon: Fingerprint },
  { id: "readiness", label: "Readiness", icon: Target },
  { id: "ai", label: "AI Insights", icon: Sparkles },
  { id: "historical", label: "History", icon: Clock },
];

export default function ExecutiveIntelligenceCenter() {
  const { profile, loading: loadingProfile } = useSubscription();
  const intel = useExecutiveIntelligence();

  useEffect(() => {
    base44.analytics.track({ eventName: "intelligence_center_viewed" });
  }, []);

  if (intel.loading || loadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }
  if (!profile) return <Navigate to="/onboarding" replace />;

  const scrollToSection = (id) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-white/30">
        <Link to="/dashboard" className="hover:text-white/60 transition-colors">Executive Workspace</Link>
        <ChevronRight size={12} />
        <span className="text-white/60">Executive Intelligence Center™</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest mb-2">
          <Brain size={14} /> Powered by ELIM™
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Executive Intelligence Center™</h1>
        <p className="text-white/40 text-sm">
          Understand your executive strengths. Discover your growth opportunities. Build leadership intelligence.
        </p>
      </div>

      {/* Section Navigation */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => scrollToSection(s.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-white/60 hover:text-white/90 text-xs font-medium whitespace-nowrap transition-all">
              <s.icon size={12} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections — each wrapped in an isolated error boundary */}
      <WidgetErrorBoundary name="Intelligence Summary">
        <IntelligenceSummary intel={intel} profile={profile} />
      </WidgetErrorBoundary>
      <WidgetErrorBoundary name="Intelligence Radar">
        <IntelligenceRadarSection />
      </WidgetErrorBoundary>
      <WidgetErrorBoundary name="Capability Domains">
        <CapabilityDomains domainSummary={intel.domainSummary} />
      </WidgetErrorBoundary>
      <WidgetErrorBoundary name="Competency Intelligence">
        <CompetencyIntelligence intel={intel} />
      </WidgetErrorBoundary>
      <WidgetErrorBoundary name="Leadership DNA Relationship">
        <LeadershipDNARelationship domainSummary={intel.domainSummary} />
      </WidgetErrorBoundary>
      <WidgetErrorBoundary name="Readiness Integration">
        <ReadinessIntegration domainSummary={intel.domainSummary} profile={profile} />
      </WidgetErrorBoundary>
      <WidgetErrorBoundary name="AI Executive Insights">
        <AIExecutiveInsights intel={intel} />
      </WidgetErrorBoundary>
      <WidgetErrorBoundary name="Historical Intelligence">
        <HistoricalIntelligence competencies={intel.competencies} />
      </WidgetErrorBoundary>
    </div>
  );
}