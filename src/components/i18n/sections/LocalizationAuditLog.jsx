import React from 'react';
import { ScrollText, Globe, User, Clock, CheckCircle2 } from 'lucide-react';

const TYPE_COLORS = {
  language_change: '#6366f1', translation_update: '#06b6d4', reviewer_action: '#8b5cf6',
  certification: '#10b981', publication: '#f59e0b', rollback: '#ef4444',
  policy_change: '#f97316', language_preference: '#6366f1',
};

const TYPE_ICONS = {
  language_change: Globe, translation_update: ScrollText, reviewer_action: User,
  certification: CheckCircle2, publication: Clock, rollback: ScrollText,
  policy_change: ScrollText, language_preference: Globe,
};

export default function LocalizationAuditLog({ logs }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Localization Audit Log™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{logs.length} entries</span>
      </div>

      <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
        {logs.map((log) => {
          const color = TYPE_COLORS[log.type] || '#6b7280';
          const Icon = TYPE_ICONS[log.type] || ScrollText;
          return (
            <div key={log.id} className="flex items-start gap-3 bg-white/[0.02] rounded-lg p-3 border border-white/5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                <Icon size={13} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-white font-medium">{log.action}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}15`, color }}>{log.type.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">{log.details}</div>
                <div className="flex items-center gap-2 mt-1 text-[9px] text-white/30">
                  <User size={9} /> {log.actor}
                  <Clock size={9} /> {new Date(log.timestamp).toLocaleString()}
                  <Globe size={9} /> {log.language}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}