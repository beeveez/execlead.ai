import React, { useMemo } from "react";
import { Award } from "lucide-react";
import { runCertification } from "@/lib/productionReadinessCertificationEngine";
import ReadinessHero from "@/components/production-readiness/ReadinessHero";
import DomainGrid from "@/components/production-readiness/DomainGrid";
import ReleaseGatePanel from "@/components/production-readiness/ReleaseGatePanel";
import ExecutiveReportPanel from "@/components/production-readiness/ExecutiveReportPanel";

export default function ProductionReadiness() {
  const result = useMemo(() => runCertification(), []);

  return (
    <div className="min-h-screen bg-[#08080d] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Production Readiness™</h1>
            <p className="text-sm text-white/40">
              Final certification gate — v{result.version} · {result.domains.length} domains evaluated
            </p>
          </div>
        </div>

        {/* Hero — Overall Score + Status + Recommendation */}
        <ReadinessHero result={result} />

        {/* Release Gate */}
        <ReleaseGatePanel result={result} />

        {/* Domain Grid — All 12 domains with expandable checks */}
        <DomainGrid domains={result.domains} />

        {/* Executive Report — Summary + Mitigation + Export */}
        <ExecutiveReportPanel result={result} />

        {/* Footer principle */}
        <div className="text-center py-6">
          <p className="text-xs text-white/30 max-w-2xl mx-auto leading-relaxed">
            Production readiness is not a declaration. It is a measurable certification backed by objective evidence.
            Every deployment must earn certification through automated verification, operational excellence, and
            continuous validation.
          </p>
          <p className="text-xs text-white/20 mt-2 italic">
            One Leadership Journey. One AI Platform. One Production Standard.
          </p>
        </div>
      </div>
    </div>
  );
}