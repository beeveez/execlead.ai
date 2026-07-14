import React, { useState } from "react";
import { Activity, BarChart3, Bot, AlertTriangle, Rocket, Heart } from "lucide-react";
import { getTelemetryConsent, setTelemetryConsent } from "@/lib/telemetryEngine";
import ObservabilityOverview from "@/components/observability/ObservabilityOverview";
import FeatureAdoptionPanel from "@/components/observability/FeatureAdoptionPanel";
import AIUsagePanel from "@/components/observability/AIUsagePanel";
import ErrorIntelligencePanel from "@/components/observability/ErrorIntelligencePanel";
import BetaInsightsPanel from "@/components/observability/BetaInsightsPanel";
import PlatformHealthPanel from "@/components/observability/PlatformHealthPanel";

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "adoption", label: "Feature Adoption", icon: BarChart3 },
  { id: "ai", label: "AI Usage", icon: Bot },
  { id: "errors", label: "Error Intelligence", icon: AlertTriangle },
  { id: "beta", label: "Beta Insights", icon: Rocket },
  { id: "health", label: "Platform Health", icon: Heart },
];

export default function ExecObservabilityPlatform() {
  const [tab, setTab] = useState("overview");
  const [consent, setConsent] = useState(getTelemetryConsent());

  const toggleConsent = () => {
    const next = !consent;
    setTelemetryConsent(next);
    setConsent(next);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Activity size={22} className="text-indigo-400" />
              EXEC™ Observability & Telemetry Platform™
            </h1>
            <p className="text-white/40 text-sm mt-1">Every interaction produces intelligence.</p>
          </div>
          <button
            onClick={toggleConsent}
            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
              consent
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-white/5 border-white/10 text-white/40"
            }`}
          >
            {consent ? "Telemetry: ON" : "Telemetry: OFF"}
          </button>
        </div>

        <div className="flex gap-1 mb-6 border-b border-white/5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "border-indigo-400 text-indigo-400"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <ObservabilityOverview />}
        {tab === "adoption" && <FeatureAdoptionPanel />}
        {tab === "ai" && <AIUsagePanel />}
        {tab === "errors" && <ErrorIntelligencePanel />}
        {tab === "beta" && <BetaInsightsPanel />}
        {tab === "health" && <PlatformHealthPanel />}
      </div>
    </div>
  );
}