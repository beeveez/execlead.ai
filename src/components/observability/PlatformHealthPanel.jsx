import React from "react";
import { Heart, Route, Shield, AlertTriangle } from "lucide-react";
import { usePlatformState } from "@/lib/PlatformStateContext";
import { Panel, HealthBar, StatusRow, StatCard } from "./Shared";

export default function PlatformHealthPanel() {
  const { health, coverage, status, errorCount, warningCount, platformVersion, readiness } = usePlatformState();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Heart} label="Overall Health" value={`${health?.overall ?? 0}`} color={health?.overall >= 80 ? "emerald" : "amber"} />
        <StatCard icon={Route} label="Route Coverage" value={`${coverage?.routeCoverage ?? 0}%`} color="indigo" />
        <StatCard icon={Shield} label="Errors" value={errorCount ?? 0} color="red" />
        <StatCard icon={AlertTriangle} label="Warnings" value={warningCount ?? 0} color="amber" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel title="Health Breakdown">
          <HealthBar label="Manifest" value={health?.manifestCoverage} />
          <HealthBar label="Knowledge" value={health?.knowledgeCoverage} />
          <HealthBar label="Routes" value={health?.routeCoverage} />
          <HealthBar label="Entities" value={health?.entityHealth} />
          <HealthBar label="Guardian" value={health?.guardianHealth} />
          <HealthBar label="Feature Flags" value={health?.featureFlagHealth} />
          <HealthBar label="Deployment" value={health?.deploymentHealth} />
          <HealthBar label="API" value={health?.apiHealth} />
        </Panel>

        <Panel title="Platform Status">
          <div className="space-y-1">
            <StatusRow label="Status" value={status} />
            <StatusRow label="Platform Version" value={platformVersion} />
            <StatusRow label="Modules" value={coverage?.modules} />
            <StatusRow label="Routes" value={coverage?.routes} />
            <StatusRow label="Indexed Routes" value={coverage?.indexedRoutes} />
            <StatusRow label="Workspaces" value={coverage?.workspaces} />
            <StatusRow label="Frameworks" value={coverage?.frameworks} />
            <StatusRow label="AI Personas" value={coverage?.aiPersonas} />
            <StatusRow label="Capabilities" value={`${coverage?.activeCapabilities ?? 0} active, ${coverage?.futureCapabilities ?? 0} future`} />
            <StatusRow label="Readiness" value={readiness?.label} />
          </div>
        </Panel>
      </div>
    </div>
  );
}