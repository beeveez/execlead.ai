import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';

function formatValue(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (typeof value === 'number') return value.toString();
  return String(value);
}

export default function QualityGateList({ gates }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Automated Quality Gates™</h3>
        <span className="text-white/30 text-xs">Platform cannot progress to RC2 until all gates pass</span>
      </div>
      <div className="space-y-2">
        {gates.map((g) => (
          <div key={g.id} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${
            g.passed ? 'bg-emerald-500/5 border-emerald-500/10'
            : g.pending ? 'bg-amber-500/5 border-amber-500/10'
            : 'bg-red-500/5 border-red-500/10'
          }`}>
            {g.passed ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            : g.pending ? <Clock size={16} className="text-amber-400 flex-shrink-0" />
            : <XCircle size={16} className="text-red-400 flex-shrink-0" />}
            <span className={`text-sm flex-1 ${g.passed ? 'text-white/70' : g.pending ? 'text-white/50' : 'text-white/70'}`}>
              {g.label}
            </span>
            {!g.pending && (
              <span className={`text-xs font-medium ${
                g.passed ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {formatValue(g.value)}
              </span>
            )}
            {g.pending && <span className="text-xs text-amber-400">Pending</span>}
            {g.deepLink && (
              <Link to={g.deepLink} className="text-white/20 hover:text-white/50 transition-colors">
                <ArrowRight size={12} />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}