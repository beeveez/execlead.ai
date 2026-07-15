import React, { useMemo } from 'react';
import { Calendar, AlertTriangle, Clock, CheckCircle2, CalendarClock, Ban } from 'lucide-react';
import { getUpcomingExpirations, getExpirationStatus, getEvidenceTypeMeta, resolveEvidenceType } from '@/lib/evidenceVaultEngine';

const STATUS_ICONS = { expired: Ban, expiring_soon: AlertTriangle, expiring: Clock, active: CheckCircle2, permanent: CalendarClock };

export default function EvidenceExpirationDashboard({ evidenceItems }) {
  const items = useMemo(() => {
    if (!evidenceItems) return [];
    return evidenceItems
      .map(e => ({ evidence: e, status: getExpirationStatus(e) }))
      .sort((a, b) => {
        const order = { expired: 0, expiring_soon: 1, expiring: 2, active: 3, permanent: 4 };
        return (order[a.status.status] || 5) - (order[b.status.status] || 5);
      });
  }, [evidenceItems]);

  const expired = items.filter(i => i.status.status === 'expired');
  const expiringSoon = items.filter(i => i.status.status === 'expiring_soon');
  const expiring = items.filter(i => i.status.status === 'expiring');
  const active = items.filter(i => i.status.status === 'active');
  const permanent = items.filter(i => i.status.status === 'permanent');

  const summary = [
    { label: 'Expired', count: expired.length, color: '#ef4444', items: expired },
    { label: 'Expiring Soon (≤30d)', count: expiringSoon.length, color: '#f59e0b', items: expiringSoon },
    { label: 'Expiring (≤90d)', count: expiring.length, color: '#f97316', items: expiring },
    { label: 'Active', count: active.length, color: '#10b981', items: active },
    { label: 'No Expiration', count: permanent.length, color: '#6366f1', items: permanent },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} className="text-amber-400" />
        <span className="text-sm font-bold text-white">Evidence Expiration Dashboard™</span>
        <span className="text-[10px] text-white/30 ml-auto">{items.length} total</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        {summary.map((s) => (
          <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-[9px] text-white/40 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Detailed list */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 max-h-[400px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-6">
            <Calendar size={24} className="text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/30">No evidence items to track.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map(({ evidence, status }, idx) => {
              const typeMeta = getEvidenceTypeMeta(resolveEvidenceType(evidence));
              const StatusIcon = STATUS_ICONS[status.status] || Clock;
              return (
                <div key={evidence.id || idx} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-b-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: typeMeta.color + '15' }}>
                    <StatusIcon size={12} style={{ color: status.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/70 truncate">{evidence.title}</div>
                    <div className="text-[10px] text-white/30">{typeMeta.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-medium" style={{ color: status.color }}>{status.label}</div>
                    {status.days !== null && (
                      <div className="text-[10px] text-white/30">
                        {status.days < 0 ? `${Math.abs(status.days)}d ago` : `${status.days}d left`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}