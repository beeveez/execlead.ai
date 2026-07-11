import React from "react";
import {
  Cpu, Boxes, Brain, Network, Zap, Layers, Package,
  Activity, Rocket, Clock, ShieldCheck, Gauge, Wrench, Radar,
} from "lucide-react";
import MissionControlDashboard from "@/components/developer/MissionControlDashboard";
import PlatformStatusGrid from "@/components/developer/PlatformStatusGrid";
import SystemTimeline from "@/components/developer/SystemTimeline";
import CorePlatformServices from "@/components/developer/CorePlatformServices";
import PlatformManifestDashboard from "@/components/developer/PlatformManifestDashboard";
import ExecKnowledgeAudit from "@/components/developer/ExecKnowledgeAudit";
import WorkspaceIntelligence from "@/components/developer/WorkspaceIntelligence";
import CapabilityRegistryStatus from "@/components/developer/CapabilityRegistryStatus";
import FrameworkRegistry from "@/components/developer/FrameworkRegistry";
import KnowledgePackEngine from "@/components/developer/KnowledgePackEngine";
import PlatformHealth from "@/components/developer/PlatformHealth";
import DeploymentReadiness from "@/components/developer/DeploymentReadiness";
import GovernanceTimeline from "@/components/developer/GovernanceTimeline";
import ContextValidation from "@/components/developer/ContextValidation";
import SelfHealingEngine from "@/components/developer/SelfHealingEngine";
import PlatformStateDebugPanel from "@/components/developer/PlatformStateDebugPanel";

export default function Diagnostics() {
  const SectionDivider = ({ number, icon: Icon, label, color }) => {
    const colors = {
      purple: "text-purple-400 border-purple-500/20",
      indigo: "text-indigo-400 border-indigo-500/20",
      cyan: "text-cyan-400 border-cyan-500/20",
      amber: "text-amber-400 border-amber-500/20",
      blue: "text-blue-400 border-blue-500/20",
      emerald: "text-emerald-400 border-emerald-500/20",
    };
    return (
      <div className={`flex items-center gap-3 mt-8 mb-4 pb-2 border-b ${colors[color] || colors.indigo}`}>
        {number && (
          <div className={`w-7 h-7 rounded-lg bg-white/5 border ${colors[color]?.split(" ")[1] || "border-white/10"} flex items-center justify-center text-xs font-bold ${colors[color]?.split(" ")[0] || "text-white/60"}`}>
            {number}
          </div>
        )}
        <Icon size={16} className={colors[color]?.split(" ")[0] || "text-white/60"} />
        <h2 className="text-white/80 font-medium text-sm uppercase tracking-wider">{label}</h2>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-widest mb-1">
            <Radar size={14} /> Platform Governance Center™
          </div>
          <h1 className="text-2xl font-bold text-white">Mission Control</h1>
          <p className="text-white/40 text-sm mt-1">
            The operational command center of EXECLEAD.AI — complete platform visibility in 30 seconds.
          </p>
        </div>

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 0: Mission Control Dashboard                   */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider icon={Radar} label="Mission Control" color="emerald" />
        <MissionControlDashboard />

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 0.5: Live Platform Status                      */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider icon={Activity} label="Live Platform Status" color="cyan" />
        <PlatformStatusGrid />

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 0.6: System Timeline                           */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider icon={Clock} label="System Timeline" color="indigo" />
        <SystemTimeline />

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 2: Core Platform Services™                    */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider number={2} icon={Boxes} label="Core Platform Services™" color="purple" />
        <CorePlatformServices />

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 3: Platform Manifest™                          */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider number={3} icon={Boxes} label="Platform Manifest™" color="purple" />
        <div id="manifest-section">
          <PlatformManifestDashboard />
        </div>

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 3.5: Platform Self-Healing Engine™             */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider icon={Wrench} label="Platform Self-Healing Engine™" color="emerald" />
        <div id="self-healing-section">
          <SelfHealingEngine />
        </div>

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 3: EXEC™ Knowledge Center                      */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider number={4} icon={Brain} label="EXEC™ Knowledge Center" color="indigo" />
        <ExecKnowledgeAudit />

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 4: Workspace Intelligence Center               */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider number={5} icon={Network} label="Workspace Intelligence Center" color="cyan" />
        <WorkspaceIntelligence />

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 5: Capability Registry                         */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider number={6} icon={Zap} label="Capability Registry" color="amber" />
        <CapabilityRegistryStatus />

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 6: Framework Governance                        */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider number={7} icon={Layers} label="Framework Governance" color="blue" />
        <FrameworkRegistry />

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 7: Knowledge Pack Engine™                      */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider number={8} icon={Package} label="Knowledge Pack Engine™" color="amber" />
        <KnowledgePackEngine />

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 8: Platform Health                             */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider number={9} icon={Activity} label="Platform Health" color="emerald" />
        <PlatformHealth />

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 9: Deployment Readiness                        */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider number={10} icon={Rocket} label="Deployment Readiness" color="emerald" />
        <DeploymentReadiness />

        {/* ────────────────────────────────────────────────────── */}
        {/* SECTION 10: Governance Timeline                        */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider number={11} icon={Clock} label="Governance Timeline" color="indigo" />
        <GovernanceTimeline />

        {/* ────────────────────────────────────────────────────── */}
        {/* ACTIVE CONTEXT VALIDATION                              */}
        {/* ────────────────────────────────────────────────────── */}
        <SectionDivider icon={ShieldCheck} label="Active Context Validation" color="emerald" />
        <ContextValidation />

        <SectionDivider icon={Activity} label="Platform State Debug" color="amber" />
        <PlatformStateDebugPanel />
      </div>
    </div>
  );
}