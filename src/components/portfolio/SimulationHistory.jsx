import React, { useState, useEffect } from 'react';
import { Cpu, ExternalLink, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PortfolioSection from './PortfolioSection';

export default function SimulationHistory({ data }) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(data.simulations || []);

  useEffect(() => {
    base44.entities.SimulationSession.filter({}, '-created_date', 10)
      .then(res => setSessions(res || []))
      .catch(() => setSessions([]));
  }, []);

  const avgScore = sessions.length > 0 ? Math.round(sessions.reduce((s, sess) => s + (sess.score || 0), 0) / sessions.length) : 0;

  return (
    <PortfolioSection id="simulations" title="Executive Simulations™" icon={Cpu} color="#6366f1"
      action={<button onClick={() => navigate('/simulator')} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70"><ExternalLink size={10} /> Simulator</button>}>
      {sessions.length > 0 ? (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl font-bold text-indigo-400">{avgScore}</div>
            <div>
              <div className="text-[10px] text-white/30">Avg Score</div>
              <div className="flex items-center gap-1 text-[10px] text-white/40">{sessions.length} sessions</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {sessions.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-[11px]">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <span className="text-white/60 truncate flex-1">{s.simulation_type || s.title || 'Simulation'}</span>
                <span className="text-white/30">{s.score || '—'}</span>
                <span className="text-white/20 text-[9px]">{s.created_date ? new Date(s.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-white/30 mb-2">No simulation sessions yet.</p>
          <button onClick={() => navigate('/simulator')} className="px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs hover:bg-indigo-500/20">Start Simulation</button>
        </div>
      )}
    </PortfolioSection>
  );
}