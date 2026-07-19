import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ArticleCard from './ArticleCard';

export default function RelatedArticles({ article }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const byCategory = await base44.entities.ExecutiveInsight.filter(
          { category: article.category, status: { $in: ['published', 'featured'] } },
          '-published_at',
          4
        );
        const filtered = (byCategory || []).filter(a => a.id !== article.id).slice(0, 3);
        if (!cancelled) setRelated(filtered);
      } catch (e) {
        // graceful degradation
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [article.id, article.category]);

  if (loading) return null;
  if (related.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-xl font-bold text-white mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map((a, i) => (
          <ArticleCard key={a.id} article={a} index={i} />
        ))}
      </div>
    </div>
  );
}