import React from "react";
import { motion } from "framer-motion";
import { Quote, Star, Building2, TrendingUp, Award } from "lucide-react";

const TESTIMONIALS = [
  { quote: "EXECLEAD.AI transformed how we develop leaders. Our internal promotion rate increased by 40% in the first year.", author: "VP of People Operations", company: "Global Technology Services", metric: "40% promotion increase", icon: TrendingUp },
  { quote: "We replaced $200K in external executive coaching with a platform that reaches every manager in our organization.", author: "Chief Human Resources Officer", company: "Financial Services Enterprise", metric: "$200K coaching savings", icon: Award },
  { quote: "The succession planning capabilities gave us visibility into leadership gaps we didn't even know we had.", author: "Director of Talent Development", company: "Healthcare Network", metric: "12 critical gaps identified", icon: Building2 },
];

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Government", "Consulting", "Banking", "Telecommunications", "Energy", "Education", "Manufacturing", "Retail", "Media"];

export default function SocialProof() {
  return (
    <div className="space-y-12">
      {/* Industry badges */}
      <div>
        <p className="text-center text-white/30 text-xs uppercase tracking-widest mb-6">Trusted Across Industries</p>
        <div className="flex flex-wrap justify-center gap-3">
          {INDUSTRIES.map((industry, i) => (
            <motion.span
              key={industry}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-lg text-sm text-white/40 font-medium"
            >
              {industry}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="grid md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col"
          >
            <Quote size={24} className="text-indigo-400/30 mb-3" />
            <p className="text-white/60 text-sm leading-relaxed flex-1">"{t.quote}"</p>
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <t.icon size={14} className="text-indigo-400" />
                </div>
                <span className="text-emerald-400 text-xs font-semibold">{t.metric}</span>
              </div>
              <p className="text-white/70 text-xs font-medium">{t.author}</p>
              <p className="text-white/30 text-xs">{t.company}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analyst recognition placeholder */}
      <div className="bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent border border-white/5 rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Star size={18} className="text-amber-400" />
          <span className="text-white/40 text-xs uppercase tracking-widest">Analyst Recognition</span>
        </div>
        <p className="text-white/50 text-sm max-w-xl mx-auto">Recognized by leading industry analysts as a category-defining platform for executive leadership development.</p>
        <p className="text-white/20 text-xs mt-3">Gartner · Forrester · IDC · Josh Bersin</p>
      </div>
    </div>
  );
}