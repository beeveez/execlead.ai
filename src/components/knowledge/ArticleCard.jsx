import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Users } from 'lucide-react';

export default function ArticleCard({ article, onOpen, index = 0 }) {
  return (
    <motion.button
      onClick={() => onOpen(article.slug)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className="group text-left w-full rounded-2xl border border-white/8 bg-white/[0.02] hover:border-accent-orange/30 hover:bg-white/[0.04] transition-all p-4 flex flex-col"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-orange/10 text-accent-orange border border-accent-orange/20">{article.category}</span>
        <span className="text-[10px] text-white/30 capitalize">{article.difficulty}</span>
      </div>
      <div className="text-sm font-semibold text-white leading-snug mb-1.5 group-hover:text-accent-orange transition-colors">{article.question}</div>
      <p className="text-[12px] text-white/50 leading-relaxed line-clamp-2 flex-1">{article.short_answer}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-[10px] text-white/35">
          {(article.audience || []).slice(0, 2).map((a) => (
            <span key={a} className="flex items-center gap-1"><Users size={10} /> {a}</span>
          ))}
        </div>
        <span className="flex items-center gap-1 text-[11px] text-accent-orange/70 group-hover:text-accent-orange">Open <ChevronRight size={12} /></span>
      </div>
    </motion.button>
  );
}