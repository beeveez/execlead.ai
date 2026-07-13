import React, { useMemo, useState } from "react";
import {
  Layers, ChevronRight, Search, ExternalLink, AlertTriangle,
  ShieldCheck, FileText, Boxes, Wrench,
} from "lucide-react";
import { computeFoundationVerification } from "@/lib/foundationVerificationEngine";
import MetadataDrawer from "../metadata/MetadataDrawer";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";

const SEVERITY_STYLES = {
  Critical: "bg-red-500/15 text-red-400",
  High: "bg-orange-500/15 text-orange-400",
  Medium: "bg-amber-500/15 text-amber-400",
  Low: "bg-blue-500/15 text-blue-400",
};

const PHASE_LABELS = {
  1: "Architecture Audit",
  2: "Runtime Consistency",
  3: "Knowledge Resolution",
  4: "Route Discoverability",
  5: "Module Discoverability",
  6: "Persona Verification",
  7: "Configuration Consistency",
  8: "Event Bus",
  9: "Self-Healing",
  10: "Enterprise Readiness",
};

/**
 * Affected Modules™ — Dependency Diagnostics™ Drill-Down
 * --------------------------------------------------------
 * Shows modules with unresolved certification issues.
 * Live count from the Foundation Verification Engine™.
 *
 * Source: src/lib/foundationVerificationEngine.js
 * Deep Link: /developer/diagnostics
 */
export default function AffectedModulesDrillDown({ onClose }) {
  const [search, setSearch] = useState("");
  const [activeModule, setActiveModule] = useState(null);

  const verification = useMemo(() => computeFoundationVerification(), []);

  // Aggregate affected modules: those failing discoverability (phase5)
  // plus modules mentioned in issues.
  const affectedModules = useMemo(() => {
    const map = new Map();

    // From phase5 — modules with failed discoverability checks
    verification.phase5?.failingModules?.forEach((m) => {
      const key = m.moduleName;
      if (!map.has(key)) {
        map.set(key, {
          moduleName: m.moduleName,
          moduleId: m.moduleId,
          failedChecks: m.failedChecks || [],
          issues: [],
        });
      }
      const entry = map.get(key);
      entry.failedChecks = m.failedChecks || [];
    });

    // From issues — any issue whose component matches a module
    verification.issues?.forEach((issue) => {
      const key = issue.component;
      if (!map.has(key)) {
        map.set(key, {
          moduleName: key,
          moduleId: null,
          failedChecks: [],
          issues: [],
        });
      }
      map.get(key).issues.push(issue);
    });

    return Array.from(map.values()).sort((a, b) => {
      const aSev = a.issues[0]?.severity || "Low";
      const bSev = b.issues[0]?.severity || "Low";
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return (order[aSev] ?? 4) - (order[bSev] ?? 4);
    });
  }, [verification]);

  const filtered = affectedModules.filter(
    (m) => !search || m.moduleName.toLowerCase().includes(search.toLowerCase())
  );

  const totalIssues = affectedModules.reduce((sum, m) => sum + m.issues.length, 0);
  const criticalCount = affectedModules.reduce(
    (sum, m) => sum + m.issues.filter((i) => i.severity === "Critical").length,
    0
  );

  return (
    <MetadataDrawer
      title="Affected Modules™"
      subtitle="Dependency Diagnostics™ — Drill-Down"
      icon={Layers}
      onClose={onClose}
      maxWidth="max-w-3xl"
      footer={
        <ReportToolbar
          reportBuilder={buildFoundationReport}
          filenamePrefix="Affected-Modules"
          supportCSV
        />
      }
    >
      <div className="space-y-4">
        {/* Live count summary */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryStat
            label="Affected Modules"
            value={affectedModules.length}
            icon={Layers}
            color="text-red-400"
            bg="bg-red-500/5"
            border="border-red-500/15"
          />
          <SummaryStat
            label="Total Issues"
            value={totalIssues}
            icon={AlertTriangle}
            color="text-amber-400"
            bg="bg-amber-500/5"
            border="border-amber-500/15"
          />
          <SummaryStat
            label="Critical"
            value={criticalCount}
            icon={ShieldCheck}
            color={criticalCount > 0 ? "text-red-400" : "text-emerald-400"}
            bg={criticalCount > 0 ? "bg-red-500/5" : "bg-emerald-500/5"}
            border={criticalCount > 0 ? "border-red-500/15" : "border-emerald-500/15"}
          />
        </div>

        {/* Source & deep link */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <FileText size={11} /> src/lib/foundationVerificationEngine.js
          </div>
          <a
            href="/developer/diagnostics"
            className="flex items-center gap-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 border border-indigo-500/15 rounded-lg px-2.5 py-1"
          >
            <ExternalLink size={10} /> /developer/diagnostics
          </a>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search affected modules..."
            className="bg-white/[0.02] border border-white/5 rounded-lg pl-7 pr-3 py-2 text-xs text-white/70 placeholder:text-white/30 focus:outline-none focus:border-red-500/30 w-full"
          />
        </div>

        {/* Module table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-white/5">
                <th className="text-left py-2 px-2 font-medium">Module</th>
                <th className="text-center py-2 px-2 font-medium">Severity</th>
                <th className="text-center py-2 px-2 font-medium">Issues</th>
                <th className="text-center py-2 px-2 font-medium">Failed Checks</th>
                <th className="text-center py-2 px-2 font-medium">Phase</th>
                <th className="text-center py-2 px-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const topIssue = m.issues[0];
                const severity = topIssue?.severity || (m.failedChecks.length > 0 ? "Medium" : "Low");
                return (
                  <tr
                    key={m.moduleName}
                    onClick={() => (m.issues.length > 0 || m.failedChecks.length > 0) && setActiveModule(m)}
                    className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors group"
                  >
                    <td className="py-2 px-2 text-white/70 max-w-[200px] truncate group-hover:text-indigo-300">
                      {m.moduleName}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${SEVERITY_STYLES[severity] || SEVERITY_STYLES.Low}`}>
                        {severity}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-white/60 font-mono">{m.issues.length || "—"}</td>
                    <td className="py-2 px-2 text-center text-white/50 font-mono">
                      {m.failedChecks.length > 0 ? m.failedChecks.length : "—"}
                    </td>
                    <td className="py-2 px-2 text-center text-white/50 text-[10px]">
                      {topIssue ? PHASE_LABELS[topIssue.phase] || `Phase ${topIssue.phase}` : "—"}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-indigo-400 group-hover:text-indigo-300">
                        Open <ChevronRight size={9} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <ShieldCheck size={28} className="text-emerald-400/40 mx-auto mb-2" />
            <p className="text-xs text-emerald-400 font-medium">All modules pass certification — no unresolved issues.</p>
          </div>
        )}
      </div>

      {/* Per-module drill-down */}
      {activeModule && (
        <ModuleDetailDrawer module={activeModule} onClose={() => setActiveModule(null)} />
      )}
    </MetadataDrawer>
  );
}

/**
 * Per-module drill-down — shows all issues and failed checks for a single module.
 */
function ModuleDetailDrawer({ module, onClose }) {
  return (
    <MetadataDrawer
      title={module.moduleName}
      subtitle="Module Dependency Diagnostics™"
      icon={Boxes}
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Failed checks */}
        {module.failedChecks.length > 0 && (
          <div>
            <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">
              Failed Discoverability Checks
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {module.failedChecks.map((check) => (
                <span
                  key={check}
                  className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/15"
                >
                  {check}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {module.issues.length > 0 ? (
          <div>
            <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">
              Certification Issues ({module.issues.length})
            </h4>
            <div className="space-y-2">
              {module.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.02] border border-white/5 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.Low}`}>
                      {issue.severity}
                    </span>
                    <span className="text-[9px] text-white/30">
                      {PHASE_LABELS[issue.phase] || `Phase ${issue.phase}`}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 mb-2">{issue.description}</p>
                  <div className="flex items-start gap-1.5">
                    <Wrench size={11} className="text-emerald-400/60 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-emerald-400/70">{issue.remediation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertTriangle size={20} className="text-amber-400/40 mx-auto mb-2" />
            <p className="text-xs text-white/50">
              Module has failed discoverability checks but no explicit certification issues.
            </p>
          </div>
        )}
      </div>
    </MetadataDrawer>
  );
}

function SummaryStat({ label, value, icon: Icon, color, bg, border }) {
  return (
    <div className={`${bg} ${border} border rounded-lg p-3`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] text-white/40 uppercase tracking-wider">{label}</span>
        <Icon size={12} className={color} />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}