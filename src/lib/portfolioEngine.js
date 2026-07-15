import {
  FileText, Clock, Dna, Map, Trophy, BookOpen, Star, ShieldCheck,
  GraduationCap, Cpu, PenLine, Lightbulb, Briefcase, FileCheck,
  Users, Globe, BarChart3, Landmark, CheckCircle2, Target, Eye,
} from 'lucide-react';

export const PORTFOLIO_SECTIONS = [
  { id: 'snapshot', number: 1, title: 'Executive Snapshot™', icon: FileText, weight: 5, color: '#6366f1' },
  { id: 'timeline', number: 2, title: 'Executive Timeline™', icon: Clock, weight: 8, color: '#8b5cf6' },
  { id: 'leadership-dna', number: 3, title: 'Leadership DNA™', icon: Dna, weight: 8, color: '#ec4899' },
  { id: 'journey', number: 4, title: 'Executive Journey™', icon: Map, weight: 7, color: '#f59e0b' },
  { id: 'achievements', number: 5, title: 'Verified Achievements™', icon: Trophy, weight: 8, color: '#10b981' },
  { id: 'case-studies', number: 6, title: 'Executive Case Studies™', icon: BookOpen, weight: 5, color: '#06b6d4' },
  { id: 'reputation', number: 7, title: 'Executive Reputation™', icon: Star, weight: 7, color: '#f59e0b' },
  { id: 'trust', number: 8, title: 'Executive Trust™', icon: ShieldCheck, weight: 8, color: '#3b82f6' },
  { id: 'learning', number: 9, title: 'Executive Learning Record™', icon: GraduationCap, weight: 6, color: '#8b5cf6' },
  { id: 'simulations', number: 10, title: 'Executive Simulations™', icon: Cpu, weight: 6, color: '#6366f1' },
  { id: 'journal', number: 11, title: 'Leadership Journal™', icon: PenLine, weight: 4, color: '#14b8a6' },
  { id: 'insights', number: 12, title: 'Executive Insights™', icon: Lightbulb, weight: 5, color: '#f59e0b' },
  { id: 'career-assets', number: 13, title: 'Career Assets™', icon: Briefcase, weight: 6, color: '#6366f1' },
  { id: 'documents', number: 14, title: 'Verified Documents™', icon: FileCheck, weight: 5, color: '#10b981' },
  { id: 'network', number: 15, title: 'Executive Network™', icon: Users, weight: 5, color: '#06b6d4' },
  { id: 'public-profile', number: 16, title: 'Public Profile™', icon: Globe, weight: 4, color: '#8b5cf6' },
  { id: 'analytics', number: 17, title: 'Portfolio Analytics™', icon: BarChart3, weight: 3, color: '#f59e0b' },
  { id: 'legacy', number: 18, title: 'Executive Legacy™', icon: Landmark, weight: 4, color: '#ef4444' },
];

export const SCOREBOARD_ITEMS = [
  { id: 'completeness', label: 'Portfolio Completeness™', icon: CheckCircle2, color: '#10b981' },
  { id: 'readiness', label: 'Executive Readiness™', icon: Target, color: '#6366f1' },
  { id: 'dna', label: 'Leadership DNA™', icon: Dna, color: '#ec4899' },
  { id: 'trust', label: 'Executive Trust™', icon: ShieldCheck, color: '#3b82f6' },
  { id: 'reputation', label: 'Executive Reputation™', icon: Star, color: '#f59e0b' },
  { id: 'journey', label: 'Journey Progress™', icon: Map, color: '#f59e0b' },
  { id: 'learning', label: 'Learning Completion™', icon: GraduationCap, color: '#8b5cf6' },
  { id: 'simulation', label: 'Simulation Readiness™', icon: Cpu, color: '#6366f1' },
  { id: 'career', label: 'Career Strength™', icon: Briefcase, color: '#06b6d4' },
  { id: 'visibility', label: 'Visibility™', icon: Eye, color: '#8b5cf6' },
];

export function getSectionScore(id, data) {
  switch (id) {
    case 'snapshot': return data.hasSummary ? 100 : 0;
    case 'timeline': return Math.min(100, (data.timelineCount || 0) * 10);
    case 'leadership-dna': return data.hasDNA ? 100 : 0;
    case 'journey': return Math.min(100, (data.journeyCount || 0) * 15);
    case 'achievements': return Math.min(100, (data.achievementsCount || 0) * 15);
    case 'case-studies': return Math.min(100, (data.caseStudiesCount || 0) * 25);
    case 'reputation': return data.hasReputation ? 100 : 0;
    case 'trust': return Math.min(100, (data.verificationsCount || 0) * 15);
    case 'learning': return Math.min(100, (data.lessonsCount || 0) * 10);
    case 'simulations': return Math.min(100, (data.simulationsCount || 0) * 20);
    case 'journal': return Math.min(100, (data.journalCount || 0) * 10);
    case 'insights': return data.hasInsights ? 100 : 0;
    case 'career-assets': return data.hasResume ? 100 : 0;
    case 'documents': return Math.min(100, (data.documentsCount || 0) * 20);
    case 'network': return Math.min(100, (data.connectionsCount || 0) * 5);
    case 'public-profile': return data.profileVisible ? 100 : 0;
    case 'analytics': return 100;
    case 'legacy': return data.hasLegacy ? 100 : 0;
    default: return 0;
  }
}

export function computeCompleteness(data) {
  const totalWeight = PORTFOLIO_SECTIONS.reduce((s, sec) => s + sec.weight, 0);
  const weighted = PORTFOLIO_SECTIONS.reduce((s, sec) => s + getSectionScore(sec.id, data) * sec.weight, 0);
  return Math.round(weighted / totalWeight);
}

export function getScoreboardScores(data, completeness) {
  return {
    completeness,
    readiness: data.readinessScore || 0,
    dna: data.dnaScore || 0,
    trust: Math.min(100, (data.verificationsCount || 0) * 15),
    reputation: data.reputationScore || 0,
    journey: Math.min(100, (data.journeyCount || 0) * 15),
    learning: Math.min(100, (data.lessonsCount || 0) * 10),
    simulation: data.simulationsCount > 0 ? Math.min(100, 40 + data.simulationsCount * 15) : 0,
    career: Math.min(100, (data.achievementsCount || 0) * 10 + (data.hasResume ? 30 : 0)),
    visibility: Math.min(100, (data.profileViewsCount || 0) * 5),
  };
}