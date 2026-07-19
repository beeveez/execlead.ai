import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Briefcase, TrendingUp, Brain, Building2, Users, Monitor, BookOpen, Clock } from "lucide-react";

const CATEGORIES = [
  { icon: Crown, name: "Leadership", desc: "Executive leadership principles" },
  { icon: Briefcase, name: "Executive Strategy", desc: "Strategic thinking for leaders" },
  { icon: TrendingUp, name: "Career Growth", desc: "Navigate your career path" },
  { icon: Brain, name: "AI Leadership", desc: "Leading in the AI era" },
  { icon: Building2, name: "Enterprise Transformation", desc: "Organizational change at scale" },
  { icon: Users, name: "Executive Interviews", desc: "Insights from proven executives" },
  { icon: Monitor, name: "Digital Leadership", desc: "Technology leadership" },
];

const FEATURED_TOPICS = [
  { title: "How Future CIOs Think", category: "AI Leadership", readTime: "8 min" },
  { title: "The Leadership Skills AI Cannot Replace", category: "Leadership", readTime: "6 min" },
  { title: "Executive Presence for Technology Leaders", category: "Career Growth", readTime: "7 min" },
];

const CONTENT_HUB = [
  "Leadership Articles", "Executive Playbooks", "Career Guides", "Leadership Frameworks",
  "Case Studies", "AI Leadership Research", "Company Insights", "Interview Guides",
];

export default function ExecutiveInsightsSection() {
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
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center hover:bg-white/[0.04] hover:border-amber-500/20 transition-all cursor-default"
            >
              <cat.icon size={20} className="text-amber-400 mx-auto mb-2" />
              <span className="text-white/60 text-xs font-medium leading-tight block">{cat.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Featured Articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {FEATURED_TOPICS.map((article, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-default group"
            >
              <div className="h-32 bg-gradient-to-br from-amber-500/10 to-accent-orange/5 rounded-lg mb-4 flex items-center justify-center">
                <BookOpen size={24} className="text-amber-400/40" />
              </div>
              <span className="text-xs text-accent-orange font-medium">{article.category}</span>
              <h3 className="font-semibold text-white mt-1 mb-2 group-hover:text-amber-400 transition-colors">{article.title}</h3>
              <div className="flex items-center gap-1 text-white/30 text-xs">
                <Clock size={12} /> {article.readTime} read
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Hub Categories */}
        <div className="border-t border-white/5 pt-12">
          <h3 className="text-center text-sm font-semibold text-white/40 uppercase tracking-wider mb-6">Content Hub</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {CONTENT_HUB.map((cat, i) => (
              <span key={i} className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-sm text-white/50 hover:text-amber-400 hover:border-amber-500/20 transition-all cursor-default">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}