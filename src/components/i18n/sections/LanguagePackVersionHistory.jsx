import React from 'react';
import { History, GitBranch, CheckCircle2, RotateCcw } from 'lucide-react';

export default function LanguagePackVersionHistory({ history, langName }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <History size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Language Pack Version History™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{langName || 'All'} · {history.length} versions</span>
      </div>

      <div className="space-y-2">
        {history.map((v) => {
          const certColor = v.certificationStatus === 'Certified' ? '#10b981' : v.certificationStatus === 'Needs Review' ? '#f59e0b' : '#6366f1';
          return (
            <div key={v.version} className={`rounded-lg p-3 border ${v.isCurrent ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/[0.02] border-white/5'}`}>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <GitBranch size={14} className={v.isCurrent ? 'text-indigo-400' : 'text-white/30'} />
                  <span className="text-xs text-white font-mono font-medium">{v.version}</span>
                  {v.isCurrent && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">CURRENT</span>}
                </div>
                <span className="text-[10px] text-white/30">{v.releaseDate}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${certColor}15`, color: certColor }}>{v.certificationStatus}</span>
                <span className="text-[10px] text-white/30 ml-auto">{v.lifecycle}</span>
                {v.rollbackAvailable && <span className="flex items-center gap-1 text-[10px] text-emerald-400"><RotateCcw size={10} /> Rollback</span>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                <div className="text-[10px]"><span className="text-white/30">Editor: </span><span className="text-white/60">{v.editor}</span></div>
                <div className="text-[10px]"><span className="text-white/30">Reviewer: </span><span className="text-white/60">{v.reviewer}</span></div>
                <div className="text-[10px]"><span className="text-white/30">Approved: </span><span className="text-white/60">{v.approvedBy}</span></div>
                <div className="text-[10px]"><span className="text-white/30">Coverage: </span><span className="text-white/60">{v.coverage}% {v.coverageChange > 0 ? `(+${v.coverageChange})` : v.coverageChange < 0 ? `(${v.coverageChange})` : ''}</span></div>
                <div className="text-[10px] flex items-center gap-2"><span className="text-white/30">Changes:</span><span className="text-emerald-400">+{v.addedKeys}</span><span className="text-amber-400">~{v.updatedKeys}</span><span className="text-rose-400">-{v.removedKeys}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}