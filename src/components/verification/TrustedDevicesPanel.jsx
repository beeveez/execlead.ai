import React from 'react';
import { Smartphone, Monitor, MapPin, Ban, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export default function TrustedDevicesPanel({ devices, onRevoke, revoking }) {
  const maskIp = (ip) => {
    if (!ip) return '—';
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
    return ip.substring(0, 6) + '****';
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Smartphone size={14} className="text-cyan-400" />
        <span className="text-sm font-bold text-white">Trusted Devices™</span>
        <span className="text-xs text-white/30 ml-auto">{devices?.length || 0} device{(devices?.length || 0) !== 1 ? 's' : ''}</span>
      </div>
      {!devices || devices.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <Smartphone size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">No trusted devices registered yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {devices.map((device) => {
            const isRevoked = device.status === 'revoked' || device.trust_status === 'revoked';
            const isTrusted = device.status === 'trusted' || device.trust_status === 'trusted';
            const Icon = isRevoked ? Ban : isTrusted ? CheckCircle2 : Clock;
            const statusColor = isRevoked ? '#ef4444' : isTrusted ? '#10b981' : '#f59e0b';
            return (
              <div key={device.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Monitor size={15} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{device.device_name || device.browser || 'Unknown Device'}</span>
                    <Icon size={11} style={{ color: statusColor }} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-white/40">
                    <span>{device.operating_system || 'Unknown OS'}</span>
                    <span>·</span>
                    <span>{device.browser || 'Unknown browser'}</span>
                    {device.country && (<><span>·</span><span className="flex items-center gap-0.5"><MapPin size={9} /> {device.city ? `${device.city}, ` : ''}{device.country}</span></>)}
                    <span>·</span>
                    <span>IP: {maskIp(device.ip_address)}</span>
                  </div>
                  <div className="text-[10px] text-white/30 mt-0.5">
                    Last activity: {device.last_used ? new Date(device.last_used).toLocaleString() : '—'}
                    {device.last_activity && ` · ${device.last_activity}`}
                  </div>
                </div>
                {!isRevoked && (
                  <button
                    onClick={() => onRevoke(device.id)}
                    disabled={revoking}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium hover:bg-red-500/20 disabled:opacity-40 transition-colors flex-shrink-0"
                  >
                    <Ban size={11} /> Revoke
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}