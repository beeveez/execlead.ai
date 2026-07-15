import React, { useState, useEffect } from 'react';
import { History, GitCommit } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PortfolioSection from './PortfolioSection';

const CHANGE_COLORS = {
  initial: '#6366f1', leadership_dna_updated: '#ec4899', certification_added: '#8b5cf6',
  promotion_added: '#f59e0b', trust_updated: '#3b82f6', achievement_added: '#10b981',
  evidence_added: '#06b6d4', profile_updated: '#6366f1', story_updated: '#f59e0b',
  default: '#6366f1',
};

export default function VersionHistory({ data }) {
  const [versions, setVersions] = useState(data.versions || []);

  useEffect(() => {
    base44.entities.PortfolioVersion.filter({}, '-created_date', 20)
      .then(res => setVersions(res || []))
      .catch(() => setVersions([]));
  }, []);

  return (
    <PortfolioSection id="versions" title="Version History™" icon={History} color="#8b5cf6">
      {versions.length > 0 ? (
        <div className="space-y-2">
          {versions.map((v, i) => {
            const color = CHANGE_COLORS[v.change_type] || CHANGE_COLORS.default;
            return (
              <div key={v.id} className="flex items-start gap-3 pl-3 border-l-2" style={{ borderColor: `${color}40` }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/80 font-mono">{v.version_number}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}15`, color }}>{v.change_type?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-[10px] text-white/50 truncate">{v.change_description || 'Portfolio updated'}</div>
                  <div className="text-[9px] text-white/20">
                    {v.created_date ? new Date(v.created_date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                    {v.completeness_score ? ` · Completeness: ${v.completeness_score}%` : ''}
                    {v.health_score ? ` · Health: ${v.health_score}` : ''}
                  </div>
                </div>
                {i === 0 && <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Current</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <GitCommit size={24} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">No version history yet. Versions are created automatically as you update your portfolio.</p>
        </div>
      )}
    </PortfolioSection>
  );
}