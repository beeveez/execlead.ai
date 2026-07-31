// Identity Intelligence Engine™ — analyzes identity maturity, detects gaps,
// identifies differentiators, monitors evolution, and explains recommendations.
import { safeParse } from '@/lib/executiveSuccessStoryEngine';
import { computeIdentityHealth, detectInconsistencies } from '@/lib/executiveIdentityGraphEngine';

// Identity Intelligence™ — the unified intelligence view over the identity.
export function computeIdentityIntelligence(identity, versions) {
  if (!identity) return null;
  const health = computeIdentityHealth(identity) || {};
  const gaps = analyzeGap(identity);
  const differentiators = analyzeDifferentiators(identity);
  const maturity = scoreMaturity(health);
  const recommendations = buildRecommendations(identity, health, gaps);
  return {
    maturity,
    gaps,
    differentiators,
    recommendations,
    inconsistencies: detectInconsistencies(identity),
    evolution: buildEvolutionTimeline(versions),
    analytics: computeIdentityAnalytics(versions),
    brandConsistency: computeBrandConsistency(identity),
  };
}

function scoreMaturity(health) {
  const weights = { completeness: 0.3, consistency: 0.2, evidenceCoverage: 0.2, verificationLevel: 0.1, brandConsistency: 0.1, professionalReadiness: 0.1 };
  let s = 0;
  Object.keys(weights).forEach((k) => { s += (health[k] || 0) * weights[k]; });
  const label = s >= 85 ? 'Optimized' : s >= 70 ? 'Mature' : s >= 50 ? 'Developing' : 'Emerging';
  return { score: Math.round(s), label };
}

// Identity Gap Analysis™
export function analyzeGap(identity) {
  if (!identity) return [];
  const gaps = [];
  if ((identity.career_highlights || []).length < 3) gaps.push({ area: 'Career Highlights', severity: 'high', detail: 'Few verified career highlights captured.', fix: 'Add achievements from your Evidence Vault.' });
  if ((identity.executive_differentiators || []).length < 3) gaps.push({ area: 'Executive Differentiators', severity: 'high', detail: 'Insufficient differentiation to stand out.', fix: 'Capture 3–5 unique leadership themes.' });
  if (!identity.executive_brand_statement) gaps.push({ area: 'Brand Statement', severity: 'medium', detail: 'No executive brand statement generated.', fix: 'Run the Executive Brand Engine™.' });
  if ((identity.top_competencies || []).length < 3) gaps.push({ area: 'Competencies', severity: 'medium', detail: 'Competency coverage incomplete.', fix: 'Complete more leadership assessments.' });
  if ((identity.evidence_count || 0) < 50) gaps.push({ area: 'Evidence', severity: 'medium', detail: 'Evidence records below recommended threshold.', fix: 'Accumulate more verified evidence.' });
  if (!identity.leadership_philosophy) gaps.push({ area: 'Leadership Philosophy', severity: 'low', detail: 'Leadership philosophy not articulated.', fix: 'Reflect and capture your leadership philosophy.' });
  if (identity.verification_status === 'not_verified') gaps.push({ area: 'Verification', severity: 'low', detail: 'Identity not yet verified.', fix: 'Complete identity verification.' });
  return gaps;
}

// Executive Differentiator Engine™
export function analyzeDifferentiators(identity) {
  if (!identity) return null;
  const diffs = identity.executive_differentiators || [];
  const strengths = identity.leadership_strengths || [];
  const competencies = identity.top_competencies || [];
  const themes = extractThemes(identity);
  const positioning = buildPositioning(identity);
  const signature = buildSignature(identity);
  return {
    differentiators: diffs,
    strengths,
    competencies,
    themes,
    positioning,
    signature,
    competitive_advantages: diffs.slice(0, 3),
    industry_specialization: identity.primary_industry || '',
    concise: conciseDifferentiator(identity),
    detailed: detailedDifferentiator(identity),
  };
}

function extractThemes(identity) {
  const all = [...(identity.executive_differentiators || []), ...(identity.leadership_strengths || [])];
  const seen = new Set(); const out = [];
  for (const t of all) { const k = (t || '').toLowerCase(); if (k && !seen.has(k)) { seen.add(k); out.push(t); } if (out.length >= 4) break; }
  return out;
}
function buildPositioning(identity) {
  const role = identity.target_executive_role || 'executive leader';
  const ind = identity.primary_industry ? ` in ${identity.primary_industry}` : '';
  const top = (identity.executive_differentiators || [])[0] || 'evidence-based leadership';
  return `${role}${ind}, differentiated by ${top}.`;
}
function buildSignature(identity) {
  const s = (identity.leadership_strengths || []).slice(0, 2).join(' and ');
  return s ? `Known for ${s}.` : '';
}
function conciseDifferentiator(identity) {
  const d = (identity.executive_differentiators || [])[0];
  const s = (identity.leadership_strengths || [])[0];
  if (d && s) return `A ${identity.target_executive_role || 'leader'} known for ${s}, differentiated by ${d}.`;
  return identity.executive_summary || '';
}
function detailedDifferentiator(identity) {
  const diffs = (identity.executive_differentiators || []).map((d) => `• ${d}`).join('\n');
  const strengths = (identity.leadership_strengths || []).join(', ');
  return `What makes this executive different:\n${diffs || '—'}\n\nLeadership strengths: ${strengths || '—'}\n\nPositioning: ${buildPositioning(identity)}`;
}

// Identity Evolution Timeline™
export function buildEvolutionTimeline(versions) {
  if (!versions || !versions.length) return [];
  return versions.slice().reverse().map((v, i) => ({
    version: v.version,
    date: v.generated_date,
    readiness: v.executive_readiness,
    story_confidence: v.story_confidence,
    evidence_count: v.evidence_count,
    headline: v.professional_headline,
    changes: safeParse(v.change_history_json, []),
    milestone: i === 0 ? 'Current Executive Identity' : `Version ${v.version}`,
  }));
}

// Identity Analytics™
export function computeIdentityAnalytics(versions) {
  if (!versions || !versions.length) return null;
  const sorted = [...versions].sort((a, b) => new Date(a.generated_date) - new Date(b.generated_date));
  return {
    healthTrend: sorted.map((v) => ({ date: shortDate(v.generated_date), value: approxHealth(v) })),
    storyConfidenceTrend: sorted.map((v) => ({ date: shortDate(v.generated_date), value: v.story_confidence || 0 })),
    evidenceGrowth: sorted.map((v) => ({ date: shortDate(v.generated_date), value: v.evidence_count || 0 })),
    readinessTrend: sorted.map((v) => ({ date: shortDate(v.generated_date), value: v.executive_readiness || 0 })),
    versions: sorted.length,
    differentiatorStability: differentiatorStability(sorted),
    positioningScore: sorted.length ? Math.min(100, (sorted[sorted.length - 1].executive_differentiators || []).length * 20) : 0,
  };
}
function approxHealth(v) {
  const checks = [!!v.professional_headline, !!v.executive_summary, !!v.leadership_philosophy, (v.executive_differentiators || []).length > 0, (v.career_highlights || []).length > 0];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
function shortDate(d) { try { return new Date(d).toLocaleDateString(); } catch { return ''; } }
function differentiatorStability(versions) {
  if (versions.length < 2) return 100;
  const last = new Set((versions[versions.length - 1].executive_differentiators || []).map((x) => (x || '').toLowerCase()));
  const prev = new Set((versions[versions.length - 2].executive_differentiators || []).map((x) => (x || '').toLowerCase()));
  const inter = [...last].filter((x) => prev.has(x)).length;
  const union = new Set([...last, ...prev]).size || 1;
  return Math.round((inter / union) * 100);
}

// Executive Brand Consistency™ across outputs
export function computeBrandConsistency(identity) {
  const outputs = ['executive_summary', 'leadership_narrative', 'executive_brand_statement'];
  const present = outputs.filter((k) => identity && identity[k]);
  const score = Math.round((present.length / outputs.length) * 100);
  return {
    score,
    outputs: [
      { name: 'Executive Summary', consistent: !!identity?.executive_summary, source: 'verified' },
      { name: 'Leadership Narrative', consistent: !!identity?.leadership_narrative, source: 'verified' },
      { name: 'Brand Statement', consistent: !!identity?.executive_brand_statement, source: 'ai_generated' },
      { name: 'Top Competencies', consistent: (identity?.top_competencies || []).length > 0, source: 'verified' },
      { name: 'Leadership Strengths', consistent: (identity?.leadership_strengths || []).length > 0, source: 'verified' },
      { name: 'Career Highlights', consistent: (identity?.career_highlights || []).length > 0, source: 'verified' },
    ],
  };
}

// Identity Explainability™ — why a section was generated
export function explainSection(identity, sectionKey) {
  const sources = safeParse(identity?.source_verification_json, {});
  const sv = sources[sectionKey] || 'ai_generated';
  const evidence = identity?.evidence_count || 0;
  const map = {
    executive_summary: ['Executive Success Story', 'Evidence Ledger™', 'Career Intelligence™'],
    leadership_narrative: ['Executive Success Story', 'Executive Journey™'],
    core_value_proposition: ['Executive Story Intelligence™', 'Outcome Intelligence™'],
    leadership_philosophy: ['Executive Coach™', 'Leadership DNA™'],
    executive_brand_statement: ['Executive Brand Engine™', 'Executive Identity Graph™'],
    professional_headline: ['Executive Identity Graph™', 'Target Role'],
    top_competencies: ['Leadership DNA™', 'Executive Readiness™'],
    leadership_strengths: ['Executive Readiness™', 'Leadership Analytics™'],
    executive_differentiators: ['Executive Differentiator Engine™', 'Executive Story Intelligence™'],
    career_highlights: ['Evidence Vault', 'Achievements Ledger'],
    achievements: ['Evidence Vault', 'Outcome Intelligence™'],
    executive_readiness: ['Executive Readiness™', 'Evidence Framework™'],
    story_confidence: ['Story Confidence Engine™', 'Evidence Reliability™'],
    evidence_count: ['Evidence Ledger™'],
  };
  const generatedFrom = map[sectionKey] || ['Executive Identity Graph™'];
  const aiContribution = sv === 'verified' ? 'None — grounded in verified evidence' : sv === 'ai_assisted' ? 'AI synthesized over verified evidence' : 'AI generated from identity context';
  return {
    section: sectionKey,
    sourceLabel: sv,
    generatedFrom,
    aiContribution,
    verifiedRecords: evidence,
    confidence: identity?.story_confidence || 0,
    reasoning: `${sectionKey.replace(/_/g, ' ')} was ${sv === 'verified' ? 'derived directly from verified evidence' : sv === 'ai_assisted' ? 'synthesized by AI over verified evidence' : 'generated by AI from your canonical identity context'}, supported by ${evidence} verified evidence records.`,
  };
}

function buildRecommendations(identity, health, gaps) {
  const recs = [];
  gaps.forEach((g) => recs.push({ title: `Improve ${g.area}`, impact: g.severity === 'high' ? 'High' : g.severity === 'medium' ? 'Medium' : 'Low', detail: g.detail, fix: g.fix, why: 'Addressing this raises identity completeness and executive positioning.' }));
  if (health.brandConsistency < 70) recs.push({ title: 'Strengthen brand consistency', impact: 'High', detail: 'Executive brand statement is missing.', fix: 'Run the Executive Brand Engine™.', why: 'A consistent brand raises trust across every professional output.' });
  const order = { High: 0, Medium: 1, Low: 2 };
  return recs.sort((a, b) => (order[a.impact] || 3) - (order[b.impact] || 3));
}