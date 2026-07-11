import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { getChartTheme } from "@/lib/chartTheme";
import { COMPETENCY_CATEGORIES, PROFICIENCY_LEVELS } from "@/lib/competencyCatalog";
import { Brain, ChevronRight, TrendingUp, TrendingDown, Minus, Award } from "lucide-react";

const SIX_DOMAINS = COMPETENCY_CATEGORIES.filter((c) => c.id !== "certifications");

const PROFICIENCY_BY_LEVEL = PROFICIENCY_LEVELS.reduce((acc, p) => {
  acc[p.level] = p;
  return acc;
}, {});

function proficiencyToScore(proficiencyId) {
  const level = PROFICIENCY_LEVELS.find((p) => p.id === proficiencyId)?.level || 0;
  return level > 0 ? Math.round((level / 8) * 100) : 0;
}

function computeDomainSummary(competencies) {
  return SIX_DOMAINS.map((domain) => {
    const domainComps = competencies.filter((c) => c.category === domain.id);
    const scores = domainComps
      .map((c) => c.competency_score || proficiencyToScore(c.proficiency))
      .filter((s) => s > 0);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    const proficiencyLevels = domainComps.map(
      (c) => PROFICIENCY_LEVELS.find((p) => p.id === c.proficiency)?.level || 0
    );
    const highestLevel =
      proficiencyLevels.length > 0 ? Math.max(...proficiencyLevels) : 0;
    const proficiency = highestLevel > 0 ? PROFICIENCY_BY_LEVEL[highestLevel] : null;
    return {
      ...domain,
      score: avgScore,
      competencyCount: domainComps.length,
      proficiencyLevel: highestLevel,
      proficiencyLabel: proficiency?.label || "Not Assessed",
      proficiencyColor: proficiency?.color || "#71717A",
      competencies: domainComps.sort((a, b) => (b.competency_score || 0) - (a.competency_score || 0)),
    };
  });
}

function RadarTooltip({ active, payload, theme }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div
      style={{
        background: theme.tooltipBg,
        color: theme.tooltipText,
        border: `1px solid ${theme.tooltipBorder}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
        <span style={{ fontWeight: 600 }}>{item.label}</span>
      </div>
      <div style={{ opacity: 0.8 }}>Maturity Score: {item.score}/100</div>
      <div style={{ opacity: 0.7, fontSize: 11 }}>{item.proficiencyLabel}</div>
      <div style={{ opacity: 0.6, fontSize: 11 }}>{item.competencyCount} competencies</div>
    </div>
  );
}

const TrendIcon = ({ trend }) => {
  if (trend === "up") return <TrendingUp size={11} className="text-emerald-400" />;
  if (trend === "down") return <TrendingDown size={11} className="text-red-400" />;
  return <Minus size={11} className="text-white/30" />;
};

export default function DomainMaturityRadar() {
  const { resolvedTheme } = useTheme();
  const theme = getChartTheme(resolvedTheme);
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const records = await base44.entities.ExecutiveCompetency.list("-updated_date", 200);
        if (mounted) setCompetencies(records);
      } catch (e) {
        // silent — empty state will render
      }
      if (mounted) setLoading(false);
    };
    load();

    // Real-time subscription — updates chart as competencies change
    const unsubscribe = base44.entities.ExecutiveCompetency.subscribe((event) => {
      setCompetencies((prev) => {
        if (event.type === "create") return [...prev, event.data];
        if (event.type === "update")
          return prev.map((c) => (c.id === event.data.id ? event.data : c));
        if (event.type === "delete")
          return prev.filter((c) => c.id !== event.data.id);
        return prev;
      });
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const domainSummary = useMemo(() => computeDomainSummary(competencies), [competencies]);
  const overallScore = useMemo(() => {
    const scores = domainSummary.map((d) => d.score);
    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  }, [domainSummary]);

  const overallProficiency = useMemo(() => {
    const level = Math.round((overallScore / 100) * 8) || 0;
    return level > 0 ? PROFICIENCY_BY_LEVEL[level] : null;
  }, [overallScore]);

  const chartData = domainSummary.map((d) => ({
    domain: d.label,
    label: d.label,
    score: d.score,
    color: d.color,
    proficiencyLabel: d.proficiencyLabel,
    competencyCount: d.competencyCount,
  }));

  const selected = selectedDomain
    ? domainSummary.find((d) => d.id === selectedDomain)
    : null;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Brain size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">ELIM™ Competency Domains</h3>
            <p className="text-white/30 text-xs">Six Executive Capability Domains · EECF™</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{overallScore}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Overall Maturity</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[320px]">
          <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      ) : competencies.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[320px] text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
            <Brain size={20} className="text-indigo-400" />
          </div>
          <p className="text-white/70 text-sm font-medium">No competency data yet</p>
          <p className="text-white/40 text-xs mt-2 max-w-sm leading-relaxed">
            Complete Leadership DNA™, simulations, learning paths, or add experience to generate your Executive Intelligence.
          </p>
        </div>
      ) : (
        <>
          {/* Radar Chart */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <RadarChart data={chartData} outerRadius="70%">
                <PolarGrid stroke={theme.gridLine} />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fill: theme.axisLabel, fontSize: 11, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  angle={90}
                  tick={{ fill: theme.tickLabel, fontSize: 10 }}
                  axisLine={false}
                />
                <Tooltip content={<RadarTooltip theme={theme} />} />
                <Radar
                  dataKey="score"
                  stroke={theme.radarBorder}
                  fill={theme.radarFill}
                  strokeWidth={2}
                  dot={{ r: 4, fill: theme.pointFill, stroke: theme.radarBorder, strokeWidth: 1.5 }}
                />
              </RadarChart>
            </ResponsiveContainer>
            {overallProficiency && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium" style={{ color: overallProficiency.color }}>
                {overallProficiency.label}
              </div>
            )}
          </div>

          {/* Domain Legend — clickable */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
            {domainSummary.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(selectedDomain === d.id ? null : d.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                  selectedDomain === d.id
                    ? "bg-white/10 border-white/20"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white/80 truncate">{d.label}</div>
                  <div className="text-[10px] text-white/40 truncate">
                    {d.score}/100 · {d.competencyCount} skills
                  </div>
                </div>
                <ChevronRight
                  size={12}
                  className={`text-white/30 transition-transform flex-shrink-0 ${
                    selectedDomain === d.id ? "rotate-90" : ""
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Selected Domain Detail */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <selected.icon size={16} style={{ color: selected.color }} />
                      <span className="text-sm font-semibold text-white">{selected.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium border"
                        style={{
                          color: selected.proficiencyColor,
                          borderColor: `${selected.proficiencyColor}30`,
                          background: `${selected.proficiencyColor}15`,
                        }}
                      >
                        {selected.proficiencyLabel}
                      </span>
                      <span className="text-lg font-bold text-white">{selected.score}</span>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs mb-3">{selected.description}</p>
                  {selected.competencies.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {selected.competencies.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02] hover:bg-white/5 transition-colors"
                        >
                          <Award size={11} className="text-white/30 flex-shrink-0" />
                          <span className="text-xs text-white/70 flex-1 truncate">{c.competency_name}</span>
                          {c.verified && (
                            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              Verified
                            </span>
                          )}
                          <TrendIcon trend={c.growth_trend} />
                          <span className="text-xs font-semibold text-white/80 w-8 text-right">
                            {c.competency_score || proficiencyToScore(c.proficiency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-xs text-center py-2">
                      No competencies in this domain yet.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}