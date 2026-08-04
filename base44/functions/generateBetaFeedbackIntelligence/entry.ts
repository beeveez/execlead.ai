import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Simple Levenshtein distance for duplicate title detection.
function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function safeParse(str: string | null | undefined, fallback: any) {
  try { const v = JSON.parse(str || ''); return v == null ? fallback : v; } catch { return fallback; }
}

const ADMIN_ROLES = new Set(['founder_root_admin', 'super_admin', 'platform_admin', 'admin', 'developer']);

export default async function handleRequest(req, res) {
  const base44 = await createClientFromRequest(req);

  // ── RBAC: authenticate + authorize before any data access or LLM invocation ──
  let user = null;
  try { user = await base44.auth.me(); } catch (_) {}
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!ADMIN_ROLES.has(user.role)) return res.status(403).json({ error: 'Forbidden' });

  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id is required' });

  const fb = await base44.asServiceRole.entities.BetaFeedback.get(id);
  if (!fb) return res.status(404).json({ error: 'feedback not found' });

  // --- Feedback Confidence™ ---
  const sevWeight = { Critical: 40, High: 30, Medium: 20, Low: 10 }[fb.severity] || 15;
  let peers = [];
  try {
    peers = await base44.asServiceRole.entities.BetaFeedback.filter({ category: fb.category }, '-created_date', 100);
  } catch (e) { peers = []; }
  const dupCount = peers.filter((p) =>
    p.id !== fb.id && p.title && fb.title &&
    (p.title.toLowerCase() === fb.title.toLowerCase() || lev(p.title.toLowerCase(), fb.title.toLowerCase()) <= 3)
  ).length;
  const attachments = safeParse(fb.attachments_json, []).length;
  const ageDays = fb.submitted_at ? (Date.now() - new Date(fb.submitted_at).getTime()) / 86400000 : 999;
  const recencyBonus = ageDays < 7 ? 20 : ageDays < 30 ? 10 : 0;
  const confidence = Math.min(100, Math.round(sevWeight + dupCount * 5 + attachments * 5 + recencyBonus));

  // --- Product Impact Score™ ---
  const affected = (fb.vote_count || 0) + (fb.watcher_count || 0);
  const sevImpact = { Critical: 40, High: 30, Medium: 20, Low: 10 }[fb.severity] || 15;
  const impactRaw = sevImpact + Math.min(30, affected * 5) + (fb.business_impact ? 10 : 0) + (fb.journey_stage ? 10 : 0);
  const impact_score = impactRaw >= 70 ? 'Critical' : impactRaw >= 50 ? 'High' : impactRaw >= 30 ? 'Medium' : 'Low';

  // --- AI Analysis™ ---
  let ai: any = null;
  try {
    const prompt = `Analyze this product feedback for EXECLEAD.AI, an AI Executive Leadership Operating System.

Title: ${fb.title || ''}
Category: ${fb.category || ''}
Severity: ${fb.severity || 'Medium'}
Description: ${fb.description || ''}
Expected behavior: ${fb.expected_behavior || ''}
Actual behavior: ${fb.actual_behavior || ''}
Suggested improvement: ${fb.suggested_improvement || ''}
Business impact: ${fb.business_impact || ''}
Route: ${fb.current_route || ''}
Module: ${fb.module || ''}
Workspace: ${fb.workspace || ''}

Produce a structured analysis: a concise AI summary, a root-cause hypothesis, the likely affected modules, a suggested resolution, engineering complexity, customer value, and a release recommendation (one of: Ship Immediately, Next Sprint, Future Release, Needs Investigation, Duplicate, Won't Fix).`;
    const r = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          ai_summary: { type: 'string' },
          root_cause_hypothesis: { type: 'string' },
          likely_affected_modules: { type: 'array', items: { type: 'string' } },
          suggested_resolution: { type: 'string' },
          engineering_complexity: { type: 'string' },
          customer_value: { type: 'string' },
          release_recommendation: { type: 'string' },
          confidence: { type: 'number' },
        },
        required: ['ai_summary', 'root_cause_hypothesis', 'suggested_resolution', 'release_recommendation'],
      },
    });
    ai = r;
  } catch (e) {
    ai = null;
  }

  const possibleDup = peers.find((p) =>
    p.id !== fb.id && p.title && fb.title && p.title.toLowerCase() === fb.title.toLowerCase()
  );
  const roadmap_recommendation =
    ai?.release_recommendation && ['Ship Immediately', 'Next Sprint', 'Future Release', 'Needs Investigation', 'Duplicate', "Won't Fix"].includes(ai.release_recommendation)
      ? ai.release_recommendation
      : 'Needs Investigation';

  const update = {
    feedback_confidence: confidence,
    impact_score,
    impact_score_number: impactRaw,
    ai_summary: ai?.ai_summary || '',
    ai_root_cause: ai?.root_cause_hypothesis || '',
    ai_affected_modules: JSON.stringify(ai?.likely_affected_modules || []),
    ai_suggested_resolution: ai?.suggested_resolution || '',
    ai_engineering_complexity: ai?.engineering_complexity || '',
    ai_customer_value: ai?.customer_value || '',
    ai_release_recommendation: ai?.release_recommendation || '',
    ai_confidence: ai?.confidence || 0,
    ai_possible_duplicate: possibleDup ? (possibleDup.feedback_id || possibleDup.id) : '',
    roadmap_recommendation,
  };

  await base44.asServiceRole.entities.BetaFeedback.update(id, update);
  return res.status(200).json({ status: 'success', ...update });
}