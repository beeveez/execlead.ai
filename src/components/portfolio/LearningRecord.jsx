import React from 'react';
import { GraduationCap, Award, Clock, Download, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PortfolioSection from './PortfolioSection';

export default function LearningRecord({ data }) {
  const navigate = useNavigate();
  const lessons = data.lessons || [];
  const completed = lessons.filter(l => l.completed);
  const certs = data.certificates || [];
  const totalHours = lessons.reduce((s, l) => s + (l.time_spent_minutes || 0), 0);

  return (
    <PortfolioSection id="learning" title="Executive Learning Record™" icon={GraduationCap} color="#8b5cf6"
      action={<button onClick={() => navigate('/academy')} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70"><ExternalLink size={10} /> Academy</button>}>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-purple-400">{completed.length}</div>
          <div className="text-[8px] text-white/30 uppercase">Completed</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-purple-400">{certs.length}</div>
          <div className="text-[8px] text-white/30 uppercase">Certificates</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-purple-400">{Math.round(totalHours / 60)}</div>
          <div className="text-[8px] text-white/30 uppercase">Hours</div>
        </div>
      </div>
      {completed.length > 0 ? (
        <div className="space-y-1.5">
          {completed.slice(0, 5).map((l) => (
            <div key={l.id} className="flex items-center gap-2 text-[11px]">
              <Award size={12} className="text-purple-400 flex-shrink-0" />
              <span className="text-white/60 truncate flex-1">{l.lesson_title || l.title || 'Lesson'}</span>
              {l.completion_percentage && <span className="text-white/30">{l.completion_percentage}%</span>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/30 text-center py-2">No learning records yet. Visit the Academy to start.</p>
      )}
    </PortfolioSection>
  );
}