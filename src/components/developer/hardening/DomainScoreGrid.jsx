import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Palette, Gauge, ShieldCheck, FlaskConical, Activity, ArrowRight, Clock } from 'lucide-react';

const ICON_MAP = { Palette, Gauge, ShieldCheck, FlaskConical, Activity };

function getStatusStyle(status) {
  switch (status) {
    case 'pass': return { ring: 'border-emerald-500/20', bar: 'bg-emerald-500', text: 'text-emerald-400', label: 'Passing' };
    case 'fail': return { ring: 'border-red-500/20', bar: 'bg-red-500', text: 'text-red-400', label: 'Action Required' };
    case 'pending': return { ring: 'border-amber-500/20', bar: 'bg-amber-500', text: 'text-amber-400', label: 'Audit Pending' };
    default: return { ring: 'border-white/5', bar: 'bg-white/20', text: 'text-white/40', label: '—' };
  }
}

export default function DomainScoreGrid({ domains }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {domains.map((d, i) => {
        const Icon = ICON_MAP[d.icon] || Activity;
        const style = getStatusStyle(d.status);
        return (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`relative bg-white/[0.02] border ${style.ring} rounded-2xl p-5 overflow-hidden`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                <Icon size={16} className={style.text} />
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${style.bar} bg-opacity-10 ${style.text}`}>
                Phase {d.phase}
              </span>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">{d.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              {d.score !== null ? (
                <>
                  <span className={`text-2xl font-bold ${style.text}`}>{d.score}</span>
                  <span className="text-white/20 text-xs">/ {d.target}</span>
                </>
              ) : (
                <span className="text-amber-400 text-sm font-medium flex items-center gap-1">
                  <Clock size={12} /> Pending
                </span>
              )}
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full ${style.bar} transition-all`} style={{ width: d.score !== null ? `${d.score}%` : '0%' }} />
            </div>
            <div className={`text-[10px] ${style.text} font-medium`}>{style.label}</div>
            {d.deepLink && (
              <Link to={d.deepLink} className="absolute top-3 right-3 text-white/20 hover:text-white/60 transition-colors">
                <ArrowRight size={12} />
              </Link>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}