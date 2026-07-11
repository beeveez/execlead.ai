import React, { useMemo } from "react";
import { computeFoundationVerification } from "@/lib/foundationVerificationEngine";
import {
  FileText, ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
  Rocket, TrendingUp, Cpu, Boxes, Brain, Layers, Gauge,
} from "lucide-react";

export default function FoundationVerificationReport() {
  const report = useMemo(() => computeFoundationVerification(), []);

  const scoreRow = (label, value) => {
    const color = value === 100 ? "text-emerald-400" : value >= 75 ? "text-amber-400" : "text-red-400";
    const barColor = value === 100 ? "bg-emerald-500" : value >= 75 ? "bg-amber-500" : "bg-red-500";
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/60 w-48 flex-shrink-0">{label}</span>
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${value}%` }} />
        </div>
        <span className={`text-xs font-bold w-10 text-right ${color}`}>{value}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Report Header */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">EXECLEAD.AI Foundation Verification Report™</h3>
          <span className="text-[10px] text-white/30 ml-auto">Sprint 1.3 · v{report.sprintVersion} · {report.buildNumber}</span>
        </div>
        <p className="text-white/50 text-xs">
          Formal architectural acceptance test for EXECLEAD.AI. This report verifies that every
 architectural component operates as one unified platform before the EXEC™ Cognitive Engine™ begins.
        </p>
      </div>

      {/* Version Information */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={16} className="text-cyan-400" />
          <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Version Information</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <VersionItem label="Platform Version" value={`v${report.versions.platform}`} icon={Cpu} />
          <VersionItem label="Architecture Version" value={`v${report.versions.architecture}`} icon={Boxes} />
          <VersionItem label="Knowledge Version" value={`v${report.versions.knowledge}`} icon={Brain} />
          <VersionItem label="Manifest Version" value={`v${report.versions.manifest}`} icon={FileText} />
          <VersionItem label="Platform State Version" value={`v${report.versions.platformState}`} icon={Gauge} />
          <VersionItem label="Framework Version" value={`v${report.versions.framework}`} icon={Layers} />
          <VersionItem label="ELIM Version" value={`v${report.versions.elim}`} icon={Brain} />
          <VersionItem label="Config Version" value={report.versions.config} icon={Cpu} />
        </div>
      </div>

      {/* Foundation Services Status */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Boxes size={16} className="text-indigo-400" />
          <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Foundation Services Status</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {report.phase1.services.map((svc) => (
            <div key={svc.serviceId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              {svc.health === "healthy" ? <CheckCircle2 size={14} className="text-emerald-400" /> :
               svc.health === "warning" ? <AlertTriangle size={14} className="text-amber-400" /> :
               <XCircle size={14} className="text-red-400" />}
              <span className="text-xs text-white/70 flex-1">{svc.name}</span>
              <span className="text-[10px] text-white/30">v{svc.version}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded ${
                svc.health === "healthy" ? "bg-emerald-500/10 text-emerald-400" :
                svc.health === "warning" ? "bg-amber-500/10 text-amber-400" :
                "bg-red-500/10 text-red-400"
              }`}>{svc.runtimeStatus}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-emerald-400" />
          <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Verification Scores</h4>
        </div>
        <div className="space-y-3">
          {scoreRow("Architecture Health", report.scores.architectureHealth)}
          {scoreRow("Runtime Consistency", report.scores.runtimeConsistency)}
          {scoreRow("Knowledge Resolution", report.scores.knowledgeResolution)}
          {scoreRow("Platform Discoverability", report.scores.platformDiscoverability)}
          {scoreRow("Metadata Coverage", report.scores.metadataCoverage)}
          {scoreRow("Configuration Consistency", report.scores.configurationConsistency)}
          {scoreRow("Enterprise Readiness", report.scores.enterpriseReadiness)}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className="text-indigo-400" />
            <span className="text-sm text-white/80 font-medium">Foundation Score</span>
            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${report.scores.foundationScore === 100 ? "bg-emerald-500" : report.scores.foundationScore >= 75 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${report.scores.foundationScore}%` }} />
            </div>
            <span className={`text-lg font-bold ${report.scores.foundationScore === 100 ? "text-emerald-400" : report.scores.foundationScore >= 75 ? "text-amber-400" : "text-red-400"}`}>{report.scores.foundationScore}%</span>
          </div>
        </div>
      </div>

      {/* Issue Summary */}
      <div className={`rounded-xl p-5 border ${report.issues.length === 0 ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/10"}`}>
        <div className="flex items-center gap-2 mb-4">
          {report.issues.length === 0 ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-amber-400" />}
          <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Remaining Issues</h4>
        </div>
        {report.issues.length === 0 ? (
          <p className="text-emerald-400 text-xs">✓ Zero remaining issues. All architectural gates have passed.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <IssueCount label="Critical" count={report.issueCounts.critical} color="red" />
            <IssueCount label="High" count={report.issueCounts.high} color="amber" />
            <IssueCount label="Medium" count={report.issueCounts.medium} color="yellow" />
            <IssueCount label="Low" count={report.issueCounts.low} color="blue" />
          </div>
        )}
        {report.issues.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {report.issues.map((issue, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                    issue.severity === "Critical" ? "bg-red-500/10 text-red-400" :
                    issue.severity === "High" ? "bg-amber-500/10 text-amber-400" :
                    issue.severity === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-blue-500/10 text-blue-400"
                  }`}>{issue.severity}</span>
                  <span className="text-[9px] text-white/30">Phase {issue.phase}</span>
                  <span className="text-xs text-white/70 font-medium flex-1">{issue.component}</span>
                </div>
                <p className="text-[11px] text-white/50 mb-1">{issue.description}</p>
                <p className="text-[10px] text-emerald-400/70">→ {issue.remediation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Architectural Gate */}
      <div className={`rounded-xl p-5 border ${report.allGatesPassed ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/10"}`}>
        <div className="flex items-center gap-2 mb-3">
          {report.allGatesPassed ? <Rocket size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-amber-400" />}
          <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Architectural Gate</h4>
        </div>
        <p className="text-[11px] text-white/40 leading-relaxed mb-3">
          Sprint 2 (EXEC™ Cognitive Engine™) MUST NOT begin until every Foundation Verification gate has passed.
          The Foundation Verification Sprint™ is the formal architectural acceptance test for EXECLEAD.AI.
          Only after successful completion may the platform evolve from a unified intelligence architecture
          into a true reasoning platform powered by the EXEC™ Cognitive Engine™.
        </p>
        <div className="flex items-center gap-2">
          {report.allGatesPassed ? (
            <>
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Architectural Gate — Passed. Sprint 2 is authorized.</span>
            </>
          ) : (
            <>
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">Architectural Gate — Blocked. {report.issueCounts.critical} critical issue(s) must be resolved.</span>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-[10px] text-white/20 italic">
          One Leadership Journey. One AI Platform. One Verified Foundation.
        </p>
      </div>
    </div>
  );
}

function VersionItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
      <Icon size={12} className="text-white/30 flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
        <div className="text-xs text-white/80 font-medium truncate">{value}</div>
      </div>
    </div>
  );
}

function IssueCount({ label, count, color }) {
  const colors = {
    red: count > 0 ? "bg-red-500/5 border-red-500/10 text-red-400" : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400",
    amber: count > 0 ? "bg-amber-500/5 border-amber-500/10 text-amber-400" : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400",
    yellow: count > 0 ? "bg-yellow-500/5 border-yellow-500/10 text-yellow-400" : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400",
    blue: count > 0 ? "bg-blue-500/5 border-blue-500/10 text-blue-400" : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400",
  };
  return (
    <div className={`px-3 py-2 rounded-lg border text-center ${colors[color]}`}>
      <div className="text-lg font-bold">{count}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </div>
  );
}