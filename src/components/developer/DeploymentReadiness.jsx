import React, { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { computeDeploymentReadiness } from "@/lib/deploymentReadinessEngine";
import { applyRepairs, invalidateManifestCache } from "@/lib/platformManifest";
import DeploymentReadinessDetail from "./DeploymentReadinessDetail";
import {
  CheckCircle2, AlertTriangle, XCircle, Rocket, ShieldCheck,
  FileText, Network, Package, Layers, Code2, Users, Boxes, Brain, Settings,
  ChevronRight,
} from "lucide-react";

const ICON_MAP = { FileText, Network, Package, Layers, Code2, Users, Boxes, Brain, Settings, ShieldCheck };

function exportJSON(check) {
  const blob = new Blob([JSON.stringify(check, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${check.id}-diagnostic-report.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportCSV(check) {
  const rows = [
    ["Field", "Value"],
    ["Check", check.label], ["Panel Title", check.panelTitle], ["Status", check.status],
    ["Severity", check.severity], ["Health Score", check.healthScore],
    ["Summary", check.summary.detail], ["Affected Count", check.affectedCount],
    ["Can Repair", check.canRepair], ["Repairable Findings", check.repairableFindings.length],
    ["Last Validated", check.lastValidated],
  ];
  check.evidence.failed.forEach((f) => rows.push(["Failed Evidence", f.message]));
  check.recommendedActions.forEach((a) => rows.push(["Recommended Action", a]));
  check.dependencies.upstream.forEach((d) => rows.push(["Upstream Dependency", d]));
  check.dependencies.downstream.forEach((d) => rows.push(["Downstream Dependency", d]));
  check.impact.affectedComponents.forEach((c) => rows.push(["Affected Component", c]));
  check.auditHistory.forEach((h) => rows.push(["Audit Entry", `${h.action || h.issue} (${h.timestamp})`]));

  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${check.id}-diagnostic-report.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function exportPDF(check) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(14); doc.text(check.panelTitle, 20, y); y += 8;
    doc.setFontSize(9);
    doc.text(`Status: ${check.status.toUpperCase()}`, 20, y); y += 5;
    doc.text(`Severity: ${check.severity}`, 20, y); y += 5;
    doc.text(`Health Score: ${check.healthScore}%`, 20, y); y += 5;
    doc.text(`Summary: ${check.summary.detail}`, 20, y); y += 5;
    doc.text(`Affected Components: ${check.affectedCount}`, 20, y); y += 5;
    doc.text(`Last Validated: ${check.lastValidated}`, 20, y); y += 8;
    doc.setFontSize(11); doc.text("Details", 20, y); y += 6; doc.setFontSize(9);
    Object.entries(check.details).forEach(([k, v]) => {
      doc.text(`${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`, 20, y); y += 5;
    });
    y += 3; doc.setFontSize(11); doc.text("Evidence", 20, y); y += 6; doc.setFontSize(9);
    check.evidence.passed.forEach((e) => { doc.text(`[PASS] ${e}`, 20, y); y += 5; });
    check.evidence.failed.forEach((e) => { doc.text(`[FAIL] ${e.message}`, 20, y); y += 5; });
    y += 3; doc.setFontSize(11); doc.text("Impact", 20, y); y += 6; doc.setFontSize(9);
    const impactLines = doc.splitTextToSize(check.impact.description, 170);
    impactLines.forEach((line) => { doc.text(line, 20, y); y += 5; });
    y += 3; doc.setFontSize(11); doc.text("Recommended Actions", 20, y); y += 6; doc.setFontSize(9);
    check.recommendedActions.forEach((a, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${a}`, 170);
      lines.forEach((line) => { doc.text(line, 20, y); y += 5; });
    });
    doc.save(`${check.id}-diagnostic-report.pdf`);
  } catch (e) {
    console.error("PDF export failed:", e);
  }
}

export default function DeploymentReadiness() {
  const [activeCheckId, setActiveCheckId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [repairResult, setRepairResult] = useState(null);

  const { checks, summary } = useMemo(() => computeDeploymentReadiness(), [refreshKey]);
  const activeCheck = checks.find((c) => c.id === activeCheckId);

  const handleRepair = useCallback((checkId) => {
    const check = checks.find((c) => c.id === checkId);
    if (!check?.repairableFindings?.length) return;
    const logs = applyRepairs(check.repairableFindings);
    invalidateManifestCache();
    setRepairResult({ checkId, logs, timestamp: new Date().toISOString() });
    setRefreshKey((k) => k + 1);
  }, [checks]);

  const handleExport = useCallback((check, format) => {
    if (format === "json") exportJSON(check);
    else if (format === "csv") exportCSV(check);
    else if (format === "pdf") exportPDF(check);
  }, []);

  const statusConfig = {
    pass: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
    warn: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10" },
    fail: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/10" },
  };

  return (
    <div className="space-y-4">
      {/* Readiness Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${
        summary.ready ? "bg-emerald-500/5 border-emerald-500/10" :
        summary.canDeploy ? "bg-amber-500/5 border-amber-500/10" :
        "bg-red-500/5 border-red-500/10"
      }`}>
        <Rocket size={24} className={summary.ready ? "text-emerald-400" : summary.canDeploy ? "text-amber-400" : "text-red-400"} />
        <div className="flex-1">
          <div className="text-white font-semibold">
            {summary.ready ? "Ready for Deployment" : summary.canDeploy ? "Deployable with Warnings" : "Deployment Blocked"}
          </div>
          <div className="text-white/40 text-xs">
            {summary.passed} passed · {summary.warned} warnings · {summary.failed} failures
            {summary.activeRepairs > 0 && ` · ${summary.activeRepairs} active repairs`}
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/60 text-xs">Readiness</div>
          <div className={`font-bold text-lg ${summary.ready ? "text-emerald-400" : summary.canDeploy ? "text-amber-400" : "text-red-400"}`}>
            {summary.healthScore}%
          </div>
        </div>
      </div>

      {/* Interactive Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map((check) => {
          const cfg = statusConfig[check.status];
          const Icon = ICON_MAP[check.iconName] || ShieldCheck;
          return (
            <button
              key={check.id}
              onClick={() => { setRepairResult(null); setActiveCheckId(check.id); }}
              className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg} ${cfg.border} hover:bg-white/[0.04] transition-colors text-left group`}
            >
              <cfg.icon size={16} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm font-medium">{check.label}</span>
                  <Icon size={10} className="text-white/20" />
                </div>
                <div className="text-white/40 text-xs mt-0.5">{check.summary.detail}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.border} ${cfg.color}`}>{check.severity}</span>
                  {check.canRepair && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                      <ShieldCheck size={8} /> Repairable
                    </span>
                  )}
                  <span className="text-[9px] text-white/30">{check.affectedCount} affected</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0 mt-1" />
            </button>
          );
        })}
      </div>

      {/* Slide-in Detail Panel */}
      <AnimatePresence>
        {activeCheck && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveCheckId(null)}
            />
            <motion.div
              className="relative w-full max-w-[600px] bg-[#0a0a0f] border-l border-white/10 overflow-y-auto h-full"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button
                onClick={() => setActiveCheckId(null)}
                className="sticky top-0 z-10 w-full flex items-center gap-2 px-5 py-3 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/10 text-white/60 hover:text-white text-sm"
              >
                <ChevronRight size={14} className="rotate-180" />
                Close Diagnostic Panel
              </button>
              <DeploymentReadinessDetail
                check={activeCheck}
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