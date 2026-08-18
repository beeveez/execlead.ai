export const PARTNER_CATEGORIES = [
  { id: 'technology', label: 'Technology Partners' },
  { id: 'enterprise_distribution', label: 'Enterprise Distribution' },
  { id: 'talent_hr', label: 'Talent & HR' },
  { id: 'education_certification', label: 'Education & Certification' },
  { id: 'strategic_ecosystem', label: 'Strategic Ecosystem' },
];
export const PARTNER_TYPES = ['Technology', 'AI', 'Cloud / Infrastructure', 'Enterprise Distribution', 'Consulting', 'Talent / HR', 'Recruiting', 'Education', 'Certification', 'Marketplace', 'Government', 'Financial', 'Industry', 'Strategic Alliance', 'Investment', 'Other'];
export const PARTNER_STATUSES = ['Prospect', 'Active', 'Paused', 'At Risk', 'Dormant', 'Terminated'];
export const PARTNER_STAGES = ['Target', 'Research', 'Prospect', 'Qualified', 'Executive Discussion', 'Strategic Proposal', 'Negotiation', 'Agreement Pending', 'Contracted', 'Pilot', 'Active', 'Expansion', 'Strategic Alliance', 'Dormant', 'Terminated'];
export const categoryLabel = (id) => PARTNER_CATEGORIES.find((item) => item.id === id)?.label || id;