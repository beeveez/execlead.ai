import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, ExternalLink, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PortfolioSection from './PortfolioSection';

export default function LeadershipDNASection({ data }) {
  const navigate = useNavigate();
  const [dna, setDna] = useState(null);

  useEffect(() => {
    base44.entities.LeadershipDNA.filter({}, '-created_date', 1)
      .then(res => setDna(res[0] || null))
      .catch(() => setDna(null));
  }, []);

  const scores = dna?.scores || dna?.dimensions || {};
  const scoreEntries = Object.entries(scores).slice(0, 6);
  const avgScore = scoreEntries.length > 0 ? Math.round(scoreEntries.reduce((s, [, v]) => s + (typeof v === 'number' ? v : 0), 0) / scoreEntries.length) : 0;

  return (
    <PortfolioSection id="leadership-dna" title="Leadership DNA™" icon={Radar} color="#ec4899"
      action={<button onClick={() => navigate('/leadership-dna')} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70"><ExternalLink size={10} /> Full Report</button>}>
      {dna ? (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl font-bold text-pink-400">{avgScore}</div>
            <div>
              <div className="text-[10px] text-white/30">Overall DNA Score</div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400"><TrendingUp size={9} /> Active profile</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {scoreEntries.map(([dim, val]) => (
              <div key={dim} className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 w-28 capitalize truncate">{dim.replace(/_/g, ' ')}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-pink-500/60" style={{ width: `${typeof val === 'number' ? val : 0}%` }} />
                </div>
                <span className="text-[10px] text-white/60 w-8 text-right">{typeof val === 'number' ? val : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-white/30 mb-2">No Leadership DNA assessment yet.</p>
          <button onClick={() => navigate('/leadership-dna')} className="px-3 py-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs hover:bg-pink-500/20">
            Take Assessment
          </button>
        </div>
      )}
    </PortfolioSection>
  );
}