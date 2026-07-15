import React from 'react';
import { X, BadgeCheck, CheckCircle2, Circle, Shield, QrCode, Share2, Download, Clock } from 'lucide-react';
import { getLevelMeta, getTypeMeta, CREDENTIAL_CATALOG, evaluateCredential } from '@/lib/credentialEngine';

export default function CredentialDetail({ credential, data, onClose }) {
  if (!credential) return null;
  const level = getLevelMeta(credential.credential_level);
  const type = getTypeMeta(credential.credential_type);
  const catalogEntry = CREDENTIAL_CATALOG.find(c => c.key === credential.credential_key);
  const evaluation = catalogEntry ? evaluateCredential(catalogEntry.key, data || {}) : { met: [], unmet: [] };
  const Icon = type.icon;
  const evidence = (() => { try { return JSON.parse(credential.evidence_summary || '[]'); } catch { return []; } })();
  const reqMet = (() => { try { return JSON.parse(credential.requirements_met || '[]'); } catch { return []; } })();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-[#0d0d14] border-l border-white/5 overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="sticky top-0 bg-[#0d0d14] border-b border-white/5 px-4 py-3 flex items-center justify-between z-10">
          <span className="text-sm font-bold text-white">Credential Details</span>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${level.color}15, transparent)` }}>
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: level.color }} />
            <div className="pl-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={14} style={{ color: type.color }} />
                <span className="text-[10px] uppercase tracking-wider text-white/40">{type.label} Credential</span>
              </div>
              <h2 className="text-lg font-bold text-white">{credential.credential_name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${level.color}20`, color: level.color }}>{level.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 flex items-center gap-1"><BadgeCheck size={10} /> {credential.verification_status}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Overview</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-white/30">Issuer</span><div className="text-white/70">{credential.issuer || 'EXECLEAD.AI'}</div></div>
              <div><span className="text-white/30">Issued</span><div className="text-white/70">{credential.issued_date ? new Date(credential.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</div></div>
              <div><span className="text-white/30">Credential #</span><div className="text-white/70 font-mono text-[10px]">{credential.credential_number}</div></div>
              <div><span className="text-white/30">Renewal</span><div className="text-white/70">{credential.is_permanent ? 'Permanent' : credential.renewal_status}</div></div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Requirements Met</h3>
            {(catalogEntry?.requirements || []).map((req, i) => {
              const isMet = reqMet.includes(req.label) || evaluation.met.some(m => m.id === req.id);
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {isMet ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Circle size={12} className="text-white/20" />}
                  <span className={isMet ? 'text-white/70' : 'text-white/30'}>{req.label}</span>
                </div>
              );
            })}
          </div>

          {evidence.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Supporting Evidence</h3>
              <div className="flex flex-wrap gap-1.5">
                {evidence.map((e, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50">{e}</span>)}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Verification</h3>
            <div className="bg-white/[0.02] rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs"><Shield size={12} className="text-blue-400" /><span className="text-white/30">Hash:</span><span className="text-white/60 font-mono text-[10px] truncate">{credential.credential_hash}</span></div>
              <div className="flex items-center gap-2 text-xs"><QrCode size={12} className="text-white/30" /><span className="text-white/30">URL:</span><span className="text-white/60 text-[10px] truncate">{credential.verification_url}</span></div>
            </div>
          </div>

          {credential.ai_commentary && (
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-medium">AI Commentary</h3>
              <p className="text-xs text-white/50 leading-relaxed">{credential.ai_commentary}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10"><Share2 size={12} /> Share</button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10"><Download size={12} /> Certificate</button>
          </div>
        </div>
      </div>
    </div>
  );
}