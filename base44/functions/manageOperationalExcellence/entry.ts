import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const OPS_ROLES = ['admin', 'developer', 'platform_admin', 'security_admin', 'support', 'sales', 'finance', 'content_manager', 'super_admin', 'founder_root_admin'];
const WASTE = ['Overproduction', 'Waiting', 'Transport', 'Overprocessing', 'Inventory', 'Motion', 'Defects', 'Unused Talent'];
const FLOW = [
  ['Landing Page', ['/'], ['landing']],
  ['Leadership Path', ['/onboarding', '/journey-orchestrator'], ['journey', 'leadership path']],
  ['Executive Readiness Assessment™', ['/assessment', '/executive-readiness'], ['assessment', 'readiness']],
  ['Results', ['/executive-readiness'], ['results', 'readiness report']],
  ['EXEC™ Coach™', ['/coach'], ['coach']],
  ['Executive Simulation™', ['/simulator'], ['simulation']],
  ['Evidence Collection™', ['/evidence-vault'], ['evidence']],
  ['Executive Identity™', ['/identity-graph', '/executive-portfolio'], ['identity']],
  ['Executive Success Story™', ['/executive-success-stories'], ['success story']],
];
const round = (n) => Math.round((Number(n) || 0) * 10) / 10;
const percent = (a, b) => b ? round((a / b) * 100) : 0;
const weekKey = () => {
  const d = new Date();
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - start.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

async function loadSources(base44) {
  return Promise.all([
    base44.asServiceRole.entities.ImprovementProject.list('-created_date', 200).catch(() => []),
    base44.asServiceRole.entities.RootCauseAnalysis.list('-created_date', 200).catch(() => []),
    base44.asServiceRole.entities.QualityControlMetric.list('-lastMeasuredAt', 100).catch(() => []),
    base44.asServiceRole.entities.ContinuousImprovementAction.list('-created_date', 300).catch(() => []),
    base44.asServiceRole.entities.TelemetryEvent.list('-created_date', 500).catch(() => []),
    base44.asServiceRole.entities.ProductCapabilityMetric.list('-created_date', 300).catch(() => []),
    base44.asServiceRole.entities.ReadinessAssessment.list('-created_date', 300).catch(() => []),
    base44.asServiceRole.entities.AIPolicyEvent.list('-created_date', 300).catch(() => []),
    base44.asServiceRole.entities.BehavioralEvidenceRecord.list('-created_date', 300).catch(() => []),
    base44.asServiceRole.entities.ExecutiveSuccessStory.list('-created_date', 200).catch(() => []),
  ]);
}

function deriveValueStream(telemetry, productMetrics, assessments, evidence, stories) {
  return FLOW.map(([name, paths, keywords]) => {
    const events = telemetry.filter((event) => paths.some((path) => path === '/' ? event.page_path === '/' : String(event.page_path || '').startsWith(path)));
    const sessions = new Set(events.map((event) => event.session_id).filter(Boolean));
    const completions = events.filter((event) => /complete|success|finish|submit/.test(String(event.event_type || '').toLowerCase()) || event.status === 'success');
    const related = productMetrics.filter((metric) => keywords.some((word) => `${metric.capability_name || ''} ${metric.capability_id || ''}`.toLowerCase().includes(word)));
    const uses = related.reduce((sum, metric) => sum + (metric.usage_count || metric.views || 0), 0);
    const done = related.reduce((sum, metric) => sum + (metric.completions || 0), 0);
    const observed = Math.max(events.length, uses);
    const completed = Math.max(completions.length, done);
    const satisfaction = related.length ? round(related.reduce((sum, metric) => sum + (metric.satisfaction_score || 0), 0) / related.length) : 0;
    const evidenceGenerated = name.includes('Assessment') ? assessments.length : name.includes('Evidence') ? evidence.length : name.includes('Success Story') ? stories.length : 0;
    return {
      name,
      completionRate: percent(completed, observed),
      dropOffRate: observed ? Math.max(0, 100 - percent(completed, observed)) : 0,
      averageTimeSeconds: events.length ? round(events.reduce((sum, event) => sum + (event.duration_ms || 0), 0) / events.length / 1000) : 0,
      satisfaction,
      evidenceGenerated,
      observations: observed,
      sessions: sessions.size,
    };
  });
}

function metricDefinitions(telemetry, productMetrics, assessments, aiEvents) {
  const successful = telemetry.filter((event) => event.status === 'success').length;
  const totalUses = productMetrics.reduce((sum, metric) => sum + (metric.usage_count || 0), 0);
  const completions = productMetrics.reduce((sum, metric) => sum + (metric.completions || 0), 0);
  const trust = aiEvents.length ? aiEvents.reduce((sum, event) => sum + (event.trust_level || 0), 0) / aiEvents.length : 0;
  const reliability = assessments.length ? assessments.reduce((sum, item) => sum + (item.confidence === 'High' ? 100 : item.confidence === 'Medium' ? 75 : 40), 0) / assessments.length : 0;
  return [
    { metricId: 'platform_interaction_success', metricName: 'Platform Interaction Success', currentValue: percent(successful, telemetry.length), targetValue: 95, lowerControlLimit: 90, upperControlLimit: 100 },
    { metricId: 'journey_completion', metricName: 'Leadership Journey Completion', currentValue: percent(completions, totalUses), targetValue: 75, lowerControlLimit: 60, upperControlLimit: 100 },
    { metricId: 'ai_trust', metricName: 'AI Truthfulness Confidence', currentValue: round(trust), targetValue: 90, lowerControlLimit: 80, upperControlLimit: 100 },
    { metricId: 'readiness_reliability', metricName: 'Readiness Assessment Reliability', currentValue: round(reliability), targetValue: 90, lowerControlLimit: 80, upperControlLimit: 100 },
  ];
}

async function refreshMetrics(base44, sources) {
  const [, , existing, , telemetry, productMetrics, assessments, aiEvents] = sources;
  const byId = new Map(existing.map((metric) => [metric.metricId, metric]));
  const now = new Date().toISOString();
  const definitions = metricDefinitions(telemetry, productMetrics, assessments, aiEvents).map((metric) => {
    const previous = byId.get(metric.metricId);
    const delta = metric.currentValue - (previous?.currentValue ?? metric.currentValue);
    const status = metric.currentValue < metric.lowerControlLimit || metric.currentValue > metric.upperControlLimit ? 'out_of_control' : metric.currentValue < metric.targetValue ? 'warning' : 'in_control';
    return { ...metric, trend: delta > 1 ? 'improving' : delta < -1 ? 'declining' : 'stable', status, lastMeasuredAt: now, targetMetSince: metric.currentValue >= metric.targetValue ? (previous?.targetMetSince || now) : now };
  });
  const updates = definitions.filter((metric) => byId.has(metric.metricId)).map((metric) => ({ id: byId.get(metric.metricId).id, ...metric }));
  const creates = definitions.filter((metric) => !byId.has(metric.metricId));
  if (updates.length) await base44.asServiceRole.entities.QualityControlMetric.bulkUpdate(updates);
  if (creates.length) await base44.asServiceRole.entities.QualityControlMetric.bulkCreate(creates);
  return definitions.map((metric) => ({ ...metric, id: byId.get(metric.metricId)?.id }));
}

function buildDashboard(sources) {
  const [projects, analyses, metrics, improvements, telemetry, productMetrics, assessments, aiEvents, evidence, stories] = sources;
  const active = projects.filter((project) => !['Completed', 'Control'].includes(project.status));
  const wasteHotspots = WASTE.map((category) => ({ category, count: improvements.filter((item) => item.target_name === category).length })).filter((item) => item.count).sort((a, b) => b.count - a.count);
  const qualityAlerts = metrics.filter((metric) => metric.status !== 'in_control');
  const score = metrics.length ? round(metrics.reduce((sum, metric) => sum + Math.min(100, Math.max(0, metric.currentValue)), 0) / metrics.length) : 0;
  return { projects, analyses, metrics, improvements, activeProjects: active, qualityAlerts, wasteHotspots, operationalScore: score, valueStream: deriveValueStream(telemetry, productMetrics, assessments, evidence, stories) };
}

async function updateProjects(base44, projectId, updates) {
  const projects = await base44.asServiceRole.entities.ImprovementProject.filter({ projectId }, '-created_date', 1);
  if (!projects[0]) return null;
  return base44.asServiceRole.entities.ImprovementProject.update(projects[0].id, updates);
}

async function handleAutomation(base44, body) {
  const entity = body.event?.entity_name;
  const data = body.data || (body.event?.entity_id ? await base44.asServiceRole.entities[entity].get(body.event.entity_id) : null);
  if (!data) return { ignored: true };
  if (entity === 'ImprovementProject') {
    if (body.event.type === 'create' && data.status !== 'Define') await base44.asServiceRole.entities.ImprovementProject.update(data.id, { status: 'Define' });
    if (body.event.type === 'update' && body.changed_fields?.includes('baselineValue') && data.status === 'Define') await base44.asServiceRole.entities.ImprovementProject.update(data.id, { status: 'Measure' });
  }
  if (entity === 'RootCauseAnalysis' && data.approvalStatus === 'approved') await updateProjects(base44, data.projectId, { status: 'Analyze' });
  if (entity === 'ContinuousImprovementAction' && data.target_id) await updateProjects(base44, data.target_id, { status: 'Improve' });
  return { processed: true };
}

async function runLifecycle(base44) {
  const sources = await loadSources(base44);
  const metrics = await refreshMetrics(base44, sources);
  const projects = sources[0];
  const now = Date.now();
  const updates = [];
  for (const project of projects) {
    const metric = metrics.find((item) => item.metricId === project.targetKPI || item.metricName === project.targetKPI);
    if (!metric) continue;
    if (metric.currentValue < metric.lowerControlLimit && ['Improve', 'Control', 'Completed'].includes(project.status)) updates.push({ id: project.id, status: 'Measure' });
    else if (metric.currentValue >= metric.targetValue && metric.targetMetSince && now - new Date(metric.targetMetSince).getTime() >= 30 * 86400000 && project.status === 'Improve') updates.push({ id: project.id, status: 'Control' });
  }
  if (updates.length) await base44.asServiceRole.entities.ImprovementProject.bulkUpdate(updates);
  return { metrics: metrics.length, projectsUpdated: updates.length };
}

async function generateWeeklyReports(base44) {
  const sources = await loadSources(base44);
  const dashboard = buildDashboard(sources);
  const [projects, , metrics, improvements, telemetry] = sources;
  const duplicates = telemetry.filter((event, index, all) => all.findIndex((other) => other.session_id && other.session_id === event.session_id && other.page_path === event.page_path && other.event_type === event.event_type) !== index).length;
  const slowest = [...dashboard.valueStream].sort((a, b) => b.averageTimeSeconds - a.averageTimeSeconds).slice(0, 5);
  const reportData = [
    { suffix: 'LEAN-WASTE', name: 'Lean Waste Report™', payload: { topFrictionPoints: dashboard.wasteHotspots, highestDropOffScreens: [...dashboard.valueStream].sort((a, b) => b.dropOffRate - a.dropOffRate).slice(0, 5), slowestWorkflows: slowest, duplicateUserActions: duplicates } },
    { suffix: 'QUALITY-DRIFT', name: 'Quality Drift Report™', payload: { outsideControlLimits: metrics.filter((metric) => metric.status === 'out_of_control'), aiConfidenceAnomalies: sources[7].filter((event) => (event.trust_level || 0) < 80).length, onboardingConversionDeclines: dashboard.valueStream.filter((step) => step.dropOffRate > 40), enterpriseAssessmentReliabilityIssues: metrics.filter((metric) => metric.metricId === 'readiness_reliability' && metric.currentValue < metric.targetValue) } },
    { suffix: 'CI-SUMMARY', name: 'Continuous Improvement Summary™', payload: { projectsCompleted: projects.filter((project) => ['Control', 'Completed'].includes(project.status)).length, kpiImprovementsAchieved: metrics.filter((metric) => metric.currentValue >= metric.targetValue).length, estimatedBusinessImpact: improvements.reduce((sum, item) => sum + (item.expected_revenue_impact || 0), 0), unresolvedCriticalGaps: improvements.filter((item) => item.priority === 'critical' && !['verified', 'dismissed'].includes(item.status)).length } },
  ];
  for (const item of reportData) {
    const period = `${weekKey()}-${item.suffix}`;
    const record = { period, report_date: new Date().toISOString().slice(0, 10), status: 'ready', overall_health_score: dashboard.operationalScore, momentum: 'stable', ai_narrative: `${item.name} generated from current platform intelligence and telemetry.`, engagement_breakdown_json: JSON.stringify(item.payload), what_should_change_json: JSON.stringify(item.payload), generated_by: 'Operational Excellence Scheduler', user_id: 'system', user_name: 'Operational Excellence Scheduler' };
    const existing = await base44.asServiceRole.entities.BusinessIntelligenceReport.filter({ period }, '-created_date', 1);
    if (existing[0]) await base44.asServiceRole.entities.BusinessIntelligenceReport.update(existing[0].id, record);
    else await base44.asServiceRole.entities.BusinessIntelligenceReport.create(record);
  }
  return { reportsGenerated: reportData.length };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    let user = null;
    try { user = await base44.auth.me(); } catch {}
    const automated = Boolean(body.event || body.automation) || ['runLifecycle', 'weeklyReports'].includes(body.action);
    if (!automated && !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user && !OPS_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (body.event) return Response.json(await handleAutomation(base44, body));
    if (body.action === 'runLifecycle') return Response.json(await runLifecycle(base44));
    if (body.action === 'weeklyReports') return Response.json(await generateWeeklyReports(base44));
    if (body.action === 'dashboard' || !body.action) {
      let sources = await loadSources(base44);
      if (!sources[2].length) { await refreshMetrics(base44, sources); sources = await loadSources(base44); }
      return Response.json(buildDashboard(sources));
    }
    if (body.action === 'refreshMetrics') { const sources = await loadSources(base44); return Response.json({ metrics: await refreshMetrics(base44, sources) }); }
    if (body.action === 'createProject') {
      const project = await base44.asServiceRole.entities.ImprovementProject.create({ ...body.project, projectId: body.project.projectId || `LSS-${Date.now()}`, workspace: 'operations', status: 'Define', startDate: body.project.startDate || new Date().toISOString().slice(0, 10) });
      return Response.json({ project });
    }
    if (body.action === 'captureBaseline') return Response.json({ project: await updateProjects(base44, body.projectId, { baselineValue: Number(body.baselineValue), status: 'Measure' }) });
    if (body.action === 'createRootCause') {
      const analysis = await base44.asServiceRole.entities.RootCauseAnalysis.create({ ...body.analysis, analysisId: body.analysis.analysisId || `RCA-${Date.now()}`, createdBy: user?.full_name || user?.email || 'Operations', createdAt: new Date().toISOString(), approvalStatus: 'pending' });
      return Response.json({ analysis });
    }
    if (body.action === 'approveRootCause') {
      const analysis = await base44.asServiceRole.entities.RootCauseAnalysis.update(body.analysisId, { approvalStatus: 'approved' });
      await updateProjects(base44, analysis.projectId, { status: 'Analyze' });
      return Response.json({ analysis });
    }
    if (body.action === 'generateActions') {
      const analyses = await base44.asServiceRole.entities.RootCauseAnalysis.filter({ analysisId: body.analysisId }, '-created_date', 1);
      const analysis = analyses[0];
      if (!analysis || analysis.approvalStatus !== 'approved') return Response.json({ error: 'Approved root-cause analysis required' }, { status: 400 });
      const actions = (analysis.recommendedActions || []).map((title) => ({ title, description: `Generated from ${analysis.method}: ${analysis.rootCause}`, improvement_type: 'workflow', target_id: analysis.projectId, target_name: analysis.method, priority: analysis.confidence >= 80 ? 'high' : 'medium', status: 'identified', ai_recommendation: title, user_id: user?.id, user_name: user?.full_name || user?.email }));
      if (actions.length) await base44.asServiceRole.entities.ContinuousImprovementAction.bulkCreate(actions);
      await updateProjects(base44, analysis.projectId, { status: 'Improve' });
      return Response.json({ created: actions.length });
    }
    if (body.action === 'tagWaste') {
      if (!WASTE.includes(body.waste.category)) return Response.json({ error: 'Invalid waste category' }, { status: 400 });
      const improvement = await base44.asServiceRole.entities.ContinuousImprovementAction.create({ title: body.waste.title, description: body.waste.description, improvement_type: 'workflow', target_id: body.waste.projectId || '', target_name: body.waste.category, priority: body.waste.priority || 'medium', status: 'identified', expected_impact: body.waste.expectedImpact || '', user_id: user?.id, user_name: user?.full_name || user?.email });
      return Response.json({ improvement });
    }
    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}