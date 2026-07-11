import React, { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePlatformState } from "@/lib/PlatformStateContext";
import { useGuardian } from "@/lib/GuardianContext";
import { computeMissionControl } from "@/lib/missionControlEngine";
import { computeDeploymentReadiness } from "@/lib/deploymentReadinessEngine";
import { applyRepairs, invalidateManifestCache } from "@/lib/platformManifest";
import ExecutiveOperationsRibbon from "./ExecutiveOperationsRibbon";
import GovernanceDomainCard from "./GovernanceDomainCard";
import GovernanceDomainPanel from "./GovernanceDomainPanel";
import GovernanceCertificationBanner from "./GovernanceCertificationBanner";
import { useGovernancePipeline } from "@/lib/GovernancePipelineContext";
import { Gauge, ChevronRight } from "lucide-react";

function exportJSON(domain) {
  const blob = new Blob([JSON.stringify(domain, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${domain.id}-operational-report.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportCSV(domain) {
  const rows = [
    ["Field", "Value"],
    ["Domain", domain.name], ["Category", domain.category], ["Owner", domain.owner],
    ["Status", domain.status], ["Severity", domain.severity], ["Health Score", domain.healthScore],
    ["Maturity Level", domain.maturity.level], ["Maturity Label", domain.maturity.label],
    ["Summary", domain.summary.detail], ["Affected Count", domain.impact.affectedCount],
    ["Can Repair", domain.canRepair], ["Repairable Findings", domain.repairableFindings.length],
    ["Last Validated", domain.lastValidated],
  ];
  domain.summary.metrics.forEach((m) => rows.push([`Metric: ${m.label}`, m.value]));
  domain.rootCause.factors.forEach((f) => rows.push(["Root Cause Factor", f]));
  domain.impact.affectedComponents.forEach((c) => rows.push(["Affected Component", c]));
  domain.dependencies.upstream.forEach((d) => rows.push(["Upstream Dependency", d]));
  domain.dependencies.downstream.forEach((d) => rows.push(["Downstream Dependency", d]));
  domain.recommendedActions.forEach((a) => rows.push(["Recommended Action", a]));
  domain.maturity.requirements.forEach((r) => rows.push(["Maturity Requirement", r]));
  domain.auditHistory.forEach((h) => rows.push(["Audit Entry", `${h.action || h.issue} (${h.timestamp})`]));
  domain.timeline.forEach((t) => rows.push(["Timeline Event", `${t.event} (${t.timestamp})`]));

  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${domain.id}-operational-report.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function exportPDF(domain) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(14); doc.text(domain.name, 20, y); y += 8;
    doc.setFontSize(9);
    doc.text(`Status: ${domain.status.toUpperCase()}  |  Severity: ${domain.severity}`, 20, y); y += 5;
    doc.text(`Health Score: ${domain.healthScore}%  |  Maturity: L${domain.maturity.level} (${domain.maturity.label})`, 20, y); y += 5;
    doc.text(`Owner: ${domain.owner}  |  Category: ${domain.category}`, 20, y); y += 5;
    doc.text(`Last Validated: ${domain.lastValidated}`, 20, y); y += 8;

    doc.setFontSize(11); doc.text("Executive Summary", 20, y); y += 6; doc.setFontSize(9);
    const sumLines = doc.splitTextToSize(domain.summary.detail, 170);
    sumLines.forEach((l) => { doc.text(l, 20, y); y += 5; });
    domain.summary.metrics.forEach((m) => { doc.text(`  ${m.label}: ${m.value}`, 20, y); y += 5; });
    y += 3;

    doc.setFontSize(11); doc.text("Root Cause Analysis", 20, y); y += 6; doc.setFontSize(9);
    const rcLines = doc.splitTextToSize(domain.rootCause.description, 170);
    rcLines.forEach((l) => { doc.text(l, 20, y); y += 5; });
    domain.rootCause.factors.forEach((f) => { doc.text(`  • ${f}`, 20, y); y += 5; });
    y += 3;

    doc.setFontSize(11); doc.text("Impact Assessment", 20, y); y += 6; doc.setFontSize(9);
    const impLines = doc.splitTextToSize(domain.impact.description, 170);
    impLines.forEach((l) => { doc.text(l, 20, y); y += 5; });
    doc.text(`Affected Components: ${domain.impact.affectedComponents.join(", ")}`, 20, y); y += 5;
    doc.text(`Affected Count: ${domain.impact.affectedCount}`, 20, y); y += 8;

    doc.setFontSize(11); doc.text("Maturity Model", 20, y); y += 6; doc.setFontSize(9);
    doc.text(`Current: L${domain.maturity.level} (${domain.maturity.label})`, 20, y); y += 5;
    if (domain.maturity.nextLevel) { doc.text(`Next: L${domain.maturity.nextLevel} (${domain.maturity.nextLabel})`, 20, y); y += 5; }
    doc.text(`Estimated Time: ${domain.maturity.estimatedTime}`, 20, y); y += 5;
    doc.text(`Progress: ${domain.maturity.progress}%`, 20, y); y += 5;
    domain.maturity.requirements.forEach((r) => { doc.text(`  • ${r}`, 20, y); y += 5; });
    y += 3;

    doc.setFontSize(11); doc.text("Recommended Actions", 20, y); y += 6; doc.setFontSize(9);
    domain.recommendedActions.forEach((a, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${a}`, 170);
      lines.forEach((l) => { doc.text(l, 20, y); y += 5; });
    });
    y += 3;

    doc.setFontSize(11); doc.text("Dependencies", 20, y); y += 6; doc.setFontSize(9);
    doc.text("Upstream:", 20, y); y += 5;
    doc.text(`  ${domain.dependencies.upstream.join(", ")}`, 20, y); y += 5;
    doc.text("Downstream:", 20, y); y += 5;
    doc.text(`  ${domain.dependencies.downstream.join(", ")}`, 20, y); y += 5;

    doc.save(`${domain.id}-operational-report.pdf`);
  } catch (e) {
    console.error("PDF export failed:", e);
  }
}

export default function MissionControlConsole() {
  const state = usePlatformState();
  const guardian = useGuardian();
  const { certificate, pipelineRunning, runPipeline } = useGovernancePipeline();
  const [activeDomainId, setActiveDomainId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [repairResult, setRepairResult] = useState(null);

  const { domains, ribbon, summary } = useMemo(() => {
    const deployment = computeDeploymentReadiness();
    return computeMissionControl(state, guardian, deployment.summary);
  }, [state, guardian, refreshKey]);

  const activeDomain = domains.find((d) => d.id === activeDomainId);

  const handleRepair = useCallback((domainId) => {
    const domain = domains.find((d) => d.id === domainId);
    if (!domain?.repairableFindings?.length) return;
    const logs = applyRepairs(domain.repairableFindings);
    invalidateManifestCache();
    setRepairResult({ domainId, logs, timestamp: new Date().toISOString() });
    setRefreshKey((k) => k + 1);
  }, [domains]);

  const handleExport = useCallback((domain, format) => {
    if (format === "json") exportJSON(domain);
    else if (format === "csv") exportCSV(domain);
    else if (format === "pdf") exportPDF(domain);
  }, []);

  return (
    <div className="space-y-4">
      {/* Governance Certification Banner */}
      <GovernanceCertificationBanner
        certificate={certificate}
        pipelineRunning={pipelineRunning}
        onRefresh={() => runPipeline("manual")}
      />

      {/* Executive Operations Ribbon */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Gauge size={14} className="text-emerald-400" />
          <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">Executive Operations Ribbon</h3>
          <span className="text-[10px] text-white/30">— The operational heartbeat of EXECLEAD.AI</span>
        </div>
        <ExecutiveOperationsRibbon ribbon={ribbon} />
      </div>

      {/* Overall Summary Banner */}
      <div className="flex items-center gap-4 p-3 rounded-xl border bg-white/[0.02] border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 uppercase">Platform Maturity</span>
          <span className="text-sm font-bold text-cyan-400">L{summary.overallMaturity} — {summary.maturityLabel}</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 uppercase">Overall Health</span>
          <span className="text-sm font-bold text-white">{summary.overallHealth}%</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 uppercase">Total Issues</span>
          <span className="text-sm font-bold text-amber-400">{summary.totalIssues}</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 uppercase">Repairable Domains</span>
          <span className="text-sm font-bold text-emerald-400">{summary.repairableDomains}</span>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] text-white/30">{summary.totalDomains} governance domains</span>
      </div>

      {/* Governance Domain Grid */}
      <div>
        <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">Governance Domains — Interactive Operations Console</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {domains.map((domain) => (
            <GovernanceDomainCard
              key={domain.id}
              domain={domain}
              onClick={() => { setRepairResult(null); setActiveDomainId(domain.id); }}
            />
          ))}
        </div>
      </div>

      {/* Slide-in Operational Panel */}
      <AnimatePresence>
        {activeDomain && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveDomainId(null)}
            />
            <motion.div
              className="relative w-full max-w-[600px] bg-[#0a0a0f] border-l border-white/10 overflow-y-auto h-full"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button
                onClick={() => setActiveDomainId(null)}
                className="sticky top-0 z-10 w-full flex items-center gap-2 px-5 py-3 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/10 text-white/60 hover:text-white text-sm"
              >
                <ChevronRight size={14} className="rotate-180" />
                Close Operational Workspace
              </button>
              <GovernanceDomainPanel
                domain={activeDomain}
                onRepair={handleRepair}
                onExport={handleExport}
                repairResult={repairResult}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}