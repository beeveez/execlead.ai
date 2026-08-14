import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { computeKnowledgeIntelligence } from '../../shared/knowledgeIntelligenceEngine.js';
import { authorizeKnowledgeFunction } from '../../shared/knowledgeFunctionSecurity.ts';

function isoWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
  const first = new Date(thursday.getFullYear(), 0, 4);
  const week = 1 + Math.round(((thursday - first) / 86400000 - 3 + ((first.getDay() + 6) % 7)) / 7);
  return { year: thursday.getFullYear(), week };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { response } = await authorizeKnowledgeFunction(req, base44, {
      action: 'generate_knowledge_intelligence_report',
      allowServiceToken: true,
      limit: 2,
      windowMs: 3_600_000,
    });
    if (response) return response;

    const { year, week } = isoWeek(new Date());
    const reportId = `KI-${year}-W${String(week).padStart(2, '0')}`;
    const existingReports = await base44.asServiceRole.entities.KnowledgeIntelligenceReport.filter({ report_id: reportId }, '-created_date', 1);
    if (existingReports.length) return Response.json({ ok: true, report_id: reportId, reused: true });

    const [interactions, articles] = await Promise.all([
      base44.asServiceRole.entities.KnowledgeInteraction.list('-created_date', 2000),
      base44.asServiceRole.entities.KnowledgeArticle.filter({ published: true }, '-updated_date', 500),
    ]);
    const intel = computeKnowledgeIntelligence(interactions || [], articles || []);
    const today = new Date();
    const weekStart = new Date(today.getTime() - 7 * 86400000);

    const report = {
      report_id: reportId,
      week_start: weekStart.toISOString().slice(0, 10),
      week_end: today.toISOString().slice(0, 10),
      generated_date: today.toISOString(),
      overall_health: intel.health.score,
      coverage_score: intel.coverage.overall,
      search_success_rate: intel.health.components.searchSuccess,
      ai_avg_confidence: intel.aiConfidence.avg,
      total_searches: intel.search.total,
      zero_result_count: intel.search.zeroResultCount,
      top_gaps_json: JSON.stringify(intel.gaps.zeroResult.slice(0, 10)),
      top_articles_json: JSON.stringify(intel.articles.slice(0, 10).map((a) => ({ slug: a.slug, views: a.views, helpful: a.helpful, notHelpful: a.notHelpful }))),
      recommendations_json: JSON.stringify(intel.recommendations),
      summary_json: JSON.stringify({
        health: intel.health,
        coverage: intel.coverage.overall,
        aiConfidence: intel.aiConfidence,
        enterprise: { trustRefs: intel.enterprise.trustRefs, procurementQueries: intel.enterprise.procurementQueries.length },
        commercial: intel.commercial,
      }),
    };

    await base44.asServiceRole.entities.KnowledgeIntelligenceReport.bulkCreate([report]);

    // Email a brief digest to platform admins (registered users only).
    let emailedTo = '';
    try {
      const users = await base44.asServiceRole.entities.User.list('-created_date', 200);
      const adminRoles = ['super_admin', 'platform_admin', 'admin', 'founder_root_admin'];
      const admins = (users || []).filter((u) => adminRoles.includes(u.role));
      if (admins.length) {
        const subject = `[EXECLEAD.AI] Weekly Knowledge Intelligence Report ${reportId}`;
        const body = `Executive Knowledge Center™ — Weekly Intelligence Report ${reportId}\n\n` +
          `Knowledge Health Score™: ${intel.health.score}%\n` +
          `Knowledge Coverage Score™: ${intel.coverage.overall}%\n` +
          `Search Success Rate: ${intel.health.components.searchSuccess}% (zero-result: ${intel.search.zeroResultCount})\n` +
          `Ask EXEC™ Avg Confidence: ${intel.aiConfidence.avg}% (low-confidence: ${intel.aiConfidence.lowCount})\n` +
          `Total Searches (rolling): ${intel.search.total}\n\n` +
          `Top Content Gaps:\n` +
          (intel.gaps.zeroResult.slice(0, 5).map((g) => `  • ${g.key} (${g.count})`).join('\n') || '  none') + `\n\n` +
          `Recommended New Articles:\n` +
          (intel.recommendations.slice(0, 6).map((r) => `  • [${r.priority}] ${r.title}`).join('\n') || '  none') + `\n\n` +
          `Full dashboard: /operations/knowledge-intelligence\n`;
        for (const u of admins) {
          try { await base44.integrations.Core.SendEmail({ to: u.email, subject, body }); } catch (e) {}
        }
        emailedTo = admins.map((u) => u.email).join(',');
      }
    } catch (e) {}

    return Response.json({ ok: true, report_id: reportId, health: intel.health.score });
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}