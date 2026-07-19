import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Bell, ArrowLeft, Compass } from 'lucide-react';

export default function ArticleEmptyState({ slug }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <BookOpen size={28} className="text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">This Executive Insight is Being Prepared</h1>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          This article is currently being prepared as part of the Private Beta knowledge library.
          Our team is crafting premium executive insights to help ambitious technology professionals
          become stronger leaders.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/articles"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-white font-medium px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
          >
            <Compass size={16} /> Explore Other Articles
          </Link>
          <Link
            to="/articles"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <ArrowLeft size={16} /> Return to Executive Insights
          </Link>
        </div>

        <p className="text-white/20 text-xs mt-8">
          {slug ? `Requested: /articles/${slug}` : 'The requested article could not be found.'}
        </p>
      </div>
    </div>
  );
}