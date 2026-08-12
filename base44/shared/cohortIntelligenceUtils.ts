export const behaviorDefinitions = [
  { key: 'business_impact_communication', label: 'Business-Impact Communication', terms: ['revenue', 'roi', 'cost', 'budget', 'business impact', 'outcome', 'value', 'kpi', 'financial'] },
  { key: 'stakeholder_alignment', label: 'Stakeholder Alignment Conversations', terms: ['stakeholder', 'alignment', 'align', 'consensus', 'buy-in', 'sponsor'] },
  { key: 'escalation_ownership', label: 'Escalation Ownership', terms: ['escalat', 'ownership', 'major incident', 'war room', 'accountable'] },
  { key: 'strategic_prioritization', label: 'Strategic Prioritization', terms: ['priorit', 'roadmap', 'strategy', 'strategic', 'tradeoff', 'objective'] },
  { key: 'cross_functional_influence', label: 'Cross-Functional Influence', terms: ['cross-functional', 'cross functional', 'influence', 'persuade', 'collaborate', 'coalition'] },
];

export const cohortDefinitions = [
  { key: 'support', label: 'Service Desk / Support Leaders', terms: ['service desk', 'support', 'help desk', 'customer support'] },
  { key: 'operations', label: 'Infrastructure & Operations Managers', terms: ['infrastructure', 'operations', 'sre', 'site reliability', 'network', 'platform engineer'] },
  { key: 'architecture', label: 'Architects / Engineering Leads', terms: ['architect', 'engineering lead', 'technical lead', 'developer lead', 'software engineering'] },
  { key: 'security', label: 'Security & Risk Leaders', terms: ['security', 'cyber', 'risk', 'compliance', 'governance'] },
  { key: 'transformation', label: 'Digital Transformation Professionals', terms: ['digital transformation', 'transformation', 'change leader', 'modernization', 'programme', 'program manager'] },
];

export function average(values) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + (Number(value) || 0), 0) / values.length) : 0;
}

export function classify(text, definitions) {
  const value = String(text || '').toLowerCase();
  return definitions.find((item) => item.terms.some((term) => value.includes(term)))?.key || null;
}

export async function listAll(entity) {
  const unique = new Map();
  for (let skip = 0; skip < 10000; skip += 500) {
    const page = await entity.list('-created_date', 500, skip);
    page.forEach((row) => unique.set(row.id, row));
    if (page.length < 500) break;
  }
  return [...unique.values()];
}