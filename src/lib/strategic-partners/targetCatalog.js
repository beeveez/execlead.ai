export const STRATEGIC_TARGET_CAPACITY = 14;

export const APPROVED_PARTNER_TARGETS = [
  ['ServiceNow', 'technology', 'Technology', 'Enterprise workflow / IT / executive operations'],
  ['Microsoft', 'technology', 'Technology', 'Cloud, AI, enterprise distribution'],
  ['LinkedIn', 'talent_hr', 'Talent / HR', 'Executive talent, professional network, distribution'],
  ['Workday', 'talent_hr', 'Talent / HR', 'HCM, talent intelligence, enterprise HR'],
  ['Google Cloud', 'technology', 'Technology', 'Cloud, AI, enterprise infrastructure'],
  ['NVIDIA', 'technology', 'Technology', 'AI infrastructure and enterprise AI ecosystem'],
  ['SAP', 'technology', 'Technology', 'Enterprise business platform / workforce ecosystem'],
  ['Salesforce', 'enterprise_distribution', 'Enterprise Distribution', 'CRM, enterprise distribution, ecosystem'],
  ['Oracle', 'technology', 'Technology', 'Enterprise cloud, database, HR technology'],
  ['Apple', 'strategic_ecosystem', 'Strategic Alliance', 'Global technology ecosystem / executive reach'],
  ['Samsung', 'strategic_ecosystem', 'Strategic Alliance', 'Global technology ecosystem / geographic reach'],
  ['Accenture', 'enterprise_distribution', 'Consulting', 'Consulting, transformation, enterprise deployment'],
  ['Deloitte', 'enterprise_distribution', 'Consulting', 'Consulting, transformation, enterprise clients'],
  ['PwC', 'enterprise_distribution', 'Consulting', 'Consulting, advisory, enterprise transformation'],
].map(([partnerName, partnerCategory, partnerType, strategicRole]) => ({
  partnerName,
  partnerCategory,
  partnerType,
  strategicRole,
  priority: 'P1',
  targetRegion: 'Global',
  targetIndustry: 'Cross-industry',
  strategicRationale: strategicRole,
  partnerStatus: 'Prospect',
  partnershipStage: 'Target',
}));