import React from 'react';
import { Briefcase, FileText, Download, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PortfolioSection from './PortfolioSection';

const ASSETS = [
  { label: 'Resume Builder™', path: '/resume', icon: FileText },
  { label: 'Cover Letter™', path: '/career-studio', icon: FileText },
  { label: 'Interview Portfolio', path: '/simulator', icon: Briefcase },
  { label: 'Executive Biography', path: '/career-studio', icon: FileText },
];

export default function CareerAssets({ data }) {
  const navigate = useNavigate();
  const resumes = data.resumes || [];

  return (
    <PortfolioSection id="career-assets" title="Career Assets™" icon={Briefcase} color="#6366f1"
      action={<button onClick={() => navigate('/career-studio')} className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70"><ExternalLink size={10} /> Studio</button>}>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {ASSETS.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-left hover:bg-white/[0.05] transition-colors">
              <Icon size={14} className="text-indigo-400 flex-shrink-0" />
              <span className="text-[10px] text-white/60 truncate">{a.label}</span>
            </button>
          );
        })}
      </div>
      {resumes.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Resume Versions</div>
          {resumes.slice(0, 3).map((r) => (
            <div key={r.id} className="flex items-center gap-2 text-[11px]">
              <FileText size={12} className="text-white/30 flex-shrink-0" />
              <span className="text-white/60 truncate flex-1">{r.title || r.version_name || 'Resume'}</span>
              <span className="text-[9px] text-white/20">{r.created_date ? new Date(r.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/30 text-center py-1">No resume versions yet.</p>
      )}
    </PortfolioSection>
  );
}