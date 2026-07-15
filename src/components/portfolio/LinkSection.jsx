import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import PortfolioSection from './PortfolioSection';

export default function LinkSection({ section, link, description, stats }) {
  const navigate = useNavigate();
  const Icon = section.icon;
  return (
    <PortfolioSection id={section.id} title={section.title} icon={Icon} color={section.color}
      action={<button onClick={() => navigate(link)} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70"><ExternalLink size={10} /> View Full</button>}>
      <p className="text-xs text-white/40 mb-3">{description}</p>
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/[0.02] rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-white">{s.value}</div>
              <div className="text-[8px] text-white/30 uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => navigate(link)} className="w-full mt-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-white/50 text-xs hover:bg-white/[0.06] hover:text-white transition-colors">
        Open {section.title.replace('™', '')}
      </button>
    </PortfolioSection>
  );
}