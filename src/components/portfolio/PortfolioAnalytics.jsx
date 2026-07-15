import React from 'react';
import { BarChart3, Eye, Download, Share2, TrendingUp } from 'lucide-react';
import PortfolioSection from './PortfolioSection';

export default function PortfolioAnalytics({ data }) {
  const views = data.profileViews || [];
  const uniqueViewers = new Set(views.map(v => v.viewer_id || v.user_id)).size;
  const totalViews = views.length;
  const recentViews = views.slice(0, 5);

  return (
    <PortfolioSection id="analytics" title="Portfolio Analytics™" icon={BarChart3} color="#f59e0b">
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat icon={Eye} label="Profile Views" value={totalViews} color="#f59e0b" />
        <Stat icon={TrendingUp} label="Unique Viewers" value={uniqueViewers} color="#06b6d4" />
        <Stat icon={Share2} label="Shares" value={0} color="#8b5cf6" />
      </div>
      {recentViews.length > 0 ? (
        <div className="space-y-1">
          <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Recent Views</div>
          {recentViews.map((v) => (
            <div key={v.id} className="flex items-center gap-2 text-[10px] text-white/40">
              <div className="w-1 h-1 rounded-full bg-amber-400" />
              <span className="truncate flex-1">{v.viewer_name || v.viewer_id || 'Anonymous'}</span>
              <span className="text-white/20">{v.created_date ? new Date(v.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/30 text-center py-2">No profile views recorded yet.</p>
      )}
    </PortfolioSection>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
      <Icon size={14} className="mx-auto mb-1" style={{ color }} />
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[8px] text-white/30 uppercase">{label}</div>
    </div>
  );
}