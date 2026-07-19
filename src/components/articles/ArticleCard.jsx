import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';

export const CATEGORY_LABELS = {
  leadership: 'Leadership',
  executive_strategy: 'Executive Strategy',
  career_growth: 'Career Growth',
  ai_leadership: 'AI Leadership',
  enterprise_transformation: 'Enterprise Transformation',
  executive_interviews: 'Executive Interviews',
  digital_leadership: 'Digital Leadership',
  strategy: 'Strategy',
  management: 'Management',
  communication: 'Communication',
};

export const DIFFICULTY_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export const DIFFICULTY_COLORS = {
  beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  intermediate: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  advanced: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  expert: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function ArticleCard({ article, index = 0 }) {
  const slug = article.slug || article.id;
  const category = CATEGORY_LABELS[article.category] || article.category;
  const difficulty = DIFFICULTY_LABELS[article.difficulty] || 'Intermediate';
  const diffColor = DIFFICULTY_COLORS[article.difficulty] || DIFFICULTY_COLORS.intermediate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index || 0) * 0.08 }}
    >
      <Link
        to={`/articles/${slug}`}
        data-cursor-label="Read Article"
        className="block bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300 group h-full"
      >
        {/* Cover Image */}
        <div className="h-40 bg-gradient-to-br from-amber-500/10 to-accent-orange/5 overflow-hidden relative">
          {article.featured_image_url ? (
            <img src={article.featured_image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen size={28} className="text-amber-400/30" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 bg-black/50 backdrop-blur rounded-full text-amber-400 font-medium">{category}</span>
          </div>
          {article.featured && (
            <div className="absolute top-3 right-3">
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/80 rounded-full text-white font-medium">Featured</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">{article.title}</h3>
          {article.excerpt && <p className="text-white/40 text-sm leading-relaxed line-clamp-2 mb-3">{article.excerpt}</p>}
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-1 text-white/30 text-xs">
              <Clock size={12} /> {article.reading_time_minutes || 5} min read
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${diffColor}`}>{difficulty}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Read Article <ArrowRight size={12} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}