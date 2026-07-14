import React from "react";
import { FileText, Download, BarChart3 } from "lucide-react";
import { Panel, StatCard } from "./Shared";

export default function SuccessReportPanel({ data }) {
  if (!data) return null;
  const { overallScore, executiveKPIs, health, beta, growth, marketFit } = data;

  const reportTypes = [
    { id: "customer_success", label: "Customer Success Report", desc: "Full customer health, adoption, and retention overview" },
    { id: "leadership_progress", label: "Leadership Progress Report", desc: "Executive growth, reputation, and readiness metrics" },
    { id: "organization_progress", label: "Organization Progress Report", desc: "Enterprise-level transformation outcomes" },
    { id: "beta_success", label: "Beta Success Report", desc: "Beta program funnel, activation, and feedback" },
    { id: "board_summary", label: "Board Summary", desc: "Executive one-pager for board presentations" },
  ];

  const handleGenerate = (type) => {
    const report = generateReportText(type, data);
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EXECLEAD_${type}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={BarChart3} label="Overall Score" value={`${overallScore}/100`} color={overallScore >= 70 ? "emerald" : "amber"} />
        <StatCard icon={FileText} label="KPIs Tracked" value={executiveKPIs.length} color="indigo" />
        <StatCard icon={Download} label="Report Types" value={reportTypes.length} color="purple" />
      </div>

      <Panel title="Executive Success Reports™ — Generate PDF / Markdown">
        <div className="space-y-3">
          {reportTypes.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div>
                <div className="text-white/80 text-sm font-medium">{r.label}</div>
                <div className="text-white/40 text-xs mt-0.5">{r.desc}</div>
              </div>
              <button onClick={() => handleGenerate(r.id)} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors">
                <Download size={12} /> Generate
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function generateReportText(type, data) {
  const date = new Date().toLocaleDateString();
  const { overallScore, executiveKPIs, health, beta, growth, marketFit } = data;

  let title = "EXECLEAD.AI — Executive Success Report";
  let body = "";

  if (type === "board_summary") {
    title = "EXECLEAD.AI — Board Summary";
    body = `# Board Summary\n\n**Date:** ${date}\n**Overall Customer Success Score:** ${overallScore}/100\n\n## Executive Summary\nEXECLEAD.AI is ${overallScore >= 70 ? "delivering strong customer value" : overallScore >= 40 ? "showing moderate customer success with room for improvement" : "requiring immediate attention to customer outcomes"}.\n\n## Key Metrics\n`;
    for (const kpi of executiveKPIs) {
      body += `- **${kpi.label}:** ${kpi.value} (${kpi.sub})\n`;
    }
    body += `\n## Customer Health\n- Avg Health Score: ${health.avgHealthScore}/100\n- Healthy: ${health.segments.healthy}\n- At Risk: ${health.segments.atRisk}\n- Champions: ${health.segments.champions}\n`;
  } else if (type === "beta_success") {
    title = "EXECLEAD.AI — Beta Success Report";
    body = `# Beta Success Report\n\n**Date:** ${date}\n\n## Funnel\n- Total Applications: ${beta.totalApplications}\n- Acceptance Rate: ${beta.acceptanceRate}%\n- Activation Rate: ${beta.activationRate}%\n- Active Beta Users: ${beta.activeBetaUsers}\n\n## Feedback\n- Total Feedback: ${beta.totalFeedback}\n- Bug Reports: ${beta.totalBugs}\n- Feature Requests: ${beta.totalFeatureRequests}\n`;
  } else if (type === "leadership_progress") {
    title = "EXECLEAD.AI — Leadership Progress Report";
    body = `# Leadership Progress Report\n\n**Date:** ${date}\n\n## Executive Growth\n- Avg Reputation: ${growth.avgReputation}\n- Avg Readiness: ${growth.avgReadiness}\n- Avg Credibility: ${growth.avgExecutiveCredibility}\n- Total XP Earned: ${growth.totalXPEarned}\n- Lessons Completed: ${data.learning.completed}\n- Certifications: ${data.learning.certified}\n`;
  } else {
    body = `# ${title}\n\n**Date:** ${date}\n**Overall Score:** ${overallScore}/100\n\n## Executive KPIs\n`;
    for (const kpi of executiveKPIs) {
      body += `- **${kpi.label}:** ${kpi.value} (${kpi.sub})\n`;
    }
    body += `\n## Customer Health\n- Avg Health Score: ${health.avgHealthScore}/100\n- Healthy: ${health.segments.healthy}\n- At Risk: ${health.segments.atRisk}\n- Champions: ${health.segments.champions}\n\n## Beta Program\n- Applications: ${beta.totalApplications}\n- Acceptance: ${beta.acceptanceRate}%\n- Activation: ${beta.activationRate}%\n\n## Product Market Fit\n- PMF Score: ${marketFit.pmfScore}/100\n- NPS: ${marketFit.nps.score}\n- Total Surveys: ${marketFit.totalSurveys}\n`;
  }

  return `${title}\n\n${body}\n---\nGenerated by EXEC™ Product Intelligence Platform™`;
}