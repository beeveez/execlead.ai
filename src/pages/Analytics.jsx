import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SCORE_DIMENSIONS } from "@/lib/constants";
import { BarChart3, TrendingUp, Loader2, Award } from "lucide-react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell
} from "recharts";
import moment from "moment";

export default function Analytics() {
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) setProfile(profiles[0]);
        const res = await base44.entities.ChallengeResult.list("-created_date", 100);
        setResults(res.reverse());
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  // Average scores across all results
  const avgScores = SCORE_DIMENSIONS.map(dim => ({
    dimension: dim.short,
    fullLabel: dim.label,
    value: results.length > 0
      ? Math.round(results.reduce((a, r) => a + (r[dim.key] || 0), 0) / results.length)
      : 0,
    color: dim.color,
  }));

  // Trend data (overall score over time)
  const trendData = results.slice(-15).map((r, i) => ({
    name: `#${i + 1}`,
    overall: Math.round(SCORE_DIMENSIONS.slice(0, 4).reduce((a, dim) => a + (r[dim.key] || 0), 0) / 4),
    truthfulness: r.truthfulness_score || 0,
  }));

  // Category performance
  const categoryMap = {};
  results.forEach(r => {
    if (!r.category) return;
    if (!categoryMap[r.category]) categoryMap[r.category] = { total: 0, count: 0 };
    const avg = SCORE_DIMENSIONS.slice(0, 4).reduce((a, dim) => a + (r[dim.key] || 0), 0) / 4;
    categoryMap[r.category].total += avg;
    categoryMap[r.category].count += 1;
  });
  const categoryData = Object.entries(categoryMap)
    .map(([cat, data]) => ({ category: cat.length > 12 ? cat.slice(0, 10) + "…" : cat, score: Math.round(data.total / data.count) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Heat map data: scores by dimension
  const heatmapData = SCORE_DIMENSIONS.slice(0, 8).map(dim => {
    const scores = results.slice(-10).map(r => r[dim.key] || 0);
    return { label: dim.short, scores, avg: Math.round(scores.reduce((a, s) => a + s, 0) / (scores.length || 1)) };
  });

  const getHeatColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    if (score > 0) return "#ef4444";
    return "#1a1a25";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <BarChart3 size={12} className="text-emerald-400" />
          Leadership Analytics
        </div>
        <h1 className="text-2xl font-bold text-white">Your Executive Growth</h1>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20">
          <BarChart3 size={32} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/30 text-sm">Complete challenges and simulations to see your analytics.</p>
        </div>
      ) : (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Total Sessions</div>
              <div className="text-2xl font-bold text-white">{results.length}</div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Overall Avg</div>
              <div className="text-2xl font-bold text-indigo-400">
                {Math.round(avgScores.slice(0, 4).reduce((a, s) => a + s.value, 0) / 4)}
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Truthfulness</div>
              <div className="text-2xl font-bold text-red-400">
                {avgScores.find(s => s.fullLabel === "Truthfulness")?.value || 0}
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Learning Streak</div>
              <div className="text-2xl font-bold text-orange-400">{profile?.streak_days || 0}d</div>
            </div>
          </div>

          {/* Radar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award size={14} className="text-indigo-400" />
              Performance Radar ({SCORE_DIMENSIONS.length} Dimensions)
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={avgScores}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-400" />
                Score Trend
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} stroke="rgba(255,255,255,0.05)" />
                    <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} stroke="rgba(255,255,255,0.05)" />
                    <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="overall" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 3 }} name="Overall" />
                    <Line type="monotone" dataKey="truthfulness" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} name="Truthfulness" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Category Performance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={14} className="text-cyan-400" />
                Top Categories
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} stroke="rgba(255,255,255,0.05)" />
                    <YAxis type="category" dataKey="category" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} stroke="rgba(255,255,255,0.05)" width={70} />
                    <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getHeatColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Heat Map */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Score Heat Map (Last 10 Sessions)</h2>
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="flex gap-1 mb-2">
                  <div className="w-16 flex-shrink-0" />
                  {results.slice(-10).map((_, i) => (
                    <div key={i} className="flex-1 text-center text-white/20 text-xs">#{i + 1}</div>
                  ))}
                </div>
                {heatmapData.map(row => (
                  <div key={row.label} className="flex gap-1 mb-1">
                    <div className="w-16 flex-shrink-0 text-white/40 text-xs flex items-center">{row.label}</div>
                    {row.scores.map((score, i) => (
                      <div
                        key={i}
                        className="flex-1 h-8 rounded flex items-center justify-center text-xs font-medium transition-all"
                        style={{ backgroundColor: getHeatColor(score) + "30", color: score > 0 ? getHeatColor(score) : "rgba(255,255,255,0.1)" }}
                        title={`${row.label}: ${score}`}
                      >
                        {score > 0 ? score : ""}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#10b98130" }} /><span className="text-white/30">80+</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#3b82f630" }} /><span className="text-white/30">60+</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#f59e0b30" }} /><span className="text-white/30">40+</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#ef444430" }} /><span className="text-white/30">Below 40</span></div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}