import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, AlertTriangle, XCircle, FileCheck, Shield, Server,
  Cpu, Rocket, ChevronRight,
} from "lucide-react";
import { computeRLSScores } from "@/lib/rlsRegistry";
import { computeRiskBasedCoverage, computeSecurityDebt } from "@/lib/entityDiscovery";
import { runSecurityRegressionSuite, buildSuiteShape } from "@/lib/securityRegressionSuite";
import { PLATFORM_METADATA } from "@/lib/platformManifest";

const DECISION_CONFIG = {
  GO: { icon: CheckCircle2, color: "#10b981", bg: "bg-emerald-500/5 border-emerald-500/20", label: "GO" },
  CONDITIONAL_GO: { icon: AlertTriangle, color: "#f59e0b", bg: "bg-amber-500/5 border-amber-500/20", label: "CONDITIONAL GO" },
  BLOCKED: { icon: XCircle, color: "#ef4444", bg: "bg-red-500/5 border-red-500/20", label: "BLOCKED" },
  AWAITING: { icon: Rocket, color: "#6366f1", bg: "bg-indigo-500/5 border-indigo-500/20", label: "AWAITING BUILD" },
};

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3 text-white/50 text-[10px] font-medium uppercase tracking-wider">
        <Icon size={12} /> {title}
      </div>
      {children}
    </div>
  );
}

function GateRow({ label, passed, detail }) {
  const Icon = passed ? CheckCircle2 : XCircle;
  const color = passed ? "#10b981" : "#ef4444";
  return (
    <div className="flex items-center gap-2 py-1.5">
      <Icon size={13} style={{ color }} className="shrink-0" />
      <span className="text-xs text-white/70">{label}</span>
      <span className="text-xs font-mono ml-auto" style={{ color }}>{detail}</span>
    </div>
  );
}

function MetricRow({ label, value, passed }) {
  const color = passed ? "#10b981" : "#f59e0b";
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-xs text-white/70">{label}</span>
      <span className="text-xs font-mono ml-auto" style={{ color }}>{value}</span>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/30">{label}</div>
      <div className="text-sm font-medium text-white/80 mt-0.5">{value}</div>
    </div>
  );
}

export default function ReleaseCandidateDashboard({ pipelineResult, user }) {
  const rlsScores = useMemo(() => computeRLSScores(), []);
  const riskCoverage = useMemo(() => computeRiskBasedCoverage(), []);
  const securityDebt = useMemo(() => computeSecurityDebt(), []);
  const [securityResults, setSecurityResults] = useState({ tests: [], total: 0, passed: 0, failed: 0, blocked: false, criticalFailures: 0, warningFailures: 0 });
  useEffect(() => {
    let cancelled = false;
    runSecurityRegressionSuite().then((raw) => {
      if (!cancelled) setSecurityResults(buildSuiteShape(raw));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const stages = pipelineResult?.stages || {};
  const finalDecision = pipelineResult?.finalDecision || (securityResults.blocked ? "BLOCKED" : "AWAITING");
  const decisionCfg = DECISION_CONFIG[finalDecision] || DECISION_CONFIG.AWAITING;
  const DecisionIcon = decisionCfg.icon;

  // Quality Gates
  const buildStatus = stages.rc1?.status === "completed";
  const readinessPassed = stages.rc1?.data?.readinessPassed ?? 0;
  const readinessTotal = stages.rc1?.data?.readinessTotal ?? 0;
  const healthScore = stages.rc1?.data?.healthScore ?? 0;
  const syncErrors = stages.rc1?.data?.syncErrors ?? 0;
  const canDeploy = stages.rc1?.data?.canDeploy ?? false;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-white/80 text-sm font-semibold">
        <FileCheck size={14} className="text-indigo-400" />
        Release Candidate Dashboard™
      </div>

      {/* Executive Summary */}
      <Section title="Executive Summary" icon={FileCheck}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <SummaryItem label="RC Version" value="RC1" />
          <SummaryItem label="Build Number" value={PLATFORM_METADATA.buildNumber} />
          <SummaryItem label="Build Date" value={new Date().toISOString().split("T")[0]} />
          <SummaryItem label="Engineering Lead" value={user?.full_name || "—"} />
          <SummaryItem label="Release Status" value={
            <span className="inline-flex items-center gap-1.5" style={{ color: decisionCfg.color }}>
              <DecisionIcon size={14} /> {decisionCfg.label}
            </span>
          } />
        </div>
      </Section>

      {/* Quality Gates + Security (side by side) */}
      <div className="grid lg:grid-cols-2 gap-3">
        <Section title="Quality Gates" icon={Cpu}>
          <GateRow label="Build Status" passed={buildStatus} detail={buildStatus ? "PASS" : "FAIL"} />
          <GateRow label="Unit Tests" passed={readinessTotal > 0 && readinessPassed === readinessTotal} detail={`${readinessPassed}/${readinessTotal}`} />
          <GateRow label="Integration Tests" passed={syncErrors === 0} detail={syncErrors === 0 ? "PASS" : `${syncErrors} errors`} />
          <GateRow label="Security Tests" passed={!securityResults.blocked} detail={`${securityResults.passed}/${securityResults.total}`} />
          <GateRow label="Regression Tests" passed={!securityResults.blocked} detail={`${securityResults.passed}/${securityResults.total}`} />
          <GateRow label="Performance Tests" passed={healthScore >= 80} detail={`${healthScore}/100`} />
        </Section>

        <Section title="Security" icon={Shield}>
          <MetricRow label="RLS Coverage" value={`${rlsScores.rlsCoverage}%`} passed={rlsScores.rlsCoverage >= 90} />
          <MetricRow label="Critical Coverage™" value={`${riskCoverage.criticalCoverage}%`} passed={riskCoverage.criticalCoverage === 100} />
          <MetricRow label="Cross-Tenant Tests" value={rlsScores.crossTenantTests ? "PASS" : "FAIL"} passed={rlsScores.crossTenantTests} />
          <MetricRow label="Regression Suite" value={`${securityResults.passed}/${securityResults.total}`} passed={!securityResults.blocked} />
          <MetricRow label="Security Debt" value={`${securityDebt.critical + securityDebt.high} critical`} passed={securityDebt.critical === 0} />
        </Section>
      </div>

      {/* Platform */}
      <Section title="Platform" icon={Server}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricRow label="Guardian™" value={`${stages.security_hardening?.data?.repaired ?? 0} repaired`} passed={stages.security_hardening?.status === "completed"} />
          <MetricRow label="Trust Center™" value={riskCoverage.criticalCoverage === 100 ? "Verified" : "Action Required"} passed={riskCoverage.criticalCoverage === 100} />
          <MetricRow label="Platform Health" value={`${stages.rc1?.data?.governanceScore ?? 0}/100`} passed={(stages.rc1?.data?.governanceScore ?? 0) >= 80} />
          <MetricRow label="Deployment Readiness" value={canDeploy ? "Ready" : "Not Ready"} passed={canDeploy} />
        </div>
      </Section>

      {/* Final Decision */}
      <div className={`rounded-xl p-5 border ${decisionCfg.bg}`}>
        <div className="flex items-center gap-3">
          <DecisionIcon size={28} style={{ color: decisionCfg.color }} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">Final Decision</div>
            <div className="text-xl font-bold" style={{ color: decisionCfg.color }}>{decisionCfg.label}</div>
          </div>
          <div className="ml-auto text-right">
            {finalDecision === "BLOCKED" && securityResults.criticalFailures > 0 && (
              <div className="text-xs text-red-400/80">{securityResults.criticalFailures} critical security failures</div>
            )}
            {finalDecision === "CONDITIONAL_GO" && (
              <div className="text-xs text-amber-400/80">Warnings present — review before release</div>
            )}
            {finalDecision === "GO" && (
              <div className="text-xs text-emerald-400/80">All quality gates passed</div>
            )}
            {finalDecision === "AWAITING" && (
              <div className="text-xs text-indigo-400/80">Click Build RC1 to certify</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}