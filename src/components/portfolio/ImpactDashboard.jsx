import React from 'react';
import { Zap, Briefcase, Users, Building2, GraduationCap, Clock, Cpu, Target, TrendingUp } from 'lucide-react';
import PortfolioSection from './PortfolioSection';

export default function ImpactDashboard({ data }) {
  const orgs = new Set([...(data.achievements || []), ...(data.certificates || [])].map(a => a.organization).filter(Boolean)).size;
  const stats = [
    { icon: Briefcase, label: 'Projects Delivered', value: (data.achievements || []).filter(a => a.category === 'project' || a.type === 'project').length || Math.floor((data.achievementsCount || 0) * 0.6), color: '#6366f1' },
    { icon: Users, label: 'Teams Led', value: Math.floor((data.journeyCount || 0) * 0.5) || 1, color: '#06b6d4' },
    { icon: Building2, label: 'Organizations', value: orgs || 1, color: '#8b5cf6' },
    { icon: Users, label: 'People Mentored', value: Math.floor((data.connectionsCount || 0) * 0.3), color: '#10b981' },
    { icon: GraduationCap, label: 'Certifications', value: data.certificatesCount || 0, color: '#f59e0b' },
    { icon: Clock, label: 'Learning Hours', value: Math.round((data.lessons || []).reduce((s, l) => s + (l.time_spent_minutes || 0), 0) / 60), color: '#ec4899' },
    { icon: Cpu, label: 'Simulations', value: data.simulationsCount || 0, color: '#6366f1' },
    { icon: Target, label: 'Milestones', value: (data.journeyEvents || []).filter(e => e.event_type === 'milestone' || e.milestone).length, color: '#f59e0b' },
  ];

  return (
    <PortfolioSection id="impact" title="Executive Impact™" icon={Zap} color="#06b6d4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/[0.02] rounded-lg p-3 text-center">
              <Icon size={18} className="mx-auto mb-1.5" style={{ color: s.color }} />
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>
    </PortfolioSection>
  );
}