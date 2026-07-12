import React from "react";
import SectionCard from "./SectionCard";
import { Activity, Rocket, Server, GitBranch } from "lucide-react";

function Metric({ label, value, icon: Icon, accent }) {
  const colors = { green: "text-emerald-400", amber: "text-amber-400", red: "text-red-400", blue: "text-cyan-400", indigo: "text-indigo-400" };
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon size={13} className={colors[accent] || "text-white/40"} />}
      <div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
        <div className={`text-sm font-medium ${colors[accent] || "text-white"}`}>{value}</div>
      </div>
    </div>
  );
}

export default function PlatformOverview({ overview }) {
  const healthColor = overview.platformHealth >= 90 ? "green" : overview.platformHealth >= 60 ? "amber" : "red";
  return (
    <SectionCard title="Platform Overview" subtitle="Where the platform stands right now" icon={Activity} accent="indigo">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Platform Health" value={`${overview.platformHealth}/100`} icon={Activity} accent={healthColor} />
        <Metric label="Overall Readiness" value={`${overview.overallReadiness}%`} icon={Activity} accent={overview.overallReadiness >= 90 ? "green" : "amber"} />
        <Metric label="Execution Stream" value={overview.executionStream} icon={GitBranch} accent="indigo" />
        <Metric label="Current Sprint" value={overview.sprint} icon={GitBranch} accent="blue" />
        <Metric label="Version" value={`v${overview.version}`} icon={Server} accent="indigo" />
        <Metric label="Build Number" value={overview.buildNumber} icon={Server} accent="blue" />
        <Metric label="Deployment" value={overview.deploymentStatus} icon={Rocket} accent={overview.deploymentStatus === "Ready" ? "green" : overview.deploymentStatus === "Blocked" ? "red" : "amber"} />
        <Metric label="Environment" value={overview.environment} icon={Server} accent="indigo" />
        <Metric label="Production Readiness" value={overview.productionReadiness} icon={Activity} accent={overview.productionReadinessLevel >= 4 ? "green" : overview.productionReadinessLevel >= 2 ? "amber" : "red"} />
        <Metric label="Launch Ready" value={overview.launchReady ? "Yes" : "Not Yet"} icon={Rocket} accent={overview.launchReady ? "green" : "amber"} />
        <Metric label="Last Deployment" value={overview.lastDeployment ? new Date(overview.lastDeployment).toLocaleDateString() : "—"} icon={Rocket} accent="blue" />
        <Metric label="Last Validation" value={overview.lastValidation ? new Date(overview.lastValidation).toLocaleDateString() : "—"} icon={Activity} accent="blue" />
      </div>
    </SectionCard>
  );
}