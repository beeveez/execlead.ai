import React, { useState } from "react";
import { Boxes, GitBranch, ShieldCheck, Flag, ChevronRight, ExternalLink, Award, Target, Layers } from "lucide-react";
import MetadataDrawer from "../metadata/MetadataDrawer";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";
import AffectedModulesDrillDown from "./AffectedModulesDrillDown";

const GRAPH_NODES = [
  { id: "foundation_cert", label: "Foundation Certification™", icon: Award, color: "indigo", deepLink: "/developer/foundation-certification", description: "The formal architectural acceptance score — current live telemetry from the Foundation Verification Engine™.", sourceFile: "src/lib/foundationCertificationEngine.js" },
  { id: "cert_metrics", label: "Certification Metrics™", icon: Target, color: "emerald", deepLink: "/developer/fiagnostics", description: "7 weighted metrics: Architecture Health, Runtime Consistency, Knowledge Resolution, Platform Discoverability, Metadata Coverage, Configuration Consistency, Enterprise Readiness.", sourceFile: "src/lib/foundationVerificationEngine.js" },
  { id: "platform_manifest", label: "Platform Manifest™", icon: Boxes, color: "cyan", deepLink: "/developer/governance", description: "Single source of truth for all routes, modules, capabilities, frameworks, and personas.", sourceFile: "src/lib/platformManifest.js" },
  { id: "capability_registry", label: "Capability Registry™", icon: GitBranch, color: "violet", deepLink: "/developer/governance", description: "Maps every AI capability to its knowledge pack, framework, persona, and workspace.", sourceFile: "src/lib/platformManifest.js" },
  { id: "feature_flag_registry", label: "Feature Flag Registry™", icon: Flag, color: "amber", deepLink: "/feature-management", description: "Controls feature visibility across plans, workspaces, and deployment stages.", sourceFile: "src/lib/platformManifest.js" },
  { id: "foundation_verification", label: "Foundation Verification Engine™", icon: ShieldCheck, color: "blue", deepLink: "/developer/diagnostics", description: "10-phase verification engine that validates every architectural component operates as one unified platform.", sourceFile: "src/lib/foundationVerificationEngine.js" },
  { id: "affected_modules", label: "Affected Modules™", icon: Layers, color: "red", deepLink: "/developer/diagnostics", description: "Modules with unresolved certification issues — live count from the verification engine.", sourceFile: "src/lib/foundationVerificationEngine.js" },
];

const COLOR_MAP = {
  indigo: { border: "border-indigo-500/20", bg: "bg-indigo-500/5", text: "text-indigo-400", dot: "bg-indigo-400" },
  emerald: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", text: "text-emerald-400", dot: "bg-emerald-400" },
  cyan: { border: "border-cyan-500/20", bg: "bg-cyan-500/5", text: "text-cyan-400", dot: "bg-cyan-400" },
  violet: { border: "border-violet-500/20", bg: "bg-violet-500/5", text: "text-violet-400", dot: "bg-violet-400" },
  amber: { border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-400", dot: "bg-amber-400" },
  blue: { border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-400", dot: "bg-blue-400" },
  red: { border: "border-red-500/20", bg: "bg-red-500/5", text: "text-red-400", dot: "bg-red-400" },
};

export default function DependencyChain({ cert }) {
  const [active, setActive] = useState(null);
  const c = COLOR_MAP;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Dependency Graph™ — Click any node for diagnostics</h3>
      </div>

      {/* Vertical tree */}
      <div className="flex flex-col items-center">
        {GRAPH_NODES.map((node, i) => {
          const colors = c[node.color];
          const Icon = node.icon;
          const isLast = i === GRAPH_NODES.length - 1;
          return (
            <React.Fragment key={node.id}>
              <button
                onClick={() => setActive(node)}
                className={`relative flex items-center gap-3 ${colors.bg} ${colors.border} border rounded-xl px-4 py-3 w-full max-w-md transition-all hover:scale-[1.01] group`}
              >
                <div className={`w-9 h-9 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={colors.text} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className={`text-sm font-bold ${colors.text} group-hover:opacity-90`}>{node.label}</div>
                  <div className="text-[10px] text-white/30 truncate">{node.description}</div>
                </div>
                <ChevronRight size={14} className={`${colors.text} opacity-50 group-hover:opacity-100 shrink-0`} />
              </button>
              {!isLast && (
                <div className="w-px h-6 bg-gradient-to-b from-white/10 to-white/5" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {active && active.id === "affected_modules" && (
        <AffectedModulesDrillDown onClose={() => setActive(null)} />
      )}

      {active && active.id !== "affected_modules" && (
        <MetadataDrawer
          title={active.label}
          subtitle="Dependency Diagnostics™ — Drill-Down"
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
              <DetailStat label="Source File" value={active.sourceFile} />
              <DetailStat label="Deep Link" value={active.deepLink} />
            </div>
            <a href={active.deepLink} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 border border-indigo-500/15 rounded-lg px-3 py-2 w-fit">
              <ExternalLink size={12} /> Open Diagnostics
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