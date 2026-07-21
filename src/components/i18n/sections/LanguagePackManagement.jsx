import React, { useState } from 'react';
import { Package, ChevronRight, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const LIFECYCLE_COLORS = {
  Production: '#10b981', Certified: '#06b6d4', Approved: '#6366f1',
  Review: '#f59e0b', Draft: '#f97316', Deprecated: '#ef4444', Archived: '#6b7280', Rollback: '#a855f7',
};

export default function LanguagePackManagement({ packs, onSelectPack }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (code) => {
    setSelected(code);
    onSelectPack?.(code);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Package size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Language Pack Management™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{packs.length} packs · {packs.filter((p) => p.certification === 'Certified').length} certified</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/30 text-[10px] uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 px-2">Language</th>
              <th className="text-left py-2 px-2">Version</th>
              <th className="text-left py-2 px-2">Coverage</th>
              <th className="text-left py-2 px-2">Certification</th>
              <th className="text-left py-2 px-2">Lifecycle</th>
              <th className="text-left py-2 px-2">Owner</th>
              <th className="text-left py-2 px-2">Release Date</th>
              <th className="text-left py-2 px-2">Last Updated</th>
              <th className="text-left py-2 px-2">Review</th>
              <th className="py-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {packs.map((pack) => {
              const covColor = pack.coverage >= 95 ? '#10b981' : pack.coverage >= 80 ? '#f59e0b' : '#ef4444';
              const certColor = pack.certification === 'Certified' ? '#10b981' : pack.certification === 'Needs Review' ? '#f59e0b' : '#6366f1';
              const lifeColor = LIFECYCLE_COLORS[pack.lifecycle] || '#6b7280';
              const isSelected = selected === pack.code;
              return (
                <tr key={pack.code} onClick={() => handleSelect(pack.code)} className={`border-b border-white/[0.02] cursor-pointer transition-colors ${isSelected ? 'bg-indigo-500/5' : 'hover:bg-white/[0.02]'}`}>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{pack.flag}</span>
                      <div>
                        <div className="text-white font-medium">{pack.name}</div>
                        <div className="text-[9px] text-white/30">{pack.code}{pack.canonical && ' · Canonical'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-white/60 font-mono">{pack.version}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1 bg-white/5 rounded-full"><div className="h-full rounded-full" style={{ width: `${pack.coverage}%`, backgroundColor: covColor }} /></div>
                      <span style={{ color: covColor }}>{pack.coverage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2"><span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${certColor}15`, color: certColor }}>{pack.certification}</span></td>
                  <td className="py-2.5 px-2"><span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${lifeColor}15`, color: lifeColor }}>{pack.lifecycle}</span></td>
                  <td className="py-2.5 px-2 text-white/50">{pack.owner}</td>
                  <td className="py-2.5 px-2 text-white/40">{pack.releaseDate}</td>
                  <td className="py-2.5 px-2 text-white/40">{pack.lastUpdated}</td>
                  <td className="py-2.5 px-2">
                    {pack.reviewStatus === 'Approved' ? <CheckCircle2 size={12} className="text-emerald-400" /> : pack.reviewStatus === 'In Review' ? <Clock size={12} className="text-amber-400" /> : <AlertTriangle size={12} className="text-white/30" />}
                  </td>
                  <td className="py-2.5 px-2"><ChevronRight size={12} className="text-white/20" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}