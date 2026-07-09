import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Heart, MessageCircle, Bookmark, BadgeCheck, Crown, Star } from "lucide-react";
import { formatCount } from "@/lib/legacyLibrary";

export default function LegacyLetterCard({ letter, index = 0 }) {
  const excerpt = letter.message?.substring(0, 180) + (letter.message?.length > 180 ? "…" : "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        to={`/legacy-library/${letter.id}`}
        className="block bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all group h-full"
      >
        {/* Featured + Category */}
        <div className="flex items-center gap-2 mb-3">
          {letter.featured && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-[10px] font-medium">
              <Star size={10} /> Featured
            </span>
          )}
          <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-medium">
            {letter.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-white/90 font-semibold text-base leading-snug mb-1 group-hover:text-indigo-400 transition-colors line-clamp-2">
          {letter.title}
        </h3>
        {letter.subtitle && (
          <p className="text-white/40 text-xs mb-3 line-clamp-1">{letter.subtitle}</p>
        )}

        {/* Excerpt */}
        <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">{excerpt}</p>

        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          {letter.author_photo ? (
            <img src={letter.author_photo} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-medium">
              {letter.author_name?.charAt(0) || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-white/70 text-xs font-medium truncate">{letter.author_name}</span>
              {letter.author_verification_badge && <BadgeCheck size={12} className="text-indigo-400 flex-shrink-0" />}
              {letter.author_is_founder && <Crown size={12} className="text-amber-400 flex-shrink-0" />}
            </div>
            <div className="text-white/30 text-[10px] truncate">{letter.author_headline || letter.author_position}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-white/30 text-[10px]">
          <span className="flex items-center gap-1"><Eye size={11} /> {formatCount(letter.views)}</span>
          <span className="flex items-center gap-1"><Heart size={11} /> {formatCount(letter.likes)}</span>
          <span className="flex items-center gap-1"><MessageCircle size={11} /> {formatCount(letter.comments_count)}</span>
          <span className="flex items-center gap-1"><Bookmark size={11} /> {formatCount(letter.bookmarks)}</span>
        </div>
      </Link>
    </motion.div>
  );
}