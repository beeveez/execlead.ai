import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { COMPETENCY_CATEGORIES, PROFICIENCY_LEVELS } from "@/lib/competencyCatalog";

const SIX_DOMAINS = COMPETENCY_CATEGORIES.filter((c) => c.id !== "certifications");

const PROFICIENCY_BY_LEVEL = PROFICIENCY_LEVELS.reduce((acc, p) => {
  acc[p.level] = p;
  return acc;
}, {});

export function proficiencyToScore(proficiencyId) {
  const level = PROFICIENCY_LEVELS.find((p) => p.id === proficiencyId)?.level || 0;
  return level > 0 ? Math.round((level / 8) * 100) : 0;
}

export function computeDomainSummary(competencies) {
  return SIX_DOMAINS.map((domain) => {
    const domainComps = competencies.filter((c) => c.category === domain.id);
    const scores = domainComps
      .map((c) => c.competency_score || proficiencyToScore(c.proficiency))
      .filter((s) => s > 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const confidenceScores = domainComps.map((c) => c.confidence_score || 0).filter((s) => s > 0);
    const avgConfidence = confidenceScores.length > 0 ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) : 0;
    const proficiencyLevels = domainComps.map((c) => PROFICIENCY_LEVELS.find((p) => p.id === c.proficiency)?.level || 0);
    const highestLevel = proficiencyLevels.length > 0 ? Math.max(...proficiencyLevels) : 0;
    const proficiency = highestLevel > 0 ? PROFICIENCY_BY_LEVEL[highestLevel] : null;
    return {
      ...domain,
      score: avgScore,
      confidence: avgConfidence,
      competencyCount: domainComps.length,
      proficiencyLevel: highestLevel,
      proficiencyLabel: proficiency?.label || "Not Assessed",
      proficiencyColor: proficiency?.color || "#71717A",
      competencies: domainComps.sort((a, b) => (b.competency_score || 0) - (a.competency_score || 0)),
    };
  });
}

export const ARCHETYPES = {
  lead_yourself: { label: "The Self-Aware Leader", desc: "You lead with deep self-knowledge and emotional intelligence." },
  lead_people: { label: "The People Leader", desc: "You excel at developing and empowering teams." },
  lead_business: { label: "The Business Strategist", desc: "You drive organizational success with sharp commercial acumen." },
  lead_technology: { label: "The Digital Pioneer", desc: "You leverage technology to transform organizations." },
  lead_change: { label: "The Change Agent", desc: "You thrive in transformation and stakeholder alignment." },
  lead_legacy: { label: "The Legacy Builder", desc: "You think in decades and build enduring executive impact." },
};

export function useExecutiveIntelligence() {
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const records = await base44.entities.ExecutiveCompetency.list("-updated_date", 200);
        if (mounted) setCompetencies(records);
      } catch (e) {}
      if (mounted) setLoading(false);
    };
    load();
    const unsubscribe = base44.entities.ExecutiveCompetency.subscribe((event) => {
      setCompetencies((prev) => {
        if (event.type === "create") return [...prev, event.data];
        if (event.type === "update") return prev.map((c) => (c.id === event.data.id ? event.data : c));
        if (event.type === "delete") return prev.filter((c) => c.id !== event.data.id);
        return prev;
      });
    });
    return () => { mounted = false; unsubscribe(); };
  }, []);

  const domainSummary = useMemo(() => computeDomainSummary(competencies), [competencies]);
  const overallScore = useMemo(() => {
    const scores = domainSummary.map((d) => d.score);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [domainSummary]);
  const overallConfidence = useMemo(() => {
    const c = domainSummary.map((d) => d.confidence);
    return c.length > 0 ? Math.round(c.reduce((a, b) => a + b, 0) / c.length) : 0;
  }, [domainSummary]);
  const overallProficiency = useMemo(() => {
    const level = Math.round((overallScore / 100) * 8) || 0;
    return level > 0 ? PROFICIENCY_BY_LEVEL[level] : null;
  }, [overallScore]);
  const strongestDomain = useMemo(() => {
    const s = domainSummary.filter((d) => d.score > 0);
    return s.length > 0 ? s.reduce((max, d) => (d.score > max.score ? d : max)) : null;
  }, [domainSummary]);
  const growthDomain = useMemo(() => {
    const s = domainSummary.filter((d) => d.score > 0);
    return s.length > 0 ? s.reduce((min, d) => (d.score < min.score ? d : min)) : null;
  }, [domainSummary]);
  const archetype = useMemo(() => {
    if (!strongestDomain) return null;
    return ARCHETYPES[strongestDomain.id] || null;
  }, [strongestDomain]);

  const competencyIntelligence = useMemo(() => {
    const verified = competencies.filter((c) => c.verified);
    const emerging = competencies.filter((c) => {
      const lvl = PROFICIENCY_LEVELS.find((p) => p.id === c.proficiency)?.level || 0;
      return lvl >= 1 && lvl <= 2;
    });
    const developing = competencies.filter((c) => {
      const lvl = PROFICIENCY_LEVELS.find((p) => p.id === c.proficiency)?.level || 0;
      return lvl >= 3 && lvl <= 4;
    });
    const gaps = competencies.filter((c) => {
      const s = c.competency_score || proficiencyToScore(c.proficiency);
      return s > 0 && s < 40;
    });
    return { verified, emerging, developing, gaps };
  }, [competencies]);

  const chartData = useMemo(() => domainSummary.map((d) => ({
    domain: d.label, label: d.label, score: d.score, color: d.color,
    proficiencyLabel: d.proficiencyLabel, competencyCount: d.competencyCount,
  })), [domainSummary]);

  return {
    competencies, domainSummary, chartData, overallScore, overallConfidence,
    overallProficiency, strongestDomain, growthDomain, archetype,
    competencyIntelligence, loading, sixDomains: SIX_DOMAINS,
  };
}