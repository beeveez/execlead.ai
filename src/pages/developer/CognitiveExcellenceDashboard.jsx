import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { useExecConcierge } from "@/lib/ExecConciergeContext";
import { computeCognitiveScore, COGNITIVE_TARGETS } from "@/lib/cognitiveExcellenceEngine";
import { getPersonaAudit, getCapabilityChain } from "@/lib/knowledgeResolution";
import CognitiveScoreHero from "@/components/developer/cognitive/CognitiveScoreHero";
import CognitivePillars from "@/components/developer/cognitive/CognitivePillars";
import PersonaResolutionTable from "@/components/developer/cognitive/PersonaResolutionTable";
import CapabilityChainTable from "@/components/developer/cognitive/CapabilityChainTable";
import CognitiveBlockingIssueDrawer from "@/components/developer/cognitive/CognitiveBlockingIssueDrawer";

export default function CognitiveExcellenceDashboard() {
  const concierge = useExecConcierge();

  const runtime = useMemo(() => ({
    hasMemory: (concierge.messages?.length || 0) > 0,
    hasUserContext: !!concierge.userContext,
    personaResolved: !!concierge.workspacePersona,
    pageContextResolved: !!concierge.pageContext,
    conversationLength: concierge.messages?.length || 0,
  }), [concierge]);

  const cognitive = useMemo(() => computeCognitiveScore(runtime), [runtime]);
  const personaAudit = useMemo(() => getPersonaAudit(), []);
  const capabilityChain = useMemo(() => getCapabilityChain(), []);
  const [activePillar, setActivePillar] = useState(null);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Brain size={12} className="text-violet-400" />
          EXEC™ Cognitive Excellence™
        </div>
        <h1 className="text-2xl font-bold text-white">Cognitive Excellence Dashboard™</h1>
        <p className="text-white/40 text-sm mt-1">
          Live intelligence quality telemetry — measuring reasoning, evidence, coaching, personalization, and knowledge resolution across EXEC™.
        </p>
      </div>

      {/* Score Hero */}
      <CognitiveScoreHero
        score={cognitive.overall}
        tier={cognitive.tier}
        tierColor={cognitive.tierColor}
        metrics={cognitive.metrics}
      />

      {/* Cognitive Pillars */}
      <CognitivePillars pillars={cognitive.pillars} supportingMetrics={cognitive.supportingMetrics} onPillarClick={setActivePillar} />

      {/* Persona Resolution + Capability Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PersonaResolutionTable personas={personaAudit} />
        <CapabilityChainTable capabilities={capabilityChain} />
      </div>

      {/* Success Targets */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={14} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">Cognitive Success Targets</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COGNITIVE_TARGETS.map((target) => {
            const current = typeof target.current === "function" ? target.current(cognitive.metrics) : target.current;
            const isMet = current >= parseInt(target.target);
            return (
              <div key={target.metric} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/50">{target.metric}</span>
                  {isMet ? <CheckCircle2 size={12} className="text-emerald-400" /> : <AlertCircle size={12} className="text-amber-400" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${isMet ? "text-emerald-400" : "text-amber-400"}`}>{current}{target.unit}</span>
                  <span className="text-[10px] text-white/30">/ {target.target}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXEC™ Reasoning Framework */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="text-sm font-bold text-white mb-3">Executive Reasoning Framework™</div>
        <p className="text-[11px] text-white/40 leading-relaxed mb-4">
          Every EXEC™ response is structured to answer these executive questions. This is the reasoning quality standard.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { q: "WHY", desc: "The reasoning behind the recommendation" },
            { q: "WHAT", desc: "Evidence supporting it" },
            { q: "WHICH", desc: "Framework applied" },
            { q: "Confidence", desc: "How certain EXEC™ is" },
            { q: "Action", desc: "Recommended next step" },
            { q: "Outcome", desc: "Expected result" },
            { q: "Risks", desc: "What could go wrong" },
            { q: "Alternatives", desc: "Other options considered" },
            { q: "Next", desc: "Best follow-up action" },
            { q: "Traceability", desc: "Knowledge pack + version" },
          ].map((item) => (
            <div key={item.q} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
              <div className="text-xs font-bold text-violet-400 mb-1">{item.q}</div>
              <p className="text-[9px] text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Context Memory Status */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="text-sm font-bold text-white mb-3">Context Memory™ — Runtime Status</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ContextMetric label="Active Workspace" value={concierge.activeWorkspace || "—"} resolved={!!concierge.activeWorkspace} />
          <ContextMetric label="Persona Resolved" value={concierge.workspacePersona?.tagline || "—"} resolved={!!concierge.workspacePersona} />
          <ContextMetric label="Page Context" value={concierge.pageContext?.label || "—"} resolved={!!concierge.pageContext} />
          <ContextMetric label="User Context" value={concierge.userContext ? "Loaded" : "Pending"} resolved={!!concierge.userContext} />
        </div>
        {concierge.contextSwitchAt && (
          <div className="text-[10px] text-white/30 mt-3">
            Last context switch: {new Date(concierge.contextSwitchAt).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Blocking Issue Drawer */}
      {activePillar && (
        <CognitiveBlockingIssueDrawer pillar={activePillar} onClose={() => setActivePillar(null)} />
      )}
    </div>
  );
}

function ContextMetric({ label, value, resolved }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {resolved ? <CheckCircle2 size={11} className="text-emerald-400" /> : <AlertCircle size={11} className="text-white/30" />}
        <span className="text-[9px] text-white/30 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-white/70 truncate">{value}</p>
    </div>
  );
}