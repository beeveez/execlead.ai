import React from 'react';
import { BadgeCheck, Share2, QrCode, Lock } from 'lucide-react';
import { getLevelMeta, getTypeMeta } from '@/lib/credentialEngine';

export default function CredentialWallet({ credentials, onDetail }) {
  if (!credentials || credentials.length === 0) {
    return (
      <div className="text-center py-8">
        <Lock size={28} className="text-white/10 mx-auto mb-2" />
        <p className="text-xs text-white/30">No credentials earned yet. Complete requirements below to earn your first credential.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {credentials.map((cred) => {
        const level = getLevelMeta(cred.credential_level);
        const type = getTypeMeta(cred.credential_type);
        const Icon = type.icon;
        return (
          <button key={cred.id} onClick={() => onDetail(cred)}
            className="text-left bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:bg-white/[0.04] transition-colors relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: level.color }} />
            <div className="pl-2">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <Icon size={12} style={{ color: type.color }} />
                  <span className="text-[8px] uppercase tracking-wider text-white/30">{type.label}</span>
                </div>
                <BadgeCheck size={14} className="text-blue-400 flex-shrink-0" />
              </div>
              <div className="text-xs font-bold text-white/80 mb-1">{cred.credential_name}</div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${level.color}20`, color: level.color }}>{level.label}</span>
                <span className="text-[8px] text-white/20">{cred.verification_status}</span>
              </div>
              <div className="text-[9px] text-white/20 font-mono">{cred.credential_number}</div>
              <div className="text-[9px] text-white/20">{cred.issued_date ? new Date(cred.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}