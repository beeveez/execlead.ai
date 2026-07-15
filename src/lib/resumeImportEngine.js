import { User, FileText, Briefcase, GraduationCap, Award, Zap, Crown, Globe, Trophy, BookOpen, Users, FolderKanban, Mail } from 'lucide-react';

export const SECTION_META = {
  personal_info: { label: 'Personal Information', icon: User, color: '#6366f1' },
  executive_summary: { label: 'Executive Summary', icon: FileText, color: '#06b6d4' },
  work_experience: { label: 'Work Experience', icon: Briefcase, color: '#10b981' },
  education: { label: 'Education', icon: GraduationCap, color: '#a855f7' },
  certifications: { label: 'Certifications', icon: Award, color: '#f59e0b' },
  skills: { label: 'Skills', icon: Zap, color: '#3b82f6' },
  leadership_competencies: { label: 'Leadership Competencies', icon: Crown, color: '#ec4899' },
  languages: { label: 'Languages', icon: Globe, color: '#14b8a6' },
  awards: { label: 'Awards', icon: Trophy, color: '#eab308' },
  publications: { label: 'Publications', icon: BookOpen, color: '#8b5cf6' },
  memberships: { label: 'Memberships', icon: Users, color: '#f97316' },
  projects: { label: 'Projects', icon: FolderKanban, color: '#0ea5e9' },
  references: { label: 'References', icon: Mail, color: '#64748b' },
};

export const SECTION_ORDER = [
  'personal_info', 'executive_summary', 'work_experience', 'education',
  'certifications', 'skills', 'leadership_competencies', 'languages',
  'awards', 'publications', 'memberships', 'projects', 'references',
];

export function getConfidenceBadge(score) {
  if (score >= 95) return { label: 'Verified', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
  if (score >= 80) return { label: 'High Confidence', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
  if (score >= 60) return { label: 'Review Required', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
  return { label: 'Manual Confirmation', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
}

export function getSectionConfidence(sectionKey, data) {
  const section = data && data[sectionKey];
  if (!section) return 0;
  if (Array.isArray(section)) {
    const confs = section.filter(i => i && typeof i.confidence === 'number').map(i => i.confidence);
    return confs.length > 0 ? Math.round(confs.reduce((a, b) => a + b, 0) / confs.length) : 80;
  }
  if (typeof section === 'object' && typeof section.confidence === 'number') return section.confidence;
  return 80;
}

export function hasSectionData(sectionKey, data) {
  const section = data && data[sectionKey];
  if (!section) return false;
  if (Array.isArray(section)) return section.length > 0;
  if (typeof section === 'object') {
    return Object.keys(section).filter(k => k !== 'confidence').some(k => section[k]);
  }
  return !!section;
}

export function getSectionStatus(sectionKey, extractedData, existingProfile) {
  if (!existingProfile) return 'new';
  const map = {
    personal_info: existingProfile.full_name || existingProfile.city || existingProfile.linkedin_url,
    executive_summary: existingProfile.bio,
    work_experience: existingProfile.experience_json,
    education: existingProfile.education_json,
    certifications: existingProfile.certifications_json,
    skills: existingProfile.skills && existingProfile.skills.length > 0 ? 'has' : '',
    languages: existingProfile.languages_json,
    awards: existingProfile.awards_json,
    projects: existingProfile.projects_json,
  };
  const existing = map[sectionKey];
  if (!existing || existing === '' || existing === '[]') return 'new';
  return 'update';
}