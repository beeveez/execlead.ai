import React from 'react';
import { Trophy, Plus, BadgeCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PortfolioSection from './PortfolioSection';

export default function VerifiedAchievements({ data }) {
  const navigate = useNavigate();
  const achievements = data.achievements || [];

  return (
    <PortfolioSection id="achievements" title="Verified Achievements™" icon={Trophy} color="#10b981"
      action={<button onClick={() => navigate('/career')} className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300"><Plus size={10} /> Add</button>}>
      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {achievements.slice(0, 6).map((a) => (
            <div key={a.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80 font-medium truncate">{a.title || a.description || 'Achievement'}</div>
                  {a.organization && <div className="text-[10px] text-white/30 truncate">{a.organization}</div>}
                </div>
                {a.verified && <BadgeCheck size={14} className="text-blue-400 flex-shrink-0" />}
              </div>
              {a.date && <div className="flex items-center gap-1 text-[9px] text-white/30 mt-1"><Clock size={9} />{new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-white/30 mb-2">No achievements recorded yet.</p>
          <button onClick={() => navigate('/career')} className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/20">Add Achievement</button>
        </div>
      )}
    </PortfolioSection>
  );
}