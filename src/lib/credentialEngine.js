import { ShieldCheck, GraduationCap, Briefcase, Crown } from 'lucide-react';

export const CREDENTIAL_LEVELS = [
  { id: 'bronze', label: 'Bronze', color: '#cd7f32', tier: 1 },
  { id: 'silver', label: 'Silver', color: '#c0c0c0', tier: 2 },
  { id: 'gold', label: 'Gold', color: '#ffd700', tier: 3 },
  { id: 'platinum', label: 'Platinum', color: '#e5e4e2', tier: 4 },
  { id: 'distinguished', label: 'Distinguished', color: '#9b59b6', tier: 5 },
  { id: 'fellow', label: 'Fellow', color: '#3498db', tier: 6 },
  { id: 'master_executive', label: 'Master Executive™', color: '#e74c3c', tier: 7 },
];

export const CREDENTIAL_TYPES = [
  { id: 'leadership', label: 'Leadership', color: '#6366f1', icon: ShieldCheck },
  { id: 'learning', label: 'Learning', color: '#10b981', icon: GraduationCap },
  { id: 'career', label: 'Career', color: '#f59e0b', icon: Briefcase },
  { id: 'founder', label: 'Founder', color: '#ec4899', icon: Crown },
];

const R = {
  hasDNA: (d) => d.hasDNA,
  hasSummary: (d) => d.hasSummary,
  hasResume: (d) => d.hasResume,
  hasReputation: (d) => d.hasReputation,
  hasLegacy: (d) => d.hasLegacy,
  hasStory: (d) => d.hasStory,
  lessons5: (d) => (d.lessonsCount || 0) >= 5,
  lessons10: (d) => (d.lessonsCount || 0) >= 10,
  lessons20: (d) => (d.lessonsCount || 0) >= 20,
  sims3: (d) => (d.simulationsCount || 0) >= 3,
  sims5: (d) => (d.simulationsCount || 0) >= 5,
  sims10: (d) => (d.simulationsCount || 0) >= 10,
  ach3: (d) => (d.achievementsCount || 0) >= 3,
  ach5: (d) => (d.achievementsCount || 0) >= 5,
  ach10: (d) => (d.achievementsCount || 0) >= 10,
  ev3: (d) => (d.evidenceCount || 0) >= 3,
  ev5: (d) => (d.evidenceCount || 0) >= 5,
  ver3: (d) => (d.verificationsCount || 0) >= 3,
  ver5: (d) => (d.verificationsCount || 0) >= 5,
  jrn3: (d) => (d.journeyCount || 0) >= 3,
  jrn5: (d) => (d.journeyCount || 0) >= 5,
  con5: (d) => (d.connectionsCount || 0) >= 5,
  con20: (d) => (d.connectionsCount || 0) >= 20,
};

export const CREDENTIAL_CATALOG = [
  // Leadership
  { key: 'executive_readiness', name: 'Executive Readiness™', type: 'leadership', level: 'gold', description: 'Demonstrated executive readiness through verified assessments', requirements: [{id:'hasDNA',label:'Leadership DNA Completed'},{id:'lessons5',label:'5+ Learning Hours'},{id:'sims3',label:'3+ Simulations'},{id:'ver3',label:'Identity Verified'},{id:'ev3',label:'3+ Evidence Items'}], evidence: ['Leadership DNA','Learning Records','Simulation Results','Executive Trust'], isPermanent: true },
  { key: 'leadership_dna', name: 'Leadership DNA™', type: 'leadership', level: 'silver', description: 'Completed Leadership DNA assessment', requirements: [{id:'hasDNA',label:'Leadership DNA Completed'},{id:'ev3',label:'3+ Evidence Items'}], evidence: ['Leadership DNA','Assessment Results'], isPermanent: true },
  { key: 'executive_trust', name: 'Executive Trust™', type: 'leadership', level: 'gold', description: 'Established executive trust through verification', requirements: [{id:'ver3',label:'3+ Verifications'},{id:'ev5',label:'5+ Evidence Items'},{id:'hasSummary',label:'Executive Summary'}], evidence: ['Identity Verification','Evidence Vault','Trust Score'], isPermanent: true },
  { key: 'executive_reputation', name: 'Executive Reputation™', type: 'leadership', level: 'gold', description: 'Built executive reputation through contributions', requirements: [{id:'hasReputation',label:'Reputation Established'},{id:'con5',label:'5+ Network Connections'},{id:'ach5',label:'5+ Achievements'}], evidence: ['Reputation Score','Network','Achievements'], isPermanent: true },
  { key: 'board_readiness', name: 'Board Readiness™', type: 'leadership', level: 'platinum', description: 'Prepared for board-level leadership', requirements: [{id:'hasDNA',label:'Leadership DNA'},{id:'hasLegacy',label:'Executive Legacy'},{id:'sims5',label:'5+ Simulations'},{id:'ver5',label:'5+ Verifications'},{id:'ev5',label:'5+ Evidence'},{id:'ach10',label:'10+ Achievements'}], evidence: ['Governance','Leadership DNA','Legacy','Simulations'], isPermanent: true },
  { key: 'executive_communication', name: 'Executive Communication™', type: 'leadership', level: 'silver', description: 'Demonstrated executive communication skills', requirements: [{id:'hasSummary',label:'Executive Summary'},{id:'hasStory',label:'Executive Story'},{id:'sims3',label:'3+ Simulations'}], evidence: ['Executive Story','Simulations','Summary'], isPermanent: true },
  { key: 'strategic_leadership', name: 'Strategic Leadership™', type: 'leadership', level: 'gold', description: 'Demonstrated strategic leadership capability', requirements: [{id:'hasDNA',label:'Leadership DNA'},{id:'sims5',label:'5+ Simulations'},{id:'ach5',label:'5+ Achievements'},{id:'jrn3',label:'3+ Journey Events'}], evidence: ['Leadership DNA','Simulations','Achievements','Journey'], isPermanent: true },
  { key: 'enterprise_leadership', name: 'Enterprise Leadership™', type: 'leadership', level: 'gold', description: 'Demonstrated enterprise-level leadership', requirements: [{id:'hasDNA',label:'Leadership DNA'},{id:'ach10',label:'10+ Achievements'},{id:'con20',label:'20+ Connections'},{id:'jrn5',label:'5+ Journey Events'}], evidence: ['Leadership DNA','Achievements','Network','Journey'], isPermanent: true },
  { key: 'ai_leadership', name: 'AI Leadership™', type: 'leadership', level: 'gold', description: 'Demonstrated AI leadership capability', requirements: [{id:'sims5',label:'5+ Simulations'},{id:'lessons10',label:'10+ Learning Hours'},{id:'hasSummary',label:'Executive Summary'}], evidence: ['Simulations','Learning','AI Sessions'], isPermanent: true },
  { key: 'digital_transformation', name: 'Digital Transformation™', type: 'leadership', level: 'silver', description: 'Demonstrated digital transformation leadership', requirements: [{id:'sims3',label:'3+ Simulations'},{id:'lessons5',label:'5+ Learning Hours'},{id:'ach3',label:'3+ Achievements'}], evidence: ['Simulations','Learning','Achievements'], isPermanent: true },
  { key: 'governance_risk', name: 'Governance & Risk™', type: 'leadership', level: 'gold', description: 'Demonstrated governance and risk management', requirements: [{id:'hasDNA',label:'Leadership DNA'},{id:'sims5',label:'5+ Simulations'},{id:'ev5',label:'5+ Evidence'},{id:'ver3',label:'3+ Verifications'}], evidence: ['Leadership DNA','Simulations','Evidence'], isPermanent: true },
  { key: 'operational_excellence', name: 'Operational Excellence™', type: 'leadership', level: 'silver', description: 'Demonstrated operational excellence', requirements: [{id:'ach5',label:'5+ Achievements'},{id:'lessons5',label:'5+ Learning Hours'},{id:'sims3',label:'3+ Simulations'}], evidence: ['Achievements','Learning','Simulations'], isPermanent: true },
  { key: 'innovation_leadership', name: 'Innovation Leadership™', type: 'leadership', level: 'gold', description: 'Demonstrated innovation leadership', requirements: [{id:'ach5',label:'5+ Achievements'},{id:'sims5',label:'5+ Simulations'},{id:'hasStory',label:'Executive Story'}], evidence: ['Achievements','Simulations','Story'], isPermanent: true },
  // Learning
  { key: 'executive_academy', name: 'Executive Academy™', type: 'learning', level: 'silver', description: 'Completed executive academy learning', requirements: [{id:'lessons10',label:'10+ Learning Hours'},{id:'hasSummary',label:'Executive Summary'}], evidence: ['Learning Records','Lesson Progress'], isPermanent: false, renewal: 'annual' },
  { key: 'leadership_programs', name: 'Leadership Programs™', type: 'learning', level: 'gold', description: 'Completed leadership development programs', requirements: [{id:'lessons20',label:'20+ Learning Hours'},{id:'sims3',label:'3+ Simulations'},{id:'hasDNA',label:'Leadership DNA'}], evidence: ['Learning','Simulations','Leadership DNA'], isPermanent: false, renewal: 'annual' },
  { key: 'simulation_completion', name: 'Simulation Completion™', type: 'learning', level: 'bronze', description: 'Completed executive simulations', requirements: [{id:'sims3',label:'3+ Simulations'}], evidence: ['Simulation Results'], isPermanent: true },
  { key: 'case_study_excellence', name: 'Case Study Excellence™', type: 'learning', level: 'silver', description: 'Demonstrated case study excellence', requirements: [{id:'hasLegacy',label:'Executive Legacy'},{id:'ach3',label:'3+ Achievements'}], evidence: ['Case Studies','Legacy'], isPermanent: true },
  // Career
  { key: 'verified_executive', name: 'Verified Executive™', type: 'career', level: 'platinum', description: 'Verified executive leadership identity', requirements: [{id:'ver5',label:'5+ Verifications'},{id:'hasDNA',label:'Leadership DNA'},{id:'ev5',label:'5+ Evidence'},{id:'ach10',label:'10+ Achievements'},{id:'hasResume',label:'Resume on File'},{id:'hasStory',label:'Executive Story'}], evidence: ['Identity','Leadership DNA','Evidence','Achievements','Story'], isPermanent: true },
  { key: 'verified_professional', name: 'Verified Professional™', type: 'career', level: 'silver', description: 'Verified professional identity', requirements: [{id:'ver3',label:'3+ Verifications'},{id:'hasResume',label:'Resume on File'},{id:'hasSummary',label:'Executive Summary'}], evidence: ['Identity','Resume','Summary'], isPermanent: true },
  { key: 'verified_enterprise_leader', name: 'Verified Enterprise Leader™', type: 'career', level: 'gold', description: 'Verified enterprise leadership capability', requirements: [{id:'hasDNA',label:'Leadership DNA'},{id:'ver3',label:'3+ Verifications'},{id:'ach5',label:'5+ Achievements'},{id:'jrn3',label:'3+ Journey Events'},{id:'ev3',label:'3+ Evidence'}], evidence: ['Leadership DNA','Identity','Achievements','Journey'], isPermanent: true },
  { key: 'verified_board_candidate', name: 'Verified Board Candidate™', type: 'career', level: 'distinguished', description: 'Verified board candidacy readiness', requirements: [{id:'hasDNA',label:'Leadership DNA'},{id:'hasLegacy',label:'Executive Legacy'},{id:'sims5',label:'5+ Simulations'},{id:'ver5',label:'5+ Verifications'},{id:'ev5',label:'5+ Evidence'},{id:'ach10',label:'10+ Achievements'},{id:'hasStory',label:'Executive Story'}], evidence: ['Leadership DNA','Legacy','Simulations','Identity','Evidence'], isPermanent: true },
  // Founder
  { key: 'founding_member', name: 'Founding Member™', type: 'founder', level: 'distinguished', description: 'Founding member of EXECLEAD.AI', requirements: [{id:'hasSummary',label:'Executive Summary'}], evidence: ['Founding Member Status'], isPermanent: true },
  { key: 'platform_contributor', name: 'Platform Contributor™', type: 'founder', level: 'silver', description: 'Contributed to platform development', requirements: [{id:'ach3',label:'3+ Achievements'},{id:'con5',label:'5+ Network Connections'}], evidence: ['Achievements','Contributions'], isPermanent: true },
  { key: 'executive_mentor', name: 'Executive Mentor™', type: 'founder', level: 'gold', description: 'Recognized as executive mentor', requirements: [{id:'con20',label:'20+ Connections'},{id:'hasLegacy',label:'Executive Legacy'},{id:'ach5',label:'5+ Achievements'}], evidence: ['Network','Legacy','Mentorship'], isPermanent: true },
  { key: 'community_leader', name: 'Community Leader™', type: 'founder', level: 'silver', description: 'Recognized community leadership', requirements: [{id:'con5',label:'5+ Connections'},{id:'hasStory',label:'Executive Story'},{id:'ach3',label:'3+ Achievements'}], evidence: ['Network','Story','Community'], isPermanent: true },
];

export function evaluateCredential(credentialKey, data) {
  const cred = CREDENTIAL_CATALOG.find(c => c.key === credentialKey);
  if (!cred) return { met: [], unmet: [], progress: 0, canIssue: false };
  const met = [], unmet = [];
  cred.requirements.forEach(req => {
    const check = R[req.id];
    if (check && check(data)) met.push(req); else unmet.push(req);
  });
  return { met, unmet, progress: Math.round((met.length / cred.requirements.length) * 100), canIssue: unmet.length === 0 };
}

export function getEarnedKeys(credentials) {
  return new Set((credentials || []).map(c => c.credential_key));
}

export function getAvailableCredentials(credentials, data) {
  const earned = getEarnedKeys(credentials);
  return CREDENTIAL_CATALOG
    .filter(c => !earned.has(c.key))
    .map(c => ({ ...c, evaluation: evaluateCredential(c.key, data) }))
    .sort((a, b) => b.evaluation.progress - a.evaluation.progress);
}

export function getRecommendedCredentials(credentials, data) {
  return getAvailableCredentials(credentials, data).filter(c => c.evaluation.progress >= 40 && c.evaluation.progress < 100).slice(0, 3);
}

export function generateCredentialNumber() {
  return `ELC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

export function generateCredentialHash(cred) {
  return btoa(`${cred.credential_key}:${cred.credential_number}:${cred.issued_date || Date.now()}`).substr(0, 32);
}

export function getLevelMeta(levelId) {
  return CREDENTIAL_LEVELS.find(l => l.id === levelId) || CREDENTIAL_LEVELS[0];
}

export function getTypeMeta(typeId) {
  return CREDENTIAL_TYPES.find(t => t.id === typeId) || CREDENTIAL_TYPES[0];
}