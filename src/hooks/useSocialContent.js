import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useSocialContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setItems(await base44.entities.SocialContent.list('-created_date', 200)); setLoading(false); }, []);
  useEffect(() => { load(); const unsubscribe = base44.entities.SocialContent.subscribe(load); return unsubscribe; }, [load]);
  const generate = async (form, action, existing) => {
    const media = form.mediaFile ? [(await base44.integrations.Core.UploadFile({ file: form.mediaFile })).file_url] : (existing?.media_urls || []);
    const response = await base44.functions.invoke('generateSocialContent', { ...form, action, existingDraft: existing?.draft || form.existingDraft || '' });
    const result = response.data;
    if (existing) {
      await base44.entities.SocialContent.update(existing.id, { title: result.title, draft: result.selected_draft, hooks: result.hooks, variations: result.variations, cta: result.cta, hashtags: result.hashtags, visual_concept: result.visual_concept, source_references: result.source_references, ai_quality_score: result.ai_quality_score, quality_checks: result.quality, truthfulness_status: result.truthfulness_status, brand_alignment_score: result.quality?.brand_alignment || 0, potential_issues: result.potential_issues, status: 'needs_review', approval_status: 'needs_review', regeneration_count: (existing.regeneration_count || 0) + 1 });
      return existing.id;
    }
    const user = await base44.auth.me();
    const created = await base44.entities.SocialContent.create({ content_id: `SC-${Date.now()}`, title: result.title, platform: form.platform, content_type: form.contentType, content_pillar: form.pillar, topic: form.topic, draft: result.selected_draft, platform_version: form.platform, founder_voice: form.voice === 'founder', voice: form.voice, source_type: form.sourceType, source_references: result.source_references, hooks: result.hooks, variations: result.variations, cta: result.cta, hashtags: result.hashtags, ai_quality_score: result.ai_quality_score, quality_checks: result.quality, truthfulness_status: result.truthfulness_status, brand_alignment_score: result.quality?.brand_alignment || 0, potential_issues: result.potential_issues, approval_status: 'needs_review', status: 'ai_generated', created_by_name: user.full_name || user.email, media_urls: media, visual_concept: result.visual_concept, performance_metrics: {}, regeneration_count: 0 });
    return created.id;
  };
  const update = async (id, patch) => { await base44.entities.SocialContent.update(id, patch); };
  return { items, loading, generate, update, reload: load };
}