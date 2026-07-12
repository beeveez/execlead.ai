import React, { useState } from "react";
import {
  Radar, ShieldCheck, Activity, Brain, Rocket, Boxes, Award, Sparkles,
  Lock, BarChart3, ScrollText, Zap, ChevronRight, Cpu, TrendingUp,
} from "lucide-react";
import { useGovernancePipeline } from "@/lib/GovernancePipelineContext";
import { usePlatformState } from "@/lib/PlatformStateContext";
import { computeReadinessLevel } from "@/lib/platformReadinessModel";
import { useGuardian } from "@/lib/GuardianContext";
import MissionControl from "./MissionControl";
import LaunchReadinessCenter from "@/components/developer/launch/LaunchReadinessCenter";
import ScalabilityAssessmentCenter from "@/components/developer/scalability/ScalabilityAssessmentCenter";

// Diagnostic components
import GovernanceCertificationBanner from "@/components/developer/GovernanceCertificationBanner";
import GovernancePipelineStatus from "@/components/developer/GovernancePipelineStatus";
import GovernanceCertificateCard from "@/components/developer/GovernanceCertificateCard";
import PlatformManifestDashboard from "@/components/developer/PlatformManifestDashboard";
import RegistrySynchronization from "@/components/developer/RegistrySynchronization";
import ContextValidation from "@/components/developer/ContextValidation";
import PlatformStateDebugPanel from "@/components/developer/PlatformStateDebugPanel";
import PlatformStatusGrid from "@/components/developer/PlatformStatusGrid";
import SystemTimeline from "@/components/developer/SystemTimeline";
import CorePlatformServices from "@/components/developer/CorePlatformServices";
import ExecKnowledgeAudit from "@/components/developer/ExecKnowledgeAudit";
import WorkspaceIntelligence from "@/components/developer/WorkspaceIntelligence";
import KnowledgePackEngine from "@/components/developer/KnowledgePackEngine";
import KnowledgeResolutionAudit from "@/components/developer/KnowledgeResolutionAudit";
import CapabilityRegistryStatus from "@/components/developer/CapabilityRegistryStatus";
import FrameworkRegistry from "@/components/developer/FrameworkRegistry";
import FoundationIntegrationReport from "@/components/developer/FoundationIntegrationReport";
import PlatformMetadataCompletion from "@/components/developer/PlatformMetadataCompletion";
import PlatformMetadataCompletionReport from "@/components/developer/PlatformMetadataCompletionReport";
import DeploymentReadiness from "@/components/developer/DeploymentReadiness";
import FoundationVerificationCenter from "@/components/developer/FoundationVerificationCenter";
import FoundationVerificationReport from "@/components/developer/FoundationVerificationReport";
import PlatformHealth from "@/components/developer/PlatformHealth";
import MissionControlDashboard from "@/components/developer/MissionControlDashboard";
import GovernanceTimeline from "@/components/developer/GovernanceTimeline";
import SelfHealingEngine from "@/components/developer/SelfHealingEngine";
import SelfHealingHistory from "@/components/developer/SelfHealingHistory";
import RepairDiagnostics from "@/components/developer/RepairDiagnostics";
import FoundationCertificationDashboard from "@/components/developer/foundation/FoundationCertificationDashboard";
import PlatformIntelligenceCenter from "@/components/developer/pii/PlatformIntelligenceCenter";
import FeatureGovernanceRuleCard from "@/components/developer/FeatureGovernanceRuleCard";
import FoundationCompletionDirectiveCard from "@/components/developer/FoundationCompletionDirectiveCard";

const WORKSPACES = [
  {
    id: "mission-control",
    name: "Mission Control",
    icon: Radar,
    color: "emerald",
    description: "Executive overview",
    render: (ctx) => <MissionControl onNavigate={ctx.navigate} />,
  },
  {
    id: "launch-readiness",
    name: "Launch Readiness",
    icon: Rocket,
    color: "emerald",
    description: "Launch Readiness Program™",
    render: () => <LaunchReadinessCenter />,
  },
  {
    id: "foundation-certification",
    name: "Foundation Certification",
    icon: Award,
    color: "emerald",
    description: "Certification & release gate",
    render: () => <FoundationCertificationDashboard />,
  },
  {
    id: "platform-intelligence",
    name: "Platform Intelligence",
    icon: Sparkles,
    color: "indigo",
    description: "Intelligence Quotient™ & digital twin",
    render: (ctx) => <PlatformIntelligenceCenter onNavigate={ctx.navigate} />,
  },
  {
    id: "platform-governance",
    name: "Platform Governance",
    icon: ShieldCheck,
    color: "indigo",
    description: "Governance pipeline & manifest",
    render: (ctx) => (
      <WorkspaceContainer>
        <GovernanceCertificationBanner certificate={ctx.certificate} pipelineRunning={ctx.pipelineRunning} onRefresh={() => ctx.runPipeline("manual")} />
        <GovernancePipelineStatus certificate={ctx.certificate} pipelineRunning={ctx.pipelineRunning} />
        <GovernanceCertificateCard certificate={ctx.certificate} pipelineRunning={ctx.pipelineRunning} onRefresh={() => ctx.runPipeline("manual")} />
        <FoundationCompletionDirectiveCard />
        <FeatureGovernanceRuleCard />
        <PlatformManifestDashboard />
        <RegistrySynchronization />
        <ContextValidation />
      </WorkspaceContainer>
    ),
  },
  {
    id: "runtime-intelligence",
    name: "Runtime Intelligence",
    icon: Activity,
    color: "cyan",
    description: "Platform state & live status",
    render: () => (
      <WorkspaceContainer>
        <PlatformStatusGrid />
        <SystemTimeline />
        <CorePlatformServices />
        <PlatformStateDebugPanel />
      </WorkspaceContainer>
    ),
  },
  {
    id: "knowledge-operations",
    name: "Knowledge Operations",
    icon: Brain,
    color: "indigo",
    description: "EXEC™ knowledge & packs",
    render: () => (
      <WorkspaceContainer>
        <ExecKnowledgeAudit />
        <KnowledgePackEngine />
        <KnowledgeResolutionAudit />
        <WorkspaceIntelligence />
      </WorkspaceContainer>
    ),
  },
  {
    id: "deployment-center",
    name: "Deployment Center",
    icon: Rocket,
    color: "emerald",
    description: "Readiness & verification",
    render: () => (
      <WorkspaceContainer>
        <DeploymentReadiness />
        <FoundationVerificationCenter />
        <FoundationVerificationReport />
      </WorkspaceContainer>
    ),
  },
  {
    id: "architecture-center",
    name: "Architecture Center",
    icon: Boxes,
    color: "purple",
    description: "Capabilities & frameworks",
    render: () => (
      <WorkspaceContainer>
        <CapabilityRegistryStatus />
        <FrameworkRegistry />
        <FoundationIntegrationReport />
        <PlatformMetadataCompletion />
        <PlatformMetadataCompletionReport />
      </WorkspaceContainer>
    ),
  },
  {
    id: "security-guardian",
    name: "Security & Guardian",
    icon: Lock,
    color: "amber",
    description: "Self-healing & guardian",
    render: () => (
      <WorkspaceContainer>
        <SelfHealingEngine />
      </WorkspaceContainer>
    ),
  },
  {
    id: "platform-analytics",
    name: "Platform Analytics",
    icon: BarChart3,
    color: "blue",
    description: "Health & metrics",
    render: () => (
      <WorkspaceContainer>
        <PlatformHealth />
        <MissionControlDashboard />
      </WorkspaceContainer>
    ),
  },
  {
    id: "scalability-assessment",
    name: "Scalability Assessment",
    icon: TrendingUp,
    color: "cyan",
    description: "Capacity & scaling analysis",
    render: () => <ScalabilityAssessmentCenter />,
  },
  {
    id: "audit-center",
    name: "Audit Center",
    icon: ScrollText,
    color: "indigo",
    description: "Governance timeline",
    render: () => (
      <WorkspaceContainer>
        <GovernanceTimeline />
      </WorkspaceContainer>
    ),
  },
  {
    id: "automation-center",
    name: "Automation Center",
    icon: Zap,
    color: "amber",
    description: "Repair history & diagnostics",
    render: () => (
      <WorkspaceContainer>
        <SelfHealingHistory />
        <RepairDiagnostics />
      </WorkspaceContainer>
    ),
  },
];

const NAV_COLORS = {
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

function WorkspaceContainer({ children }) {
  return <div className="space-y-6">{children}</div>;
}

export default function OperationsCenterShell({ initialWorkspaceId = "mission-control" }) {
  const [activeId, setActiveId] = useState(initialWorkspaceId);
  const { certificate, pipelineRunning, runPipeline } = useGovernancePipeline();
  const { health } = usePlatformState();
  const guardian = useGuardian();
  const guardianPending = guardian?.pending?.length || 0;
  const readiness = computeReadinessLevel(health, certificate?.certified, guardianPending);

  const active = WORKSPACES.find((w) => w.id === activeId) || WORKSPACES[0];
  const ctx = { certificate, pipelineRunning, runPipeline, navigate: setActiveId };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-[#08080d] p-4 flex-shrink-0">
        <div className="mb-6 px-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-widest mb-1">
            <Cpu size={12} /> Operations Center™
          </div>
          <h1 className="text-base font-bold text-white leading-tight">EXECLEAD.AI</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded border" style={{ color: readiness.color, borderColor: `${readiness.color}40`, backgroundColor: `${readiness.color}10` }}>
              {readiness.short} — {readiness.name}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {WORKSPACES.map((ws) => {
            const Icon = ws.icon;
            const isActive = ws.id === activeId;
            const colorClass = NAV_COLORS[ws.color] || NAV_COLORS.indigo;
            return (
              <button
                key={ws.id}
                onClick={() => setActiveId(ws.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                  isActive
                    ? `${colorClass}`
                    : "border-transparent text-white/50 hover:bg-white/[0.03] hover:text-white/80"
                }`}
              >
                <Icon size={15} className="flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{ws.name}</div>
                  <div className={`text-[9px] truncate ${isActive ? "opacity-60" : "text-white/30"}`}>{ws.description}</div>
                </div>
                {isActive && <ChevronRight size={12} className="flex-shrink-0" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile tabs */}
      <div className="lg:hidden border-b border-white/5 bg-[#08080d] sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-2">
          <Cpu size={14} className="text-emerald-400" />
          <span className="text-sm font-bold text-white">Operations Center™</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded border ml-auto" style={{ color: readiness.color, borderColor: `${readiness.color}40`, backgroundColor: `${readiness.color}10` }}>
            {readiness.short}
          </span>
        </div>
        <div className="flex gap-1 overflow-x-auto px-2 pb-2 scrollbar-thin">
          {WORKSPACES.map((ws) => {
            const Icon = ws.icon;
            const isActive = ws.id === activeId;
            const colorClass = NAV_COLORS[ws.color] || NAV_COLORS.indigo;
            return (
              <button
                key={ws.id}
                onClick={() => setActiveId(ws.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive ? colorClass : "border-white/5 text-white/50 bg-white/[0.02]"
                }`}
              >
                <Icon size={12} />
                {ws.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5 text-xs">
          <button
            onClick={() => setActiveId("mission-control")}
            className="text-white/40 hover:text-white/60 transition-colors"
          >
            Operations Center
          </button>
          <ChevronRight size={12} className="text-white/20" />
          <span className="text-white/80 font-medium">{active.name}</span>
          <span className="text-white/20 ml-2">— {active.description}</span>
        </div>

        {/* Active workspace */}
        <div className="animate-fade-in">
          {active.render(ctx)}
        </div>
      </main>
    </div>
  );
}