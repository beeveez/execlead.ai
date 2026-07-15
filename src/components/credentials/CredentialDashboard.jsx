import React from 'react';
import { Award, TrendingUp, Target, Activity } from 'lucide-react';

export default function CredentialDashboard({ earnedCount, availableCount, recommendedCount, data }) {
  const totalCreds = earnedCount + availableCount;
  const completion = totalCreds > 0 ? Math.round((earnedCount / totalCreds) * 100) : 0;
  const stats = [
    { icon: Award, label: 'Credentials Earned', value: earnedCount, color: '#10b981' },
    { icon: Target, label: 'In Progress', value: availableCount, color: '#f59e0b' },
    { icon: TrendingUp, label: 'Recommended', value: recommendedCount, color: '#6366f1' },
    { icon: Activity, label: 'Completion', value: `${completion}%`, color: '#06b6d4' },
  ];
  return (
    <div className="max-w-5xl mx-auto px-4 pt-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <Icon size={16} className="mb-1.5" style={{ color: s.color }} />
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-[8px] uppercase tracking-wider text-white/30">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}