/**
 * Strategic Copilot™ — AI Q&A grounded in the Platform Registry, ADRs,
 * dependency graph, Product Genome, and Digital Twin snapshot.
 * The component invokes InvokeLLM with the context built here.
 */
import { computeTwinSnapshot } from './index';

export function buildCopilotContext() {
  const twin = computeTwinSnapshot();
  const { graph, kpis, capabilities, evolution, report, adrs, stats } = twin;
  const mods = graph.nodes.filter((n) => n.type === 'module');
  const engines = graph.nodes.filter((n) => n.type === 'ai-engine');

  const moduleDigest = mods.map((m) =>
    `- ${m.label} [${m.workspace}/${m.capability}] maturity=${m.maturity} value=${m.businessValue} complexity=${m.complexity} debt=${m.techDebt} ai=${m.aiEngines.length} deps=${m.dependencies.length}`
  ).join('\n');

  const engineDigest = engines.map((e) =>
    `- ${e.label} confidence=${e.confidence} risk=${e.risk} consumers=${graph.edges.filter((ed) => ed.to === e.id).length}`
  ).join('\n');

  const capDigest = capabilities.map((c) =>
    `- ${c.name}: ${c.moduleCount} modules, value=${c.businessValue}, revenue=${c.revenueContribution}`
  ).join('\n');

  const kpiDigest = kpis.map((k) => `${k.label}: ${k.current}/100 (target ${k.target})`).join(', ');

  const adrDigest = (adrs || []).map((a) => `- ${a.title || a.id}: ${a.decision || a.summary || ''}`).join('\n');

  const evoDigest = evolution.slice(0, 8).map((e) =>
    `- ${e.type.toUpperCase()} ${e.target}: value=${e.businessValue} cost=${e.engineeringCost} priority=${e.priority}`
  ).join('\n');

  return `PLATFORM DIGITAL TWIN — EXECLEAD.AI
Stats: ${stats.modules} modules, ${stats.aiEngines} AI engines, ${stats.entities} entities, ${stats.routes} routes, ${stats.capabilities} capabilities, ${stats.workspaces} workspaces, ${stats.edges} graph edges.

KPIs: ${kpiDigest}

BUSINESS CAPABILITIES:
${capDigest}

MODULES:
${moduleDigest}

AI ENGINES:
${engineDigest}

ARCHITECTURE DECISION RECORDS:
${adrDigest || '(none registered)'}

AI EVOLUTION RECOMMENDATIONS:
${evoDigest}

EXECUTIVE EVOLUTION REPORT (excerpt):
Overall recommendation: ${report.overallRecommendation}
Top risks: ${report.topRisks.slice(0, 3).join(' | ')}
Top opportunities: ${report.topOpportunities.slice(0, 3).join(' | ')}
`;
}

export const COPILOT_SUGGESTED_QUESTIONS = [
  'If we were starting today, how would we design EXECLEAD.AI differently?',
  'What are our biggest architectural risks?',
  'Which modules generate the greatest executive value?',
  'Where should we invest Engineering 5?',
  'Which capabilities are underutilized?',
  'What enterprise customers would value most?',
  'What should become standalone SaaS products?',
  'What should be deprecated in the next release?',
];

export function buildCopilotPrompt(question) {
  return `${buildCopilotContext()}

You are the Strategic Copilot™ for EXECLEAD.AI's Platform Digital Twin. You answer executive and chief-architect questions about the platform. ALWAYS ground your answer in the registry data above (cite specific modules, capabilities, KPIs, ADRs, or recommendations). Be direct, specific, and actionable. Structure long answers with short headers. Never invent modules that aren't in the data. If something is unclear, say so and explain what data would resolve it.

QUESTION: ${question}

Answer:`;
}