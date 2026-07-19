import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Briefcase, TrendingUp, Brain, Building2, Users, Monitor, BookOpen, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ArticleCard from "@/components/articles/ArticleCard";

const CATEGORY_ICONS = {
  leadership: Crown,
  executive_strategy: Briefcase,
  career_growth: TrendingUp,
  ai_leadership: Brain,
  enterprise_transformation: Building2,
  executive_interviews: Users,
  digital_leadership: Monitor,
};

const CATEGORY_SLUGS = {
  leadership: "leadership",
  executive_strategy: "executive_strategy",
  career_growth: "career_growth",
  ai_leadership: "ai_leadership",
  enterprise_transformation: "enterprise_transformation",
  executive_interviews: "executive_interviews",
  digital_leadership: "digital_leadership",
};

const CONTENT_HUB = [
  "Leadership Articles", "Executive Playbooks", "Career Guides", "Leadership Frameworks",
  "Case Studies", "AI Leadership Research", "Company Insights", "Interview Guides",
];

export default function ExecutiveInsightsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await base44.entities.ExecutiveInsight.filter(
          { status: { $in: ['published', 'featured'] } },
          '-published_at',
          3
        );
        if (!cancelled) setArticles(results || []);
      } catch (e) {
        // graceful degradation
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const categories = Object.entries(CATEGORY_ICONS);

  return (
    <section className="py-20 md:py-32 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 mb-4">
            <BookOpen size={12} />
            Executive Insights™
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Executive Leadership Insights™</h2>
          <p className="text-white/40 max-w-2xl mx-auto">Research, practical frameworks, executive perspectives, and AI-powered learning designed to help ambitious technology professionals develop executive leadership capabilities.</p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-16">
          {categories.map(([catKey, Icon], i) => (
            <motion.div key={catKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link
                to={`/articles`}
                data-cursor-label="Browse Category"
                className="block bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center hover:bg-white/[0.04] hover:border-amber-500/20 transition-all group"
              >
                <Icon size={20} className="text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-white/60 text-xs font-medium leading-tight block capitalize group-hover:text-amber-400 transition-colors">
                  {catKey.replace(/_/g, ' ')}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured Articles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Latest Articles</h3>
            <Link to="/articles" className="flex items-center gap-1 text-amber-400 text-xs hover:text-amber-300 transition-colors">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-72 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {articles.map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl">
              <BookOpen size={28} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm mb-4">Executive insights are being prepared as part of the Private Beta knowledge library.</p>
              <Link to="/articles" className="inline-flex items-center gap-1 text-amber-400 text-sm hover:text-amber-300 transition-colors">
                Explore Executive Insights <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Content Hub Categories */}
        <div className="border-t border-white/5 pt-12">
          <h3 className="text-center text-sm font-semibold text-white/40 uppercase tracking-wider mb-6">Content Hub</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {CONTENT_HUB.map((cat, i) => (
              <Link key={i} to="/articles" data-cursor-label="Browse Hub" className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-sm text-white/50 hover:text-amber-400 hover:border-amber-500/20 transition-all">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}