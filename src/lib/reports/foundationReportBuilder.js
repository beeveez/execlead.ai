import { computeFoundationCertification, computeMetricDiagnostics, computeEngineeringTaskRegistry, computeFailureRegistry, computeRiskMatrix } from "@/lib/foundationCertificationEngine";
import { computeReleaseStage } from "@/lib/releaseStageEngine";
import { buildReportId } from "../enterpriseReportEngine";
import { PLATFORM_METADATA } from "@/lib/platformManifest";

export async function buildFoundationReport(reportType = "architecture") {
  const cert = computeFoundationCertification();
  const stage = computeReleaseStage();
  const allIssues = cert.verification.issues;
  const taskRegistry = computeEngineeringTaskRegistry(cert);
  const failureRegistry = computeFailureRegistry(cert);
  const riskMatrix = computeRiskMatrix(cert);

  return {
    reportId: buildReportId("foundation"),
    reportType,
    title: "Foundation Certification Report™",
    subtitle: "Universal Explainable Metrics™ — Foundation Governance",
    cover: {
      reportName: "Foundation Certification Report™",
      reportType,
      platformVersion: PLATFORM_METADATA.platformVersion,
      executionStage: stage.currentStage,
      buildNumber: cert.buildNumber,
      environment: PLATFORM_METADATA.environment || "production",
      generatedDate: new Date().toLocaleDateString(),
      generatedBy: "Foundation Certification Engine™",
      preparedFor: "Platform Engineering & Release Engineering",
      classification: "Internal",
      generatedTimestamp: new Date().toISOString(),
      scores: {
        foundationScore: cert.foundationScore,
        certificationStatus: cert.certified ? "Certified" : "Blocked",
        remainingTasks: cert.remainingTasks,
        blockingDomains: cert.blockingDomains.length,
        nextStage: stage.nextMilestone,
        totalScoreGain: taskRegistry.totalScoreGain,
        maxPotentialScore: taskRegistry.maxPotentialScore,
        top10Gain: taskRegistry.tasks.slice(0, 10).reduce((s, t) => s + t.scoreGain, 0),
      },
    },
    sections: [
      {
        id: "exec_summary",
        type: "executive_summary",
        title: "Executive Summary",
        data: {
          summary: `Foundation Certification™ is at ${cert.foundationScore}/${cert.requiredThreshold}. ${cert.remainingTasks} tasks remaining across ${cert.blockingDomains.length} blocking domains. Current execution stage: ${stage.currentStage}. Next stage: ${stage.nextMilestone}. ${cert.certified ? "Platform is CERTIFIED." : "Platform is BLOCKED — certification score below threshold."}`,
          headline: `${cert.foundationScore}/${cert.requiredThreshold} Foundation Score`,
          status: cert.certified ? "pass" : "warn",
          keyMetrics: [
            { label: "Foundation Score", value: `${cert.foundationScore}` },
            { label: "Required", value: `${cert.requiredThreshold}` },
            { label: "Remaining", value: `${Math.max(0, cert.requiredThreshold - cert.foundationScore)} pts` },
            { label: "Blocking Domains", value: cert.blockingDomains.length },
            { label: "Remaining Tasks", value: cert.remainingTasks },
            { label: "Est. Completion", value: cert.estimatedCompletion },
          ],
        },
      },
      {
        id: "snapshots",
        type: "snapshots",
        title: "Certification Metrics Snapshot",
        data: {
          title: "7 Certification Metrics",
          snapshot: cert.metrics.map((m) => ({
            label: m.label,
            value: `${m.value}%`,
            detail: `${m.value}/${m.threshold}${m.exact ? " =" : " ≥"}`,
            status: m.passed ? "pass" : "fail",
          })),
        },
      },
      {
        id: "findings",
        type: "findings",
        title: "Certification Issues & Blockers",
        data: {
          title: "All Certification Issues",
          findings: allIssues.map((issue, i) => ({
            id: `issue-${i}`,
            severity: issue.severity === "Critical" ? "critical" : issue.severity === "High" ? "high" : issue.severity === "Medium" ? "medium" : "low",
            title: `${issue.component} — ${issue.categoryLabel || "Uncategorized"}`,
            detail: issue.description,
            category: issue.categoryLabel || issue.phase ? `Phase ${issue.phase}` : "General",
            owner: "Platform Engineering",
            status: "open",
          })),
        },
      },
      {
        id: "metrics",
        type: "metrics",
        title: "Metric Diagnostics",
        data: {
          title: "Per-Metric Diagnostics",
          metrics: cert.metrics.map((m) => {
            const d = computeMetricDiagnostics(cert, m.key);
            return { label: m.label, value: m.value, target: m.threshold, unit: "%", estimatedHours: d?.estimatedHours || 0 };
          }),
        },
      },
      {
        id: "engineering_tasks",
        type: "findings",
        title: "Engineering Task Registry™ — Score Gain Prioritization",
        data: {
          title: "All Engineering Tasks with Score Gain",
          findings: taskRegistry.tasks.map((t, i) => ({
            id: `task-${i}`,
            severity: t.severity === "Critical" ? "critical" : t.severity === "High" ? "high" : t.severity === "Medium" ? "medium" : "low",
            title: `${t.task} — Score Gain: +${t.scoreGain}%`,
            detail: `Module: ${t.module} | Category: ${t.category} | Priority: ${t.priority} | Est: ${t.estimatedMinutes} min | Potential: ${t.potentialScoreGain}%`,
            category: t.category,
            owner: t.owner,
            status: t.status,
          })),
        },
      },
      {
        id: "failure_registry",
        type: "findings",
        title: "Failure Registry™",
        data: {
          title: "Module Failures Grouped by Component",
          findings: failureRegistry.flatMap((g) => g.failures.map((f, i) => ({
            id: `failure-${g.module}-${i}`,
            severity: f.severity === "Critical" ? "critical" : f.severity === "High" ? "high" : "medium",
            title: `${g.module} — ${f.description}`,
            detail: `Expected: ${f.expectedValue} | Current: ${f.currentValue} | Repair: ${f.repairPatch}`,
            category: f.categoryLabel || "General",
            owner: "Platform Engineering",
            status: "open",
          }))),
        },
      },
      {
        id: "risk_matrix",
        type: "risk_matrix",
        title: "Risk Matrix™",
        data: {
          title: "Certification Risks with Impact Analysis",
          risks: riskMatrix.map((r) => ({
            label: r.label,
            severity: r.severity,
            description: r.description,
            affectedModules: r.affectedModules,
            affectedFeatures: r.affectedFeatures,
            estimatedImpact: r.estimatedImpact,
            mitigation: r.mitigation,
            timeline: r.timeline,
            owner: r.owner,
            scoreImpact: r.scoreImpact,
          })),
        },
      },
      {
        id: "verification",
        type: "verification",
        title: "Digital Verification",
        data: {
          reportId: buildReportId("foundation"),
          generatedAt: new Date().toISOString(),
          engineVersion: "Foundation Certification Engine™ v2.0",
          executionStage: stage.currentStage,
          nextStage: stage.nextMilestone,
          verified: cert.certified,
        },
      },
    ],
    execAnalysis: {
      prompt: `Analyze Foundation Certification at ${cert.foundationScore}/${cert.requiredThreshold}: ${cert.remainingTasks} tasks, ${cert.blockingDomains.length} blocking domains, stage ${stage.currentStage}.`,
    },
  };
}