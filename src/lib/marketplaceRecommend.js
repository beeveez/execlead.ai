// ============================================================
// MARKETPLACE AI RECOMMENDATION ENGINE
// Scores items against the user's career profile (target role,
// target company, industry, skills, promotion readiness) and
// returns ranked recommendations with human-readable reasons.
// ============================================================

export function scoreItem(item, profile) {
  if (!profile) return { score: 0, reasons: [] };
  let score = 0;
  const reasons = [];

  const tc = (profile.target_company || "").toLowerCase();
  const tr = (profile.target_role || "").toLowerCase();
  const ind = (profile.industry || "").toLowerCase();
  const skills = (profile.skills || []).map((s) => (s || "").toLowerCase());
  const readiness = profile.promotion_readiness || 0;

  const itemCompany = (item.company || item.collection || "").toLowerCase();
  const itemIndustry = (item.industry || "").toLowerCase();
  const itemLevel = (item.executive_level || "").toLowerCase();
  const tags = (item.tags || []).map((t) => (t || "").toLowerCase());

  // Company match — strongest signal
  if (tc && itemCompany === tc) {
    score += 45;
    reasons.push(`from the ${profile.target_company} collection`);
  }

  // Executive level / role match
  if (tr && itemLevel && (tr.includes(itemLevel) || itemLevel.includes(tr))) {
    score += 30;
    reasons.push(`for ${profile.target_role}`);
  }
  if (tr && tags.some((t) => tr.includes(t) || t.includes(tr))) {
    score += 12;
  }

  // Industry match
  if (ind && (itemIndustry === ind || tags.includes(ind))) {
    score += 22;
    reasons.push(`for the ${profile.industry} industry`);
  }

  // Skills match
  const skillHits = tags.filter((t) => skills.includes(t));
  if (skillHits.length) {
    score += skillHits.length * 8;
    reasons.push("matches your skills");
  }

  // Category keyword overlap with target role
  if (tr && item.category && tr.includes(item.category.toLowerCase())) {
    score += 8;
  }

  // Readiness-based nudges
  if (readiness < 50 && (item.difficulty === "beginner" || item.difficulty === "intermediate")) {
    score += 10;
    reasons.push("builds foundational readiness");
  }
  if (readiness >= 50 && item.difficulty === "executive") {
    score += 10;
    reasons.push("advanced executive prep");
  }

  return { score, reasons: reasons.slice(0, 2) };
}

export function getRecommendations(items, profile, limit = 8) {
  return items
    .map((item) => ({ item, ...scoreItem(item, profile) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function buildRecHeader(profile) {
  if (!profile) return "Recommended for your career goals";
  const role = profile.target_role;
  const company = profile.target_company;
  if (role && company) return `Because you're targeting ${role} at ${company}, we recommend`;
  if (role) return `Because you're targeting ${role}, we recommend`;
  if (company) return `Because you're targeting ${company}, we recommend`;
  if (profile.industry) return `Recommended for the ${profile.industry} industry`;
  return "Recommended for your career goals";
}

// Local instant search across all relevant fields.
export function searchItems(items, query) {
  if (!query || !query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter((item) => {
    const haystack = [
      item.title, item.description, item.category, item.company,
      item.collection, item.executive_level, item.industry,
      item.author, item.publisher, item.bundle_name,
      ...(item.tags || []),
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}