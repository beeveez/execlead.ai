import React from 'react';
import { BadgeCheck, Crown, Download, Share2, Sparkles } from 'lucide-react';
import { computeCompleteness } from '@/lib/portfolioEngine';

export default function PortfolioHero({ user, data }) {
  const completeness = computeCompleteness(data);
  const initials = (user?.full_name || 'E').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const openToOps = user?.data?.open_to_opportunities;
  const visibility = user?.data?.portfolio_visibility || 'Private';

  const handleExport = () => {
    const doc = { title: 'Executive Portfolio', name: user?.full_name, completeness };
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'executive-portfolio.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6">
      <div className="bg-gradient-to-br from-indigo-500/10 via-white/[0.02] to-transparent border border-white/10 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row items-start gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
              {initials}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 flex gap-1">
              {user?.data?.identity_verified && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center" title="Verified Identity">
                  <BadgeCheck size={13} className="text-white" />
                </div>
              )}
              {user?.data?.is_founding_member && (
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center" title="Founding Member">
                  <Crown size={13} className="text-white" />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{user?.full_name || 'Executive'}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Executive Portfolio™
              </span>
            </div>
            <p className="text-sm text-white/50 mt-0.5">
              {user?.data?.current_role || 'Executive'} {user?.data?.organization ? `· ${user.data.organization}` : ''}
              {user?.data?.country ? ` · ${user.data.country}` : ''}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: 'Portfolio Completeness', value: `${completeness}%`, color: '#10b981' },
                { label: 'Achievements', value: data.achievementsCount || 0, color: '#6366f1' },
                { label: 'Certifications', value: data.certificatesCount || 0, color: '#8b5cf6' },
                { label: 'Simulations', value: data.simulationsCount || 0, color: '#06b6d4' },
              ].map((m) => (
                <div key={m.label} className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-1.5">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">{m.label}</span>
                  <div className="text-sm font-bold" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs hover:bg-white/10 transition-colors">
                <Download size={12} /> Export
              </button>
              <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/u/${user?.data?.username || user?.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs hover:bg-white/10 transition-colors">
                <Share2 size={12} /> Share
              </button>
              {openToOps && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <Sparkles size={10} /> Open to Opportunities
                </span>
              )}
              <span className="text-[10px] text-white/30">Visibility: {visibility}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}