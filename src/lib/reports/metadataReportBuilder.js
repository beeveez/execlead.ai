/**
 * Metadata Governance Center™ — Report Definition Builder
 * Builds report definitions for the Enterprise Report Engine™.
 * Consumed by <ReportToolbar reportBuilder={buildMetadataReport} />
 */
import { computeMetadataCompletion, buildMissingEntriesTable, buildOrphanRegistry } from "@/lib/metadataCompletionEngine";
import { buildReportId } from "./enterpriseReportEngine";
import { PLATFORM_METADATA } from "@/lib/platformManifest";

export async function buildMetadataReport(reportType = "metadata_completion") {
  const report = computeMetadataCompletion();
  const missingEntries = buildMissingEntriesTable(report);
  const orphans = buildOrphanRegistry(report);

  return {
    reportId: buildReportId("metadata"),
    reportType,
    title: "Platform Metadata Completion Report™",
    subtitle: "Metadata Governance Center™ — Universal Explainable Metrics™",
    cover: {
      reportName: "Platform Metadata Completion Report™",
      reportType,
      platformVersion: PLATFORM_METADATA.platformVersion,
      configVersion: report.configVersion,
      buildNumber: report.buildNumber,
      environment: PLATFORM_METADATA.environment || "production",
      generatedDate: new Date().toLocaleDateString(),
      generatedBy: "Metadata Governance Center™",
      preparedFor: "Platform Engineering & Release Engineering",
      classification: "Internal",
      generatedTimestamp: new Date().toISOString(),
      scores: {
        overallScore: report.overallCoverage,
        certificationStatus: report.overallCoverage === 100 ? "Certified" : "In Progress",
        productionStatus: report.overallCoverage >= 90 ? "Production Ready" : "Blocked",
        enterpriseReadiness: report.platformGovernanceScore,
      },
    },
    sections: [
      {
        id: "exec_summary",
        type: "executive_summary",
        title: "Executive Summary",
        data: {
          summary: `Platform Metadata Completion is at ${report.overallCoverage}%. ${report.totalMissingEntries} missing entries and ${report.totalOrphanRecords} orphan records remain. EXEC™ Explainability: ${report.explainabilityScore}%. Platform Discoverability: ${report.discoverabilityScore}%. Platform Governance: ${report.platformGovernanceScore}%.`,
          headline: `${report.overallCoverage}% Metadata Coverage`,
          status: report.overallCoverage === 100 ? "pass" : "warn",
          keyMetrics: [
            { label: "Overall Coverage", value: `${report.overallCoverage}%` },
            { label: "Missing Entries", value: report.totalMissingEntries },
            { label: "Orphan Records", value: report.totalOrphanRecords },
            { label: "Explainability", value: `${report.explainabilityScore}%` },
            { label: "Discoverability", value: `${report.discoverabilityScore}%` },
            { label: "Governance", value: `${report.platformGovernanceScore}%` },
          ],
        },
      },
      {
        id: "snapshots",
        type: "snapshots",
        title: "Metadata Coverage Snapshot",
        data: {
          title: "Registry Coverage",
          snapshot: [
            { label: "Routes™", value: `${report.routeCoverage.pct}%`, detail: `${report.routeCoverage.complete}/${report.routeCoverage.total}`, status: report.routeCoverage.pct === 100 ? "pass" : "warn" },
            { label: "Modules™", value: `${report.moduleCoverage.pct}%`, detail: `${report.moduleCoverage.complete}/${report.moduleCoverage.total}`, status: report.moduleCoverage.pct === 100 ? "pass" : "warn" },
            { label: "Capabilities™", value: `${report.capabilityCoverage.pct}%`, detail: `${report.capabilityCoverage.complete}/${report.capabilityCoverage.total}`, status: report.capabilityCoverage.pct === 100 ? "pass" : "warn" },
            { label: "Frameworks™", value: `${report.frameworkCoverage.pct}%`, detail: `${report.frameworkCoverage.complete}/${report.frameworkCoverage.total}`, status: report.frameworkCoverage.pct === 100 ? "pass" : "warn" },
            { label: "Personas™", value: `${report.personaCoverage.pct}%`, detail: `${report.personaCoverage.complete}/${report.personaCoverage.total}`, status: report.personaCoverage.pct === 100 ? "pass" : "warn" },
            { label: "Knowledge™", value: `${report.knowledgeCoverage.pct}%`, detail: `${report.knowledgeCoverage.covered}/${report.knowledgeCoverage.total}`, status: report.knowledgeCoverage.pct === 100 ? "pass" : "warn" },
            { label: "Manifest™", value: `${report.manifestValidation.errors === 0 ? 100 : Math.max(0, 100 - report.manifestValidation.errors * 10)}%`, detail: `${report.manifestValidation.totalFindings} findings`, status: report.manifestValidation.errors === 0 ? "pass" : "fail" },
          ],
        },
      },
      {
        id: "findings",
        type: "findings",
        title: "Missing Entries & Orphan Records",
        data: {
          title: "Metadata Findings",
          findings: [
            ...missingEntries.slice(0, 100).map((e) => ({
              id: `${e.entity}-${e.field}`,
              severity: e.severity,
              title: `${e.type}: ${e.entity} — missing ${e.field}`,
              detail: e.repairAction,
              category: e.type,
              owner: e.owner,
              status: e.status,
            })),
            ...orphans.all.map((o) => ({
              id: `orphan-${o.id}`,
              severity: "high",
              title: `Orphan: ${o.name} (${o.category})`,
              detail: o.detail,
              category: "Orphan Record",
              owner: o.owner,
              status: "open",
            })),
          ],
        },
      },
      {
        id: "metrics",
        type: "metrics",
        title: "Governance Metrics",
        data: {
          title: "Platform Governance Scores",
          metrics: [
            { label: "EXEC™ Explainability", value: report.explainabilityScore, target: 100, unit: "%" },
            { label: "Platform Discoverability", value: report.discoverabilityScore, target: 100, unit: "%" },
            { label: "Platform Governance", value: report.platformGovernanceScore, target: 100, unit: "%" },
            { label: "Overall Coverage", value: report.overallCoverage, target: 100, unit: "%" },
          ],
        },
      },
      {
        id: "verification",
        type: "verification",
        title: "Digital Verification",
        data: {
          reportId: buildReportId("metadata"),
          generatedAt: new Date().toISOString(),
          engineVersion: "Metadata Completion Engine™ v1.0",
          configVersion: report.configVersion,
          manifestVersion: report.manifestVersion,
          verified: report.overallCoverage === 100 && report.totalMissingEntries === 0 && report.totalOrphanRecords === 0,
        },
      },
    ],
    execAnalysis: {
      prompt: `Analyze Platform Metadata Completion at ${report.overallCoverage}%: ${report.totalMissingEntries} missing entries, ${report.totalOrphanRecords} orphans, explainability ${report.explainabilityScore}%, discoverability ${report.discoverabilityScore}%, governance ${report.platformGovernanceScore}%.`,
    },
  };
}