import React, { useMemo, useState } from "react";
import { computeFoundationVerification } from "@/lib/foundationVerificationEngine";
import {
  CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Gauge,
  Activity, Brain, Network, Search, Database, Settings, Zap,
  RefreshCw, Building2, Layers, Boxes, Rocket,
  ChevronDown, ChevronRight,
} from "lucide-react";

export default function FoundationVerificationCenter() {
  const report = useMemo(() => computeFoundationVerification(), []);
  const [expandedPhase, setExpandedPhase] = useState(null);

  const renderScoreCard = (label, value, Icon, color) => {
    const ringColor = value === 100 ? "#10b981" : value >= 75 ? "#f59e0b" : "#ef4444";
    const text = value === 100 ? "text-emerald-400" : value >= 75 ? "text-amber-400" : "text-red-400";
    return (
      <div key={label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-4">
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <circle cx="28" cy="28" r="23" fill="none" stroke={ringColor} strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 23 * (value / 100)} ${2 * Math.PI * 23}`}
              strokeLinecap="round" transform="rotate(-90 28 28)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon size={16} className={text} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
          <div className={`text-xl font-bold ${text}`}>{value}%</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Foundation Status Banner */}
      <div className={`flex items-center gap-4 p-5 rounded-xl border ${
        report.allGatesPassed
          ? "bg-emerald-500/5 border-emerald-500/10"
          : "bg-amber-500/5 border-amber-500/10"
      }`}>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
          report.allGatesPassed ? "bg-emerald-500/10" : "bg-amber-500/10"
        }`}>
          <ShieldCheck size={24} className={report.allGatesPassed ? "text-emerald-400" : "text-amber-400"} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white">Foundation Verification Center™</h3>
          <p className="text-white/40 text-xs mt-0.5">
            {report.allGatesPassed
              ? "All foundation verification gates passed. Platform is ready for Sprint 2."
              : `${report.issueCounts.critical} critical · ${report.issueCounts.high} high · ${report.issueCounts.medium} medium issues remaining`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Foundation Score</div>
          <div className={`text-3xl font-bold ${report.allGatesPassed ? "text-emerald-400" : "text-amber-400"}`}>
            {report.scores.foundationScore}%
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {renderScoreCard("Architecture Health", report.scores.architectureHealth, Boxes, "indigo")}
        {renderScoreCard("Runtime Consistency", report.scores.runtimeConsistency, Activity, "cyan")}
        {renderScoreCard("Knowledge Resolution", report.scores.knowledgeResolution, Brain, "violet")}
        {renderScoreCard("Platform Discoverability", report.scores.platformDiscoverability, Search, "blue")}
        {renderScoreCard("Metadata Coverage", report.scores.metadataCoverage, Database, "purple")}
        {renderScoreCard("Config Consistency", report.scores.configurationConsistency, Settings, "amber")}
        {renderScoreCard("Event Bus Health", report.scores.eventBusHealth, Zap, "yellow")}
        {renderScoreCard("Self-Healing Validation", report.scores.selfHealingValidation, RefreshCw, "teal")}
        {renderScoreCard("Enterprise Readiness", report.scores.enterpriseReadiness, Building2, "emerald")}
        {renderScoreCard("Overall Platform Score", report.scores.overallPlatformScore, Gauge, "pink")}
      </div>

      {/* Phase Sections */}
      <PhaseSection number={1} title="Platform Architecture Audit" Icon={Boxes}
        pct={report.phase1.healthPct}
        expanded={expandedPhase === 1}
        onToggle={() => setExpandedPhase(expandedPhase === 1 ? null : 1)}>
        <div className="space-y-2">
          {report.phase1.services.map((svc) => (
            <div key={svc.serviceId} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <StatusDot status={svc.health} />
                <span className="text-white font-medium text-sm flex-1">{svc.name}</span>
                <span className="text-[10px] text-white/30">v{svc.version}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${
                  svc.health === "healthy" ? "bg-emerald-500/10 text-emerald-400" :
                  svc.health === "warning" ? "bg-amber-500/10 text-amber-400" :
                  "bg-red-500/10 text-red-400"
                }`}>{svc.runtimeStatus}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                <MetaItem label="Platform State" value={svc.platformStateIntegration} />
                <MetaItem label="Knowledge Pack" value={svc.knowledgePackIntegration} />
                <MetaItem label="Manifest" value={svc.manifestRegistration} />
                <MetaItem label="Config Source" value="Unified" />
                <MetaItem label="Warnings" value={svc.warnings} />
                <MetaItem label="Errors" value={svc.errors} />
                <MetaItem label="Dependencies" value={svc.dependencies.length} />
                <MetaItem label="Consumers" value={svc.consumers.length} />
              </div>
              {svc.errors > 0 && (
                <div className="mt-2 flex items-start gap-2 text-[10px] text-amber-400">
                  <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />
                  <span>{svc.suggestedRepairs}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </PhaseSection>

      <PhaseSection number={2} title="Runtime Consistency Audit" Icon={Activity}
        pct={report.phase2.consistencyPct}
        expanded={expandedPhase === 2}
        onToggle={() => setExpandedPhase(expandedPhase === 2 ? null : 2)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {report.phase2.components.map((comp) => (
            <div key={comp.name} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-3">
              <StatusDot status={comp.platformStateIntegration ? "healthy" : "critical"} />
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium">{comp.name}</div>
                <div className="text-white/30 text-[10px]">{comp.source}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded ${
                comp.status === "Direct Consumer" ? "bg-emerald-500/10 text-emerald-400" :
                comp.status === "Indirect Consumer" ? "bg-amber-500/10 text-amber-400" :
                "bg-red-500/10 text-red-400"
              }`}>{comp.status}</span>
            </div>
          ))}
        </div>
      </PhaseSection>

      <PhaseSection number={3} title="Knowledge Resolution Verification" Icon={Brain}
        pct={report.phase3.resolutionPct}
        expanded={expandedPhase === 3}
        onToggle={() => setExpandedPhase(expandedPhase === 3 ? null : 3)}>
        <div className="space-y-2">
          <div className="flex items-center gap-4 px-3 py-2 bg-white/[0.02] rounded-lg text-xs">
            <span className="text-white/40">Fallback Count: <span className={report.phase3.fallbackCount > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{report.phase3.fallbackCount}</span></span>
            <span className="text-white/40">Broken Chains: <span className={report.phase3.brokenChainCount > 0 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>{report.phase3.brokenChainCount}</span></span>
          </div>
          {report.phase3.personas.map((p) => (
            <div key={p.name} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-3">
              <StatusDot status={p.fallback ? "critical" : "healthy"} />
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium">{p.name}</div>
                <div className="text-white/30 text-[10px]">Resolver: {p.resolver} · Packs: {p.packNames?.length || 0}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded ${p.fallback ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>{p.resolution}</span>
            </div>
          ))}
        </div>
      </PhaseSection>

      <PhaseSection number={4} title="Route Discoverability Test" Icon={Search}
        pct={report.phase4.discoverabilityPct}
        expanded={expandedPhase === 4}
        onToggle={() => setExpandedPhase(expandedPhase === 4 ? null : 4)}>
        <RouteModuleList items={report.phase4.routes} failing={report.phase4.failingRoutes} nameKey="name" urlKey="url" />
      </PhaseSection>

      <PhaseSection number={5} title="Module Discoverability Test" Icon={Layers}
        pct={report.phase5.discoverabilityPct}
        expanded={expandedPhase === 5}
        onToggle={() => setExpandedPhase(expandedPhase === 5 ? null : 5)}>
        <RouteModuleList items={report.phase5.modules} failing={report.phase5.failingModules} nameKey="moduleName" urlKey="moduleId" />
      </PhaseSection>

      <PhaseSection number={6} title="AI Persona Verification" Icon={Network}
        pct={report.phase6.verificationPct}
        expanded={expandedPhase === 6}
        onToggle={() => setExpandedPhase(expandedPhase === 6 ? null : 6)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {report.phase6.personas.map((p) => (
            <div key={p.name} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <StatusDot status={p.passed ? "healthy" : "critical"} />
                <span className="text-white text-xs font-medium flex-1">{p.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${p.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{p.resolution}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[9px]">
                <CheckItem label="KP" passed={p.checks.knowledgePack} />
                <CheckItem label="Caps" passed={p.checks.capabilities} />
                <CheckItem label="FW" passed={p.checks.frameworks} />
                <CheckItem label="WS" passed={p.checks.workspace} />
                <CheckItem label="Ctx" passed={p.checks.contextAwareness} />
                <CheckItem label="No FB" passed={p.checks.noFallback} />
              </div>
            </div>
          ))}
        </div>
      </PhaseSection>

      <PhaseSection number={7} title="Configuration Consistency" Icon={Settings}
        pct={report.phase7.consistencyPct}
        expanded={expandedPhase === 7}
        onToggle={() => setExpandedPhase(expandedPhase === 7 ? null : 7)}>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 size={14} className={report.phase7.consolidated ? "text-emerald-400" : "text-red-400"} />
            <span className="text-white/80 text-sm font-medium">Config Version: {report.phase7.configVersion}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded ml-auto ${report.phase7.consolidated ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {report.phase7.consolidated ? "Consolidated" : "Mismatch"}
            </span>
          </div>
          <p className="text-[11px] text-white/40">{report.phase7.source}</p>
          <div className="mt-2 text-[10px] text-white/30">
            Unknown Configs: <span className={report.phase7.unknownConfigurations === 0 ? "text-emerald-400" : "text-red-400"}>{report.phase7.unknownConfigurations}</span>
          </div>
        </div>
      </PhaseSection>

      <PhaseSection number={8} title="Event Bus Verification" Icon={Zap}
        pct={report.phase8.healthPct}
        expanded={expandedPhase === 8}
        onToggle={() => setExpandedPhase(expandedPhase === 8 ? null : 8)}>
        <div className="space-y-2">
          <div className="flex items-center gap-4 px-3 py-2 bg-white/[0.02] rounded-lg text-xs">
            <span className="text-white/40">Subscribers: <span className="text-white/80 font-bold">{report.phase8.totalSubscribers}</span></span>
            <span className="text-white/40">Broadcasts: <span className="text-white/80 font-bold">{report.phase8.totalBroadcasts}</span></span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {report.phase8.events.map((evt) => (
              <div key={evt.name} className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center gap-2">
                <StatusDot status={evt.registered ? "healthy" : "critical"} />
                <span className="text-white/70 text-xs font-mono flex-1 truncate">{evt.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${evt.registered ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {evt.registered ? "Registered" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PhaseSection>

      <PhaseSection number={9} title="Self-Healing Validation" Icon={RefreshCw}
        pct={report.phase9.validationPct}
        expanded={expandedPhase === 9}
        onToggle={() => setExpandedPhase(expandedPhase === 9 ? null : 9)}>
        <div className="space-y-2">
          <div className="flex items-center gap-4 px-3 py-2 bg-white/[0.02] rounded-lg text-xs">
            <span className="text-white/40">Active Repairs: <span className="text-white/80 font-bold">{report.phase9.activeRepairs}</span></span>
            <span className="text-white/40">Findings: <span className="text-white/80 font-bold">{report.phase9.analysisAvailable}</span></span>
            <span className="text-white/40">Health: <span className="text-white/80 font-bold">{report.phase9.healthScore}/100</span></span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {report.phase9.stages.map((s) => (
              <div key={s.stage} className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center gap-2">
                <CheckCircle2 size={10} className="text-emerald-400 flex-shrink-0" />
                <span className="text-white/60 text-[10px]">{s.stage}</span>
              </div>
            ))}
          </div>
        </div>
      </PhaseSection>

      <PhaseSection number={10} title="Enterprise Readiness Validation" Icon={Building2}
        pct={report.phase10.readinessPct}
        expanded={expandedPhase === 10}
        onToggle={() => setExpandedPhase(expandedPhase === 10 ? null : 10)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {report.phase10.checks.map((c) => (
            <div key={c.name} className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center gap-2">
              {c.passed ? <CheckCircle2 size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-red-400" />}
              <span className="text-white/70 text-xs flex-1">{c.name}</span>
              <span className="text-white/30 text-[10px]">{c.detail}</span>
            </div>
          ))}
        </div>
      </PhaseSection>

      {/* Architectural Gate */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-emerald-400" />
          <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider">Architectural Gate</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded ml-auto ${report.allGatesPassed ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
            {report.allGatesPassed ? "All Gates Passed" : "Gates Pending"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(report.successCriteria).map(([key, passed]) => (
            <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              {passed ? <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" /> : <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />}
              <span className="text-xs text-white/60 flex-1">{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</span>
              <span className={`text-[10px] font-medium ${passed ? "text-emerald-400" : "text-amber-400"}`}>{passed ? "Passed" : "Pending"}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          {report.allGatesPassed ? (
            <>
              <Rocket size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Sprint 2 (EXEC™ Cognitive Engine™) is authorized to begin.</span>
            </>
          ) : (
            <>
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">Sprint 2 MUST NOT begin until all gates pass.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PhaseSection({ number, title, Icon, pct, expanded, onToggle, children }) {
  const ringColor = pct === 100 ? "#10b981" : pct >= 75 ? "#f59e0b" : "#ef4444";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
        {expanded ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
          <Icon size={14} className="text-indigo-400" />
        </div>
        <span className="text-white/80 text-sm font-medium flex-1 text-left">
          <span className="text-white/30 mr-2">Phase {number}</span>{title}
        </span>
        <div className="relative w-10 h-10">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle cx="20" cy="20" r="16" fill="none" stroke={ringColor} strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 16 * (pct / 100)} ${2 * Math.PI * 16}`}
              strokeLinecap="round" transform="rotate(-90 20 20)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">{pct}%</span>
          </div>
        </div>
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function StatusDot({ status }) {
  const colors = { healthy: "bg-emerald-500", warning: "bg-amber-500", critical: "bg-red-500" };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status] || colors.healthy}`} />;
}

function MetaItem({ label, value }) {
  return (
    <div className="px-2 py-1 rounded bg-white/[0.02]">
      <span className="text-white/30">{label}: </span>
      <span className="text-white/60">{value}</span>
    </div>
  );
}

function CheckItem({ label, passed }) {
  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${passed ? "bg-emerald-500/5 text-emerald-400" : "bg-red-500/5 text-red-400"}`}>
      {passed ? <CheckCircle2 size={8} /> : <XCircle size={8} />}
      <span>{label}</span>
    </div>
  );
}

function RouteModuleList({ items, failing, nameKey, urlKey }) {
  if (failing.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
        <CheckCircle2 size={14} className="text-emerald-400" />
        <span className="text-emerald-400 text-xs">All {items.length} items passed validation.</span>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-white/30 mb-2">{failing.length} of {items.length} items failing validation</div>
      {failing.map((item) => (
        <div key={item[urlKey]} className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center gap-2">
          <XCircle size={12} className="text-red-400 flex-shrink-0" />
          <span className="text-white/50 text-xs font-mono truncate flex-1">{item[urlKey]}</span>
          <span className="text-white/30 text-[10px] truncate">{item[nameKey]}</span>
          <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{item.failedChecks.length} failed</span>
        </div>
      ))}
    </div>
  );
}