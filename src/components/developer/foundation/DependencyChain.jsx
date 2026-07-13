import React, { useState } from "react";
import { Boxes, GitBranch, ShieldCheck, Flag, ChevronRight, ExternalLink, FileText } from "lucide-react";
import MetadataDrawer from "../metadata/MetadataDrawer";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";

const DEPENDENCIES = [
  {
    id: "platform_manifest",
    label: "Platform Manifest™",
    icon: Boxes,
    description: "The single source of truth for all routes, modules, capabilities, frameworks, and personas.",
    diagnosticsDeepLink: "/developer/governance",
    diagnosticLabel: "Manifest Diagnostics™",
    metrics: ["Route Coverage", "Module Registration", "Orphan Detection", "Duplicate Detection"],
    status: "healthy",
    version: "v2.0",
    sourceFile: "src/lib/platformManifest.js",
  },
  {
    id: "capability_registry",
    label: "Capability Registry™",
    icon: GitBranch,
    description: "Maps every AI capability to its knowledge pack, framework, persona, and workspace.",
    diagnosticsDeepLink: "/developer/governance",
    diagnosticLabel: "Registry Diagnostics™",
    metrics: ["Capability Chains", "Knowledge Pack Links", "Persona Mapping", "Framework Tracing"],
    status: "healthy",
    version: "v1.0",
    sourceFile: "src/lib/platformManifest.js",
  },
  {
    id: "foundation_verification",
    label: "Foundation Verification Engine™",
    icon: ShieldCheck,
    description: "10-phase verification engine that validates every architectural component operates as one platform.",
    diagnosticsDeepLink: "/developer/diagnostics",
    diagnosticLabel: "Verification Dashboard™",
    metrics: ["Architecture Health", "Runtime Consistency", "Knowledge Resolution", "Discoverability", "Config Consistency"],
    status: cert => cert.foundationScore >= 95 ? "healthy" : "warning",
    version: "v2.0",
    sourceFile: "src/lib/foundationVerificationEngine.js",
  },
  {
    id: "feature_flag_registry",
    label: "Feature Flag Registry™",
    icon: Flag,
    description: "Controls feature visibility across plans, workspaces, and deployment stages.",
    diagnosticsDeepLink: "/feature-management",
    diagnosticLabel: "Flag Diagnostics™",
    metrics: ["Flag Coverage", "Plan Mapping", "Workspace Gating", "Consistency Check"],
    status: "healthy",
    version: "v1.0",
    sourceFile: "src/lib/platformManifest.js",
  },
];

export default function DependencyChain({ cert }) {
  const [active, setActive] = useState(null);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Dependency Chain™ — Click any dependency for diagnostics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {DEPENDENCIES.map((dep) => {
          const status = typeof dep.status === "function" ? dep.status(cert) : dep.status;
          const Icon = dep.icon;
          return (
            <button
              key={dep.id}
              onClick={() => setActive(dep)}
              className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-left hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={16} className={status === "healthy" ? "text-emerald-400" : "text-amber-400"} />
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${status === "healthy" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {dep.version}
                </span>
              </div>
              <div className="text-xs text-white/80 font-medium mb-1 group-hover:text-indigo-300 transition-colors">{dep.label}</div>
              <div className="text-[10px] text-white/40 line-clamp-2">{dep.description}</div>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-indigo-400 group-hover:text-indigo-300">
                {dep.diagnosticLabel} <ChevronRight size={10} />
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <MetadataDrawer
          title={active.label}
          subtitle={`${active.diagnosticLabel} · Dependency Diagnostics`}
          icon={active.icon}
          onClose={() => setActive(null)}
          maxWidth="max-w-lg"
          footer={<ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix={`${active.label}-Diagnostics`} supportCSV />}
        >
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <p className="text-xs text-white/60">{active.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailStat label="Version" value={active.version} />
              <DetailStat label="Status" value={typeof active.status === "function" ? active.status(cert) : active.status} />
              <DetailStat label="Source File" value={active.sourceFile} />
              <DetailStat label="Diagnostic" value={active.diagnosticLabel} />
            </div>

            <div>
              <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Metrics Tracked</h4>
              <div className="space-y-1">
                {active.metrics.map((m) => (
                  <div key={m} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs text-white/60">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={active.diagnosticsDeepLink}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 border border-indigo-500/15 rounded-lg px-3 py-2 w-fit"
            >
              <ExternalLink size={12} /> Open {active.diagnosticLabel}
            </a>
          </div>
        </MetadataDrawer>
      )}
    </div>
  );
}

function DetailStat({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-white/70 mt-0.5 truncate">{value}</div>
    </div>
  );
}