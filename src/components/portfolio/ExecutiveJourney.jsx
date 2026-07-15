import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, ExternalLink, Zap, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PortfolioSection from './PortfolioSection';

const STAGES = ['Aspiring', 'Emerging', 'Developing', 'Accelerating', 'Executive', 'Senior Executive'];

export default function ExecutiveJourney({ data }) {
  const navigate = useNavigate();
  const [journeyEvents, setJourneyEvents] = useState([]);

  useEffect(() => {
    base44.entities.JourneyEvent.filter({}, '-created_date', 20)
      .then(res => setJourneyEvents(res || []))
      .catch(() => setJourneyEvents([]));
  }, []);

  const xp = journeyEvents.reduce((s, e) => s + (e.xp_earned || e.xp || 0), 0);
  const stageIdx = Math.min(STAGES.length - 1, Math.floor(xp / 500));
  const milestones = journeyEvents.filter(e => e.event_type === 'milestone' || e.milestone).length;

  return (
    <PortfolioSection id="journey" title="Executive Journey™" icon={Map} color="#f59e0b"
      action={<button onClick={() => navigate('/journey')} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70"><ExternalLink size={10} /> Full Journey</button>}>
      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <div className="flex items-center gap-1 text-amber-400"><Zap size={14} /><span className="text-xl font-bold">{xp}</span></div>
          <div className="text-[9px] text-white/30 uppercase">Journey XP</div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="text-center">
          <div className="text-xl font-bold text-amber-400">{STAGES[stageIdx]}</div>
          <div className="text-[9px] text-white/30 uppercase">Current Stage</div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="text-center">
          <div className="text-xl font-bold text-white/70">{milestones}</div>
          <div className="text-[9px] text-white/30 uppercase">Milestones</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {STAGES.map((s, i) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= stageIdx ? 'bg-amber-500/60' : 'bg-white/5'}`} title={s} />
        ))}
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[8px] text-white/20">{STAGES[0]}</span>
        <span className="text-[8px] text-white/20">{STAGES[STAGES.length - 1]}</span>
      </div>
    </PortfolioSection>
  );
}