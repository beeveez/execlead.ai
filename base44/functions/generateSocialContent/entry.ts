import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ALLOWED = new Set(['admin', 'content_manager', 'marketing_admin', 'platform_admin', 'super_admin', 'founder_root_admin']);
const BRAND = `EXECLEAD.AI is an AI-powered Executive Leadership Operating System™. Tagline: One Leadership Journey. One AI Platform. Core promise: Help ambitious professionals become exceptional executive leaders. Approved capabilities include Executive Readiness™, EXEC™ Concierge, Executive Simulations™, Executive Journey™, Executive Identity™, evidence-based leadership development, coaching and decision practice. Never guarantee promotions, salary, ROI or outcomes.`;
const RULES = `Never invent customers, partnerships, certifications, revenue, funding, employees, coaches, research, awards, testimonials, history, performance statistics, capabilities or market claims. Do not attack competitors or make unsupported superiority claims. Avoid generic AI marketing language.`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ALLOWED.has(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    if (!body.platform || !body.pillar || !body.contentType || !body.topic) return Response.json({ error: 'Platform, pillar, content type and topic are required.' }, { status: 400 });

    const safeList = async (entity, filter) => { try { return await base44.asServiceRole.entities[entity].filter(filter, '-updated_date', 20); } catch { return []; } };
    const [articles, releases, founderStories] = await Promise.all([
      safeList('KnowledgeArticle', { published: true }),
      safeList('ProductRelease', { status: 'released' }),
      safeList('FounderStory', {}),
    ]);
    const query = body.topic.toLowerCase();
    const pick = (items, fields) => items.find((item) => fields.some((field) => String(item[field] || '').toLowerCase().includes(query))) || items[0];
    let evidence = BRAND;
    const sources = ['Approved Brand Messaging', 'Platform Configuration'];
    if (body.sourceType === 'knowledge_article') { const item = pick(articles, ['title', 'question', 'category']); if (item) { evidence += `\nKnowledge Center: ${item.title}. ${item.short_answer || ''} ${item.detailed_answer || ''}`; sources.push('Executive Knowledge Center™'); } }
    if (['product_milestone', 'product_feature', 'company_announcement'].includes(body.sourceType)) { const item = pick(releases, ['release_name', 'release_notes']); if (item) { evidence += `\nApproved release: ${item.release_name}. ${item.release_notes || ''}`; sources.push('Approved Release Notes'); } }
    if (body.sourceType === 'founder_story') { const item = founderStories[0]; if (item) { evidence += `\nApproved founder narrative: ${item.why_execlead || ''} ${item.leadership_philosophy || ''} ${(item.biggest_lessons || []).join(' ')}`; sources.push('Approved Founder Narrative'); } }

    const requestText = `${body.topic} ${body.instruction || ''}`;
    const numericClaim = /(?:\$|£|€)?\b\d[\d,.]*(?:%|k|m|b|\+)?\s*(users|customers|partners|employees|coaches|awards|revenue|funding)/i.exec(requestText);
    const unsupportedPhrase = /\b(partnered with|partnership with|certified by|funded by|raised (?:\$|£|€)|won (?:an? )?award|customers include|trusted by)\b/i.exec(requestText);
    const deterministicIssues = [];
    if (numericClaim && !evidence.toLowerCase().includes(numericClaim[0].toLowerCase())) deterministicIssues.push(`Unsupported claim: “${numericClaim[0]}” is not confirmed by approved sources.`);
    if (unsupportedPhrase && !evidence.toLowerCase().includes(unsupportedPhrase[0].toLowerCase())) deterministicIssues.push(`Unsupported claim category: “${unsupportedPhrase[0]}” is not confirmed by approved sources.`);
    const platformRules = { linkedin: 'professional, thoughtful, story-driven, moderate length, strong hook, clear spacing, 3-4 hashtags, minimal emojis', facebook: 'conversational, accessible, community-oriented, short paragraphs and clear CTA', x: 'concise, strong opening, high information density, under 280 characters unless a clearly numbered thread is necessary', instagram: 'visual-first caption, short paragraphs, strong hook, CTA and 4-6 relevant hashtags' };
    const prompt = `You are EXEC™, the governed Social Content Engine™ for EXECLEAD.AI.\n${BRAND}\n${RULES}\nPlatform: ${body.platform} — ${platformRules[body.platform]}\nPillar: ${body.pillar}\nContent type: ${body.contentType}\nVoice: ${body.voice || 'company'}\nTopic: ${body.topic}\nInstruction: ${body.instruction || 'None'}\nRevision action: ${body.action || 'Generate'}\nExisting draft: ${body.existingDraft || 'None'}\nAPPROVED EVIDENCE ONLY:\n${evidence}\nCreate a meaningful, specific post grounded only in the evidence. If the request contains unsupported facts, exclude them and list them under potential_issues. Generate 3 distinct hooks (direct, contrarian, vision), 3 complete variations (professional, conversational, founder voice), a context-appropriate optional CTA, a small hashtag set, and a visual concept that does not pretend to be a real product screenshot. Score truthfulness, brand alignment, positioning, clarity, originality, professionalism, audience fit, platform fit, CTA quality, and evidence support from 0-100.`;
    const schema = { type: 'object', properties: { title: { type: 'string' }, hooks: { type: 'array', items: { type: 'string' } }, variations: { type: 'object', properties: { professional: { type: 'string' }, conversational: { type: 'string' }, founder_voice: { type: 'string' } } }, cta: { type: 'string' }, hashtags: { type: 'array', items: { type: 'string' } }, visual_concept: { type: 'string' }, potential_issues: { type: 'array', items: { type: 'string' } }, quality: { type: 'object', properties: { truthfulness: { type: 'number' }, brand_alignment: { type: 'number' }, positioning: { type: 'number' }, clarity: { type: 'number' }, originality: { type: 'number' }, professionalism: { type: 'number' }, audience_fit: { type: 'number' }, platform_fit: { type: 'number' }, cta_quality: { type: 'number' }, evidence_support: { type: 'number' }, hallucination_safety: { type: 'number' } } } } };
    const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema });
    const safeGenerated = deterministicIssues.length ? {
      ...generated,
      title: 'Building the Next Stage of EXECLEAD.AI',
      hooks: ['Growth is more than a number. It is the quality of each leadership journey.', 'EXECLEAD.AI is building toward its next stage of growth.', 'One Leadership Journey. One AI Platform.'],
      variations: {
        professional: 'EXECLEAD.AI is building toward its next stage of growth with a clear focus: helping ambitious professionals become exceptional executive leaders. Our AI-powered Executive Leadership Operating System™ brings readiness, decision practice, coaching, leadership simulations, identity, and evidence-based development into one continuous journey.',
        conversational: 'We are building toward the next stage of EXECLEAD.AI with one clear idea in mind: leadership growth should be continuous, practical, and grounded in evidence. One Leadership Journey. One AI Platform.',
        founder_voice: 'Building EXECLEAD.AI is a long-term commitment to a simple belief: ambitious professionals deserve a more practical way to prepare for executive leadership. We are continuing to build that journey carefully—grounded in evidence, decision practice, and human approval.',
      },
      cta: 'Follow EXECLEAD.AI as we build the next stage of the platform.',
      hashtags: ['#EXECLEADAI', '#ExecutiveLeadership', '#ExecutiveReadiness', '#LeadershipDevelopment'],
      visual_concept: 'A restrained EXECLEAD.AI brand graphic showing a leadership journey progressing through readiness, practice, evidence, and growth; not a product screenshot.',
      quality: { ...(generated.quality || {}), truthfulness: 0, evidence_support: 0, hallucination_safety: 0 },
    } : generated;
    const issues = [...deterministicIssues, ...(safeGenerated.potential_issues || [])];
    const scores = Object.values(safeGenerated.quality || {}).filter((value) => typeof value === 'number');
    const qualityScore = Math.round(scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length));
    const truthfulnessStatus = issues.length ? 'flagged' : 'passed';
    return Response.json({ ...safeGenerated, source_references: [...new Set(sources)], potential_issues: issues, truthfulness_status: truthfulnessStatus, ai_quality_score: issues.length ? Math.min(79, qualityScore) : qualityScore, selected_draft: safeGenerated.variations?.[body.voice === 'founder' ? 'founder_voice' : 'professional'] || '' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}